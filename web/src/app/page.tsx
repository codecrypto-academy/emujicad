'use client'

import { ConnectWallet } from '@/components/ConnectWallet'
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-16">
          <h1 className="text-3xl font-bold">Supply Chain Tracker</h1>
          <ConnectWallet />
        </div>

        {/* Detección de Rol del Usuario */}
        {isConnected && mounted && (
          <div className="w-full mb-8">
            {isLoadingOwner || isLoadingUser ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Loading user information...</p>
                </CardContent>
              </Card>
            ) : isAdmin ? (
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>👑</span>
                    <span>Administrator</span>
                  </CardTitle>
                  <CardDescription>Contract Owner</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-mono text-muted-foreground mb-2">
                    {address}
                  </p>
                  <div className="flex gap-2">
                    <Link href="/admin/users">
                      <Button size="sm" variant="default" className="bg-purple-600 hover:bg-purple-700">
                        Manage Users
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button size="sm" variant="default" className="bg-purple-600 hover:bg-purple-700">
                        View Statistics
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ) : userInfo && typeof userInfo === 'object' && 'id' in userInfo && Number(userInfo.id) > 0 ? (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <span>{getRoleIcon(Number(userInfo.role))}</span>
                    <span>{getRoleName(Number(userInfo.role))}</span>
                    <Badge variant={getStatusBadge(Number(userInfo.status)).variant}>
                      {getStatusBadge(Number(userInfo.status)).label}
                    </Badge>
                  </CardTitle>
                  <CardDescription>User ID: {userInfo.id?.toString()}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-mono text-muted-foreground mb-3">
                    {address}
                  </p>
                  {Number(userInfo.status) === UserStatus.Approved && (
                    <div className="flex gap-2">
                      <Link href="/dashboard">
                        <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700">
                          Dashboard
                        </Button>
                      </Link>
                      <Link href="/tokens">
                        <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700">
                          My Tokens
                        </Button>
                      </Link>
                    </div>
                  )}
                  {Number(userInfo.status) === UserStatus.Pending && (
                    <div className="space-y-3">
                      <p className="text-sm text-yellow-700 bg-yellow-100 p-2 rounded">
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
                  )}
                  {Number(userInfo.status) === UserStatus.Rejected && (
                    <div className="space-y-2">
                      <p className="text-sm text-red-700 bg-red-100 p-2 rounded">
                        ❌ Your registration was rejected by the administrator
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Please contact the administrator for more information
                      </p>
                    </div>
                  )}
                  {Number(userInfo.status) === UserStatus.Suspended && (
                    <div className="space-y-2">
                      <p className="text-sm text-orange-700 bg-orange-100 p-2 rounded">
                        ⚠️ Your account has been suspended
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Please contact the administrator to restore access
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
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

        {/* Bienvenida */}
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-xs text-2xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            {!mounted 
              ? 'Supply Chain Tracker'
              : isConnected 
                ? '¡Bienvenido a la DApp!' 
                : 'Conecta tu wallet para comenzar'
            }
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
        </div>
      </main>
    </div>
  );
}
