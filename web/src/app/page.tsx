'use client'

import { ConnectWallet } from '@/components/ConnectWallet'
import { Header } from '@/components/Header'
import { RegisterForm } from '@/components/RegisterForm'
import { ChangeRoleDialog } from '@/components/ChangeRoleDialog'
import { useAccount } from 'wagmi'
import { useUserInfo } from '@/hooks/useContractReads'
import { useContractOwner } from '@/hooks/useContractOwner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserStatus } from '@/contracts/config'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { validateUserInfo, validateUserInfoTuple } from '@/lib/validation'
import type { UserInfo } from '@/types'

export default function Home() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  
  // Activar diseño moderno si está habilitado
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'
  
  // Detección de roles
  const { owner, isLoading: isLoadingOwner, error: ownerError } = useContractOwner()
  const { data: rawUserInfo, isLoading: isLoadingUser, error: userInfoError, refetch: refetchUserInfo } = useUserInfo(address)
  
  // Validación robusta de userInfo
  // Try tuple format first (array from contract), then object format
  const userInfo = rawUserInfo 
    ? (Array.isArray(rawUserInfo) 
        ? validateUserInfoTuple(rawUserInfo)
        : validateUserInfo(rawUserInfo))
    : undefined

  // Debug logging en desarrollo
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && address) {
      console.log('[page.tsx] User Info Debug:', {
        address,
        rawUserInfo,
        userInfo,
        userInfoError: userInfoError?.message,
        isLoadingUser,
        isValidated: !!userInfo,
      })
    }
  }, [address, rawUserInfo, userInfo, userInfoError, isLoadingUser])
  
  // Evitar hydration mismatch
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Refetch user info cuando cambia la dirección
  useEffect(() => {
    if (address && mounted) {
      refetchUserInfo()
    }
  }, [address, mounted, refetchUserInfo])
  
  // Verificar si es admin
  const isAdmin = address && owner && address.toLowerCase() === owner.toLowerCase()
  const isApproved = userInfo && Number(userInfo.status) === UserStatus.Approved

  // Forzar modo claro cuando no hay usuario conectado o cuando el usuario no está autorizado
  useEffect(() => {
    if (!mounted) return
    
    // Si no está conectado, forzar modo claro (las preferencias se mantienen guardadas por usuario)
    if (!isConnected) {
      document.documentElement.classList.remove('dark')
      return
    }
    
    // Si está conectado pero no es admin ni aprobado, forzar modo claro
    if (isConnected && !isLoadingOwner && !isLoadingUser) {
      if (!isAdmin && !isApproved) {
        // Forzar modo claro para usuarios no autorizados
        document.documentElement.classList.remove('dark')
      } else if (address) {
        // Si es admin o aprobado, restaurar su preferencia guardada específica
        const userThemeKey = `theme_${address.toLowerCase()}`
        const userPreference = localStorage.getItem(userThemeKey) as 'light' | 'dark' | null
        if (userPreference) {
          if (userPreference === 'dark') {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        } else {
          // Si no hay preferencia guardada, usar claro por defecto
          document.documentElement.classList.remove('dark')
        }
      }
    }
  }, [mounted, isConnected, isAdmin, isApproved, isLoadingOwner, isLoadingUser, address])

  // Redirigir usuarios autorizados al dashboard
  useEffect(() => {
    if (mounted && isConnected && (isAdmin || isApproved)) {
      router.push('/dashboard')
    }
  }, [mounted, isConnected, isAdmin, isApproved, router])
  
  // Helpers para UI
  const getRoleName = (roleNumber: number): string => {
    const roleNames: Record<number, string> = {
      0: 'Producer',
      1: 'Factory',
      2: 'Retailer',
      3: 'Consumer',
    }
    return roleNames[roleNumber] || 'Unknown'
  }

  const getRoleIcon = (roleNumber: number) => {
    const roleName = getRoleName(roleNumber)
    const icons: Record<string, string> = {
      Producer: '👨‍🌾',
      Factory: '🏭',
      Retailer: '🏪',
      Consumer: '🛒',
    }
    return icons[roleName] || '👤'
  }
  
  const getStatusBadge = (status: number) => {
    const statusConfig = {
      [UserStatus.Pending]: { label: 'Pending', variant: 'secondary' as const },
      [UserStatus.Approved]: { label: 'Approved', variant: 'default' as const },
      [UserStatus.Rejected]: { label: 'Rejected', variant: 'destructive' as const },
      [UserStatus.Canceled]: { label: 'Canceled', variant: 'outline' as const },
    }
    return statusConfig[status as UserStatus] || { label: 'Unknown', variant: 'outline' as const }
  }

  if (!mounted) {
    return null
  }

  // Si está conectado y es admin o aprobado, se redirigirá automáticamente
  if (isConnected && (isAdmin || isApproved)) {
    return null // Evitar flash de contenido antes de redirigir
  }

  // Diseño moderno 2025
  if (useModernDesign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        {/* Header solo para usuarios conectados */}
        {isConnected && <Header />}

        <main className="container mx-auto px-4 py-12 max-w-6xl">
          {/* App Branding Moderno (solo cuando NO está conectado) */}
          {!isConnected && (
            <div className="group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl p-8 mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative flex items-center gap-6">
                <div className="text-6xl animate-bounce">📦</div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 dark:from-slate-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-2">
                    Supply Chain Tracker
                  </h1>
                  <p className="text-lg text-slate-600 dark:text-slate-400">Blockchain-based supply chain management</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Messages Modernos */}
          {ownerError && (
            <div className="rounded-2xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur-xl border border-red-200 dark:border-red-800 p-6 mb-6 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">⚠️ Error Loading Data</h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                {ownerError?.message || 'Failed to load contract information. Please try again.'}
              </p>
            </div>
          )}
          {userInfoError && 
           userInfoError.message && 
           !userInfoError.message.includes('UserDoesNotExist') && 
           !userInfoError.message.includes('User Does Not Exist') && (
            <div className="rounded-2xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur-xl border border-red-200 dark:border-red-800 p-6 mb-6 animate-in fade-in slide-in-from-bottom-4">
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">⚠️ Error Loading Data</h3>
              <p className="text-sm text-red-600 dark:text-red-400">
                {userInfoError.message || 'Failed to load user information. Please try again.'}
              </p>
            </div>
          )}

          {/* User Status and Registration Section Moderno */}
          {isConnected && !isAdmin && (
            <>
              {isLoadingUser && (
                <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-8 text-center mb-6">
                  <p className="text-slate-600 dark:text-slate-400">Loading user information...</p>
                </div>
              )}
              
              {!isLoadingUser && 
               (!userInfoError || userInfoError.message?.includes('UserDoesNotExist') || userInfoError.message?.includes('User Does Not Exist')) &&
               (!userInfo || (userInfo.id !== undefined && userInfo.id === BigInt(0))) && (
                <div className="group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl p-8 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 dark:from-slate-100 dark:to-blue-300 bg-clip-text text-transparent mb-2">
                      Welcome! 👋
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      Please register to start using the supply chain tracker
                    </p>
                    <RegisterForm onRegistrationSuccess={() => refetchUserInfo()} />
                  </div>
                </div>
              )}
              
              {!isLoadingUser && userInfo && userInfo.id !== undefined && userInfo.id !== BigInt(0) && (
                <>
                  {Number(userInfo.status) === UserStatus.Pending && (
                    <div className="group relative overflow-hidden rounded-3xl bg-yellow-50/80 dark:bg-yellow-900/30 backdrop-blur-xl border border-yellow-200 dark:border-yellow-800 shadow-xl p-8 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="relative">
                        <h2 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-4 flex items-center gap-2">
                          ⏳ Approval Pending
                        </h2>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                          Your role request as <strong>{getRoleIcon(Number(userInfo.role))} {getRoleName(Number(userInfo.role))}</strong> is waiting for administrator approval.
                        </p>
                        <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-6">
                          You will be able to access the system once approved.
                        </p>
                        <div className="pt-4 border-t border-yellow-200 dark:border-yellow-800">
                          <ChangeRoleDialog currentRole={Number(userInfo.role)} userStatus={Number(userInfo.status)} />
                        </div>
                      </div>
                    </div>
                  )}

                  {Number(userInfo.status) === UserStatus.Rejected && (
                    <div className="group relative overflow-hidden rounded-3xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur-xl border border-red-200 dark:border-red-800 shadow-xl p-8 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="relative">
                        <h2 className="text-2xl font-bold text-red-700 dark:text-red-300 mb-4 flex items-center gap-2">
                          ❌ Role Request Rejected
                        </h2>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-2">
                          Your role request as <strong>{getRoleIcon(Number(userInfo.role))} {getRoleName(Number(userInfo.role))}</strong> was rejected by the administrator.
                        </p>
                        <p className="text-sm text-red-500 dark:text-red-400 mb-6">
                          You can request a different role or contact the administrator for more information.
                        </p>
                        <div className="pt-4 border-t border-red-200 dark:border-red-800">
                          <ChangeRoleDialog currentRole={Number(userInfo.role)} userStatus={Number(userInfo.status)} />
                        </div>
                      </div>
                    </div>
                  )}

                  {Number(userInfo.status) === UserStatus.Canceled && (
                    <div className="group relative overflow-hidden rounded-3xl bg-slate-50/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200 dark:border-slate-700 shadow-xl p-8 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                      <div className="relative">
                        <h2 className="text-2xl font-bold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                          🚫 Registration Canceled
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                          Your previous registration was canceled.
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Only the administrator can change your status. Please contact the administrator for more information.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </>
          )}

          {/* Welcome Section Moderno */}
          <div className="flex flex-col items-center gap-8 text-center mt-12">
            {!isConnected ? (
              <>
                <h2 className="max-w-2xl text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 dark:from-slate-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent leading-tight animate-in fade-in slide-in-from-bottom-4 duration-700">
                  ¡Bienvenido a la DApp!
                </h2>
                <p className="max-w-2xl text-xl leading-8 text-slate-600 dark:text-slate-400 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                  Sistema descentralizado de tracking para supply chain basado en blockchain.{" "}
                  <a
                    href="https://github.com"
                    className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver repositorio
                  </a>
                </p>
                <p className="text-xl font-semibold text-slate-700 dark:text-slate-300 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                  Conecta tu wallet para comenzar
                </p>
                <div className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                  <ConnectWallet />
                </div>
              </>
            ) : (
              <p className="max-w-2xl text-xl leading-8 text-slate-600 dark:text-slate-400">
                Sistema descentralizado de tracking para supply chain basado en blockchain.{" "}
                <a
                  href="https://github.com"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver repositorio
                </a>
              </p>
            )}
          </div>
        </main>
      </div>
    )
  }

  // Diseño original
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-6xl flex-col py-8 px-4 md:px-8 space-y-6 bg-white dark:bg-black">
        {/* Header solo para usuarios conectados */}
        {isConnected && <Header />}

        {/* App Branding (solo cuando NO está conectado) */}
        {!isConnected && (
          <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="text-5xl">📦</div>
              <div>
                <h1 className="text-2xl font-bold">Supply Chain Tracker</h1>
                <p className="text-sm text-muted-foreground">Blockchain-based supply chain management</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages - Solo mostrar errores reales, no "UserDoesNotExist" que es esperado */}
        {ownerError && (
          <Card className="border-red-500/50 bg-red-50 dark:bg-red-900/20">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">⚠️ Error Loading Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-700 dark:text-red-300">
                {ownerError?.message || 'Failed to load contract information. Please try again.'}
              </p>
            </CardContent>
          </Card>
        )}
        {/* userInfoError solo se muestra si NO es "UserDoesNotExist" (usuario no registrado es esperado) */}
        {userInfoError && 
         userInfoError.message && 
         !userInfoError.message.includes('UserDoesNotExist') && 
         !userInfoError.message.includes('User Does Not Exist') && (
          <Card className="border-red-500/50 bg-red-50 dark:bg-red-900/20">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">⚠️ Error Loading Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-700 dark:text-red-300">
                {userInfoError.message || 'Failed to load user information. Please try again.'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* User Status and Registration Section */}
        {isConnected && !isAdmin && (
          <>
            {/* Loading state */}
            {isLoadingUser && (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Loading user information...</p>
                </CardContent>
              </Card>
            )}
            
            {/* User not registered - solo mostrar si NO está cargando, NO hay error (o error es UserDoesNotExist), y NO hay userInfo válido */}
            {!isLoadingUser && 
             (!userInfoError || userInfoError.message?.includes('UserDoesNotExist') || userInfoError.message?.includes('User Does Not Exist')) &&
             (!userInfo || (userInfo.id !== undefined && userInfo.id === BigInt(0))) && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                <Card className="border-blue-500/50 transition-all duration-300 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle>Welcome! 👋</CardTitle>
                    <CardDescription>
                      Please register to start using the supply chain tracker
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RegisterForm onRegistrationSuccess={() => refetchUserInfo()} />
                  </CardContent>
                </Card>
              </div>
            )}
            
            {/* User registered - mostrar estado */}
            {!isLoadingUser && userInfo && userInfo.id !== undefined && userInfo.id !== BigInt(0) && (
              <>
                {/* User Pending */}
                {Number(userInfo.status) === UserStatus.Pending && (
                  <Card className="border-yellow-500/50 transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        ⏳ Approval Pending
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Your role request as <strong>{getRoleIcon(Number(userInfo.role))} {getRoleName(Number(userInfo.role))}</strong> is waiting for administrator approval.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        You will be able to access the system once approved.
                      </p>
                      <div className="pt-4 border-t">
                        <ChangeRoleDialog currentRole={Number(userInfo.role)} userStatus={Number(userInfo.status)} />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* User Rejected */}
                {Number(userInfo.status) === UserStatus.Rejected && (
                  <Card className="border-red-500/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        ❌ Role Request Rejected
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Your role request as <strong>{getRoleIcon(Number(userInfo.role))} {getRoleName(Number(userInfo.role))}</strong> was rejected by the administrator.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        You can request a different role or contact the administrator for more information.
                      </p>
                      <div className="pt-4 border-t">
                        <ChangeRoleDialog currentRole={Number(userInfo.role)} userStatus={Number(userInfo.status)} />
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* User Canceled */}
                {Number(userInfo.status) === UserStatus.Canceled && (
                  <Card className="border-gray-500/50">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        🚫 Registration Canceled
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Your previous registration was canceled.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Only the administrator can change your status. Please contact the administrator for more information.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </>
        )}

        {/* Welcome Section */}
        <div className="flex flex-col items-center gap-6 text-center">
          {!isConnected ? (
            <>
              <h2 className="max-w-md text-2xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
                ¡Bienvenido a la DApp!
              </h2>
              <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
                Sistema descentralizado de tracking para supply chain basado en blockchain.{" "}
                <a
                  href="https://github.com"
                  className="font-medium text-zinc-950 dark:text-zinc-50 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver repositorio
                </a>
              </p>
              <p className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mt-4">
                Conecta tu wallet para comenzar
              </p>
              <div className="mt-2">
                <ConnectWallet />
              </div>
            </>
          ) : (
            <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
              Sistema descentralizado de tracking para supply chain basado en blockchain.{" "}
              <a
                href="https://github.com"
                className="font-medium text-zinc-950 dark:text-zinc-50 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ver repositorio
              </a>
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
