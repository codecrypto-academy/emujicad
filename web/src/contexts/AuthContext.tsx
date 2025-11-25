'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useUserInfo, useIsAdmin, useUserIdByAddress } from '@/hooks/useContractReads';
import { UserStatus } from '@/contracts/config';
import { validateUserInfo, validateUserInfoTuple } from '@/lib/validation';
import type { UserInfo } from '@/types';

// Funciones helper para localStorage
function getUserInfoKey(address: string): string {
  return `userInfo_${address.toLowerCase()}`
}

function storeUserInfo(address: string, userInfo: UserInfo): void {
  if (typeof window === 'undefined') return
  try {
    const key = getUserInfoKey(address)
    const data = {
      id: userInfo.id.toString(),
      userAddress: userInfo.userAddress,
      role: userInfo.role.toString(),
      status: userInfo.status.toString(),
    }
    localStorage.setItem(key, JSON.stringify(data))
    console.log('💾 [AuthContext] userInfo guardado en localStorage:', key)
  } catch (error) {
    console.error('❌ [AuthContext] Error guardando userInfo en localStorage:', error)
  }
}

function getStoredUserInfo(address: string): UserInfo | null {
  if (typeof window === 'undefined') return null
  try {
    const key = getUserInfoKey(address)
    const stored = localStorage.getItem(key)
    if (!stored) return null
    
    const data = JSON.parse(stored)
    const userInfo: UserInfo = {
      id: BigInt(data.id),
      userAddress: data.userAddress,
      role: BigInt(data.role),
      status: BigInt(data.status),
    }
    
    // Validar que la dirección coincida
    if (userInfo.userAddress.toLowerCase() !== address.toLowerCase()) {
      console.warn('⚠️ [AuthContext] Dirección en localStorage no coincide, limpiando')
      localStorage.removeItem(key)
      return null
    }
    
    console.log('📦 [AuthContext] userInfo cargado de localStorage:', key)
    return userInfo
  } catch (error) {
    console.error('❌ [AuthContext] Error cargando userInfo de localStorage:', error)
    return null
  }
}

function clearStoredUserInfo(address: string): void {
  if (typeof window === 'undefined') return
  try {
    const key = getUserInfoKey(address)
    localStorage.removeItem(key)
    console.log('🗑️ [AuthContext] userInfo eliminado de localStorage:', key)
  } catch (error) {
    console.error('❌ [AuthContext] Error eliminando userInfo de localStorage:', error)
  }
}

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
      // Limpiar localStorage cuando se desconecta
      if (address) {
        clearStoredUserInfo(address)
      }
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
      // Limpiar localStorage si existe información antigua
      if (address) {
        clearStoredUserInfo(address)
      }
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
    
    // Si userId existe pero aún no tenemos userInfo del contrato, intentar cargar del localStorage
    // Esto es útil justo después de registrar un usuario, antes de que el refetch complete
    if (userId !== undefined && userId > BigInt(0) && !rawUserInfo && address && isLoadingUser) {
      const storedUserInfo = getStoredUserInfo(address)
      if (storedUserInfo && storedUserInfo.id === userId) {
        console.log('AuthContext: ⚡ Usando userInfo del localStorage mientras se carga del contrato')
        const userStatus = Number(storedUserInfo.status)
        const isApproved = userStatus === UserStatus.Approved
        setAuthState({
          isAdmin: false,
          isApproved,
          isAuthenticated: isApproved,
          userInfo: storedUserInfo,
          isLoading: false, // Ya tenemos la info, no necesitamos esperar
          refetchUserData,
        })
        return
      }
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

    // CRÍTICO: Intentar cargar del localStorage ANTES de esperar las consultas del contrato
    // Esto permite mostrar el ApprovalPendingCard inmediatamente al refrescar la página
    if (address && (isLoadingAdmin || isLoadingUserId || isLoadingUser)) {
      const storedUserInfo = getStoredUserInfo(address)
      if (storedUserInfo) {
        console.log('AuthContext: ⚡ Cargando userInfo del localStorage mientras se consulta el contrato')
        const userStatus = Number(storedUserInfo.status)
        const isApproved = userStatus === UserStatus.Approved
        setAuthState({
          isAdmin: false,
          isApproved,
          isAuthenticated: isApproved,
          userInfo: storedUserInfo,
          isLoading: false, // Ya tenemos la info del localStorage, mostrar inmediatamente
          refetchUserData,
        })
        // Continuar con las consultas del contrato en segundo plano para actualizar si es necesario
        return
      }
    }
    
    // Esperar por las consultas de registro si aún están cargando
    // Solo si NO sabemos aún si el usuario está registrado Y no hay info en localStorage
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
    let userInfo = rawUserInfo
      ? (Array.isArray(rawUserInfo)
          ? validateUserInfoTuple(rawUserInfo)
          : validateUserInfo(rawUserInfo))
      : null;
    
    // Si no hay userInfo pero userId existe, intentar cargar del localStorage
    if (!userInfo && userId && typeof userId === 'bigint' && userId > BigInt(0) && address) {
      console.log('AuthContext: userId existe pero userInfo es null, intentando cargar del localStorage');
      const storedUserInfo = getStoredUserInfo(address)
      if (storedUserInfo && storedUserInfo.id === userId) {
        console.log('AuthContext: ✅ userInfo encontrado en localStorage, usando datos guardados')
        userInfo = storedUserInfo
      }
    }
    
    // Si no hay userInfo pero userId existe, algo está mal - tratar como no autenticado
    if (!userInfo && userId && typeof userId === 'bigint' && userId > BigInt(0)) {
      console.log('AuthContext: userId existe pero userInfo es null (ni del contrato ni del localStorage), marcando como no autenticado');
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
    
    // IMPORTANTE: Guardar userInfo en localStorage cuando se obtiene del contrato
    // Esto evita llamadas adicionales al contrato mientras el usuario está conectado
    if (userInfo && address && rawUserInfo) {
      // Solo guardar si viene del contrato (rawUserInfo existe), no si viene del localStorage
      console.log('AuthContext: 💾 Guardando userInfo en localStorage para evitar refetches innecesarios')
      storeUserInfo(address, userInfo)
    }
    
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
