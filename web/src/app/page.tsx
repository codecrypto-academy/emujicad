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

// Tipo para la información del usuario retornada por getUserInfo
type UserInfo = {
  id: bigint
  userAddress: string
  role: bigint
  status: bigint
  registrationDate: bigint
}

export default function Home() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  
  // Detección de roles
  const { owner, isLoading: isLoadingOwner } = useContractOwner()
  const { data: rawUserInfo, isLoading: isLoadingUser, refetch: refetchUserInfo } = useUserInfo(address)
  const userInfo = rawUserInfo as UserInfo | undefined
  
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
      [UserStatus.Suspended]: { label: 'Suspended', variant: 'outline' as const },
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

        {/* User Status and Registration Section */}
        {isConnected && !isAdmin && (
          <>
            {/* User not registered */}
            {!userInfo || userInfo.id === 0n ? (
              <div className="space-y-6">
                <Card className="border-blue-500/50">
                  <CardHeader>
                    <CardTitle>Welcome! 👋</CardTitle>
                    <CardDescription>
                      Please register to start using the supply chain tracker
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <RegisterForm />
                  </CardContent>
                </Card>
              </div>
            ) : (
              <>
                {/* User Pending */}
                {Number(userInfo.status) === UserStatus.Pending && (
                  <Card className="border-yellow-500/50">
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
