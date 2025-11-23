'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useUserInfo, useIsAdmin, useUserIdByAddress } from '@/hooks/useContractReads';
import { UserStatus } from '@/contracts/config';
import { validateUserInfo, validateUserInfoTuple } from '@/lib/validation';
import type { UserInfo } from '@/types';

type AuthContextType = {
  isAdmin: boolean;
  isApproved: boolean;
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  isLoading: boolean;
  refetchUserData: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  
  // PASO 1: Verificar si es admin PRIMERO (esto es lo más importante)
  const { data: isAdminData, isLoading: isLoadingAdmin, error: adminError, refetch: refetchAdmin } = useIsAdmin(address);
  
  // PASO 2: Solo si NO es admin, verificar registro
  // Estas consultas solo se ejecutan si sabemos que NO es admin
  const shouldCheckRegistration = isConnected && !isLoadingAdmin && isAdminData === false;
  const { data: userId, isLoading: isLoadingUserId, refetch: refetchUserId } = useUserIdByAddress(
    shouldCheckRegistration ? address : undefined
  );
  const { data: rawUserInfo, isLoading: isLoadingUser, error: userInfoError, refetch: refetchUserInfo } = useUserInfo(
    shouldCheckRegistration ? address : undefined
  );
  
  // Función para refrescar todos los datos del usuario
  // Usar useCallback para evitar recreaciones innecesarias
  const refetchUserData = useCallback(() => {
    console.log('AuthContext: Refetching user data...');
    // Refrescar todas las consultas relacionadas con el usuario
    refetchAdmin();
    if (shouldCheckRegistration) {
      refetchUserId();
      refetchUserInfo();
    }
  }, [refetchAdmin, refetchUserId, refetchUserInfo, shouldCheckRegistration]);
  
  const [authState, setAuthState] = useState<AuthContextType>({
    isAdmin: false,
    isApproved: false,
    isAuthenticated: false,
    userInfo: null,
    isLoading: true,
    refetchUserData,
  });

  useEffect(() => {
    console.log('AuthContext effect:', {
      isConnected,
      address,
      isLoadingAdmin,
      isLoadingUserId,
      isLoadingUser,
      isAdminData,
      userId,
      rawUserInfo,
      adminError,
      userInfoError
    });

    if (!isConnected) {
      console.log('AuthContext: No conectado, seteando estados en false');
      setAuthState({
        isAdmin: false,
        isApproved: false,
        isAuthenticated: false,
        userInfo: null,
        isLoading: false,
        refetchUserData,
      });
      return;
    }

    // ============================================
    // LÓGICA 1: Si es admin → NO verificar registro
    // ============================================
    const isAdmin = isAdminData === true;
    
    if (isAdmin) {
      // Admin: autenticado inmediatamente, NO verificamos registro
      if (isLoadingAdmin) {
        console.log('AuthContext: Esperando confirmación de admin...');
        setAuthState(prev => ({ ...prev, isLoading: true }));
        return;
      }

      console.log('AuthContext: Usuario es admin, autenticando directamente (sin verificar registro)');
      
      // Restaurar preferencia de tema del usuario específico si existe
      if (address) {
        const userThemeKey = `theme_${address.toLowerCase()}`
        const userPreference = localStorage.getItem(userThemeKey) as 'light' | 'dark' | null
        if (userPreference) {
          if (userPreference === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        } else {
          document.documentElement.classList.remove('dark')
        }
      }
      
      setAuthState({
        isAdmin: true,
        isApproved: false, // Admin no necesita aprobación
        isAuthenticated: true,
        userInfo: null, // Admin no tiene userInfo (no está registrado como usuario)
        isLoading: false,
        refetchUserData,
      });
      return;
    }

    // ============================================
    // LÓGICA 2: Si NO es admin → verificar registro
    // ============================================
    // Solo llegamos aquí si sabemos que NO es admin
    
    // CRÍTICO: Si userId ya está disponible y es 0, el usuario NO está registrado
    // NO esperar a que terminen todas las consultas - determinar inmediatamente
    if (userId !== undefined && userId === BigInt(0)) {
      console.log('AuthContext: Usuario no registrado (userId = 0) - determinando inmediatamente');
      setAuthState({
        isAdmin: false,
        isApproved: false,
        isAuthenticated: false,
        userInfo: null,
        isLoading: false,
        refetchUserData,
      });
      return;
    }
    
    // CRÍTICO: Si hay error en useUserInfo, el usuario no existe
    // NO esperar más - determinar inmediatamente
    if (userInfoError) {
      console.log('AuthContext: Error al obtener userInfo (usuario no existe) - determinando inmediatamente');
      setAuthState({
        isAdmin: false,
        isApproved: false,
        isAuthenticated: false,
        userInfo: null,
        isLoading: false,
        refetchUserData,
      });
      return;
    }

    // Esperar por las consultas de registro si aún están cargando
    // Solo si NO sabemos aún si el usuario está registrado
    if (isLoadingAdmin || isLoadingUserId || isLoadingUser) {
      console.log('AuthContext: Verificando registro...', { isLoadingAdmin, isLoadingUserId, isLoadingUser });
      setAuthState(prev => ({ ...prev, isLoading: true }));
      return;
    }

    // Si userId es undefined después de que terminaron las consultas, el usuario NO está registrado
    if (userId === undefined || userId === BigInt(0)) {
      console.log('AuthContext: Usuario no registrado (userId = 0 o undefined después de consultas)');
      setAuthState({
        isAdmin: false,
        isApproved: false,
        isAuthenticated: false,
        userInfo: null,
        isLoading: false,
        refetchUserData,
      });
      return;
    }

    console.log('AuthContext: Carga completa, procesando datos de usuario registrado...');
    
    // Validación robusta de userInfo
    const userInfo = rawUserInfo
      ? (Array.isArray(rawUserInfo)
          ? validateUserInfoTuple(rawUserInfo)
          : validateUserInfo(rawUserInfo))
      : null;
    
    // Si no hay userInfo pero userId existe, algo está mal - tratar como no autenticado
    if (!userInfo && userId && typeof userId === 'bigint' && userId > BigInt(0)) {
      console.log('AuthContext: userId existe pero userInfo es null, marcando como no autenticado');
      setAuthState({
        isAdmin: false,
        isApproved: false,
        isAuthenticated: false,
        userInfo: null,
        isLoading: false,
        refetchUserData,
      });
      return;
    }
    
    // ============================================
    // LÓGICA 3: Usuario registrado → verificar estatus
    // ============================================
    // userInfo contiene: id, userAddress, role, status
    // El status puede ser: Pending, Approved, Rejected, Canceled
    const userStatus = userInfo ? Number(userInfo.status) : null;
    const isApproved = userStatus === UserStatus.Approved;
    const isAuthenticated = isApproved; // Solo aprobados están autenticados
    
    // IMPORTANTE: Incluir userInfo incluso si no está aprobado
    // para que las páginas puedan mostrar el estatus (Pending, Rejected, Canceled)

    // Si el usuario está aprobado, restaurar su preferencia de tema específica
    if (isApproved && address) {
      const userThemeKey = `theme_${address.toLowerCase()}`
      const userPreference = localStorage.getItem(userThemeKey) as 'light' | 'dark' | null
      if (userPreference) {
        if (userPreference === 'dark') {
          document.documentElement.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
        }
      } else {
        // Si no hay preferencia, usar claro por defecto
        document.documentElement.classList.remove('dark')
      }
    }

    const userStatusName = userStatus !== null ? UserStatus[userStatus] : 'Unknown';
    console.log('AuthContext: Resultado final (usuario registrado):', {
      isAdmin: false,
      isApproved,
      isAuthenticated,
      userStatus: userStatusName, // Pending, Approved, Rejected, o Canceled
      userInfo // Incluido siempre para mostrar estatus
    });

    // Incluir userInfo incluso si no está aprobado para mostrar estatus (Pending, Rejected, Canceled)
    setAuthState({
      isAdmin: false,
      isApproved,
      isAuthenticated,
      userInfo, // Siempre incluido para que las páginas puedan mostrar el estatus
      isLoading: false,
      refetchUserData,
    });
  }, [isConnected, isAdminData, userId, rawUserInfo, isLoadingAdmin, isLoadingUserId, isLoadingUser, address, adminError, userInfoError, refetchUserData]);

  console.log('AuthContext: Estado actual:', authState);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.log('useAuth: Contexto no disponible, devolviendo defaults');
    // Devolver valores por defecto en lugar de lanzar error durante SSR o antes del mount
    return {
      isAdmin: false,
      isApproved: false,
      isAuthenticated: false,
      userInfo: null,
      isLoading: true,
      refetchUserData: () => {}, // Función vacía por defecto
    };
  }
  return context;
}
