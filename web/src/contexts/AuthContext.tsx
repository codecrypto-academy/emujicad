'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAccount } from 'wagmi';
import { useUserInfo, useIsAdmin, useUserIdByAddress } from '@/hooks/useContractReads';
import { UserStatus } from '@/contracts/config';

type UserInfo = {
  id: bigint;
  userAddress: string;
  role: bigint;
  status: bigint;
  registrationDate: bigint;
};

type AuthContextType = {
  isAdmin: boolean;
  isApproved: boolean;
  isAuthenticated: boolean;
  userInfo: UserInfo | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount();
  
  // Consultar datos - usar useUserIdByAddress para detectar rápidamente si el usuario existe
  const { data: isAdminData, isLoading: isLoadingAdmin, error: adminError } = useIsAdmin(address);
  const { data: userId, isLoading: isLoadingUserId } = useUserIdByAddress(address);
  const { data: rawUserInfo, isLoading: isLoadingUser, error: userInfoError } = useUserInfo(address);
  
  const [authState, setAuthState] = useState<AuthContextType>({
    isAdmin: false,
    isApproved: false,
    isAuthenticated: false,
    userInfo: null,
    isLoading: true,
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
      });
      return;
    }

    // Si el usuario es admin, no necesitamos esperar por useUserInfo
    // El admin puede no estar registrado como usuario en el contrato
    const isAdmin = isAdminData === true;
    
    if (isAdmin) {
      // Admin: autenticado inmediatamente, no esperamos por userInfo
      if (isLoadingAdmin) {
        console.log('AuthContext: Esperando confirmación de admin...');
        setAuthState(prev => ({ ...prev, isLoading: true }));
        return;
      }

      console.log('AuthContext: Usuario es admin, autenticando directamente');
      
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
          // Si no hay preferencia, usar claro por defecto
          document.documentElement.classList.remove('dark')
        }
      }
      
      setAuthState({
        isAdmin: true,
        isApproved: false, // Admin no necesita aprobación
        isAuthenticated: true,
        userInfo: null, // Admin puede no tener userInfo
        isLoading: false,
      });
      return;
    }

    // Usuario no admin: optimización para detectar rápidamente usuarios no registrados
    // Si ya sabemos que no es admin y el userId es 0 o hay error, el usuario no existe
    if (!isLoadingAdmin && isAdminData === false) {
      // Ya sabemos que no es admin
      if (!isLoadingUserId) {
        // Si userId es 0 o undefined, el usuario no está registrado
        if (userId === undefined || userId === 0n) {
          console.log('AuthContext: Usuario no registrado (userId = 0), marcando como no autenticado');
          setAuthState({
            isAdmin: false,
            isApproved: false,
            isAuthenticated: false,
            userInfo: null,
            isLoading: false,
          });
          return;
        }
      }
      
      // Si hay error en useUserInfo, el usuario no existe
      if (userInfoError) {
        console.log('AuthContext: Error al obtener userInfo (usuario no existe), marcando como no autenticado');
        setAuthState({
          isAdmin: false,
          isApproved: false,
          isAuthenticated: false,
          userInfo: null,
          isLoading: false,
        });
        return;
      }
    }

    // Esperar por las consultas si aún están cargando
    if (isLoadingAdmin || isLoadingUserId || isLoadingUser) {
      console.log('AuthContext: Aún cargando...', { isLoadingAdmin, isLoadingUserId, isLoadingUser });
      setAuthState(prev => ({ ...prev, isLoading: true }));
      return;
    }

    console.log('AuthContext: Carga completa, procesando datos...');
    const userInfo = rawUserInfo as UserInfo | null;
    
    // Si no hay userInfo pero userId existe, algo está mal - tratar como no autenticado
    if (!userInfo && userId && userId > 0n) {
      console.log('AuthContext: userId existe pero userInfo es null, marcando como no autenticado');
      setAuthState({
        isAdmin: false,
        isApproved: false,
        isAuthenticated: false,
        userInfo: null,
        isLoading: false,
      });
      return;
    }
    
    const isApproved = userInfo ? Number(userInfo.status) === UserStatus.Approved : false;
    const isAuthenticated = isApproved;

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

    console.log('AuthContext: Resultado final:', {
      isAdmin: false,
      isApproved,
      isAuthenticated,
      userInfo
    });

    setAuthState({
      isAdmin: false,
      isApproved,
      isAuthenticated,
      userInfo,
      isLoading: false,
    });
  }, [isConnected, isAdminData, userId, rawUserInfo, isLoadingAdmin, isLoadingUserId, isLoadingUser, address, adminError, userInfoError]);

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
    };
  }
  return context;
}
