'use client'

import { ConnectWallet } from '@/components/ConnectWallet'
import { Header } from '@/components/Header'
import { RegisterForm } from '@/components/RegisterForm'
import { ChangeRoleDialog } from '@/components/ChangeRoleDialog'
import { useAccount } from 'wagmi'
import { useTotalTokens, useTotalUsers, useTotalTransfers, useUserInfo } from '@/hooks/useContractReads'
import { useContractOwner } from '@/hooks/useContractOwner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserStatus } from '@/contracts/config'
import { useEffect, useState } from 'react'
import Link from 'next/link'

// Tipo para la información del usuario retornada por getUserInfo
type UserInfo = {
  id: bigint
  userAddress: string
  role: bigint
  status: bigint
  registrationDate: bigint
}

export default function Home() {
  const { address, isConnected } = useAccount()
  const { data: totalTokens } = useTotalTokens()
  const { data: totalUsers } = useTotalUsers()
  const { data: totalTransfers } = useTotalTransfers()
  
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

  // Forzar modo claro para usuarios no autorizados (no admin ni aprobados)
  useEffect(() => {
    if (mounted && isConnected && !isLoadingOwner && !isLoadingUser) {
      const isApproved = userInfo && Number(userInfo.status) === UserStatus.Approved
      if (!isAdmin && !isApproved) {
        // Forzar modo claro y limpiar localStorage
        document.documentElement.classList.remove('dark')
        localStorage.removeItem('theme')
      }
    }
  }, [mounted, isConnected, isAdmin, userInfo, isLoadingOwner, isLoadingUser])
  
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-6xl flex-col py-8 px-4 md:px-8 space-y-6 bg-white dark:bg-black">
        {/* App Branding - Show when not connected */}
        {!isConnected && (
          <div className="w-full flex flex-col items-center gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="text-4xl">📦</div>
              <div className="text-center">
                <h1 className="text-3xl font-bold">Supply Chain Tracker</h1>
                <p className="text-sm text-muted-foreground">Blockchain-based supply chain management</p>
              </div>
            </div>
          </div>
        )}

        {/* Header - Show only when connected */}
        {isConnected && <Header />}

        {/* User Status Messages and Registration */}
        {isConnected && !isAdmin && (
          <div className="w-full mb-8">
            {isLoadingOwner || isLoadingUser ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Loading user information...</p>
                </CardContent>
              </Card>
            ) : userInfo && typeof userInfo === 'object' && 'id' in userInfo && Number(userInfo.id) > 0 ? (
              <>
                {Number(userInfo.status) === UserStatus.Pending && (
                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardContent className="pt-6">
                      <div className="space-y-3">
                        <p className="text-sm text-yellow-700">
                          ⏳ Your registration is pending approval by the administrator
                        </p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">
                            Want to change your role?
                          </p>
                          <ChangeRoleDialog 
                            currentRole={Number(userInfo.role)} 
                            onSuccess={() => refetchUserInfo()}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {Number(userInfo.status) === UserStatus.Rejected && (
                  <Card className="border-red-200 bg-red-50">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="text-sm text-red-700">
                          ❌ Your registration was rejected by the administrator
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Please contact the administrator for more information
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {Number(userInfo.status) === UserStatus.Canceled && (
                  <Card className="border-gray-200 bg-gray-50">
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-700">
                          🚫 Your account has been canceled
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Please contact the administrator for more information
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <RegisterForm />
            )}
          </div>
        )}

        {/* Stats cuando esté conectado */}
        {isConnected && mounted && (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Tokens</CardTitle>
                <CardDescription>Total registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalTokens?.toString() || '0'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuarios</CardTitle>
                <CardDescription>Total registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalUsers?.toString() || '0'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transferencias</CardTitle>
                <CardDescription>Total realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalTransfers?.toString() || '0'}</p>
              </CardContent>
            </Card>
          </div>
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
            </>
          )}
        </div>
      </main>
    </div>
  );
}
