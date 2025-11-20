'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useContractOwner } from '@/hooks/useContractOwner'
import { Header } from '@/components/Header'
import { UserManagementTable } from '@/components/admin/UserManagementTable'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function AdminUsersPage() {
  const { address, isConnected } = useAccount()
  const { owner, isLoading: isLoadingOwner } = useContractOwner()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase()

  // Prevenir hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redireccionar si no es owner
  useEffect(() => {
    if (mounted && !isLoadingOwner && isConnected && !isOwner) {
      router.push('/')
    }
  }, [isOwner, isConnected, isLoadingOwner, router, mounted])

  // No renderizar nada hasta que se monte en el cliente
  if (!mounted || isLoadingOwner) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Verificando permisos...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Estados de carga
  if (!isConnected) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">🔐 Acceso Denegado</h1>
            <p className="text-muted-foreground mb-4">
              Debes conectar tu wallet para acceder a esta página.
            </p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">🚫 Acceso Denegado</h1>
            <p className="text-muted-foreground mb-4">
              Solo el propietario del contrato puede acceder a esta página.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Tu dirección: <code className="bg-gray-100 px-2 py-1 rounded">{address}</code>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Owner: <code className="bg-gray-100 px-2 py-1 rounded">{owner}</code>
            </p>
            <Link href="/">
              <Button>Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Si llegamos aquí, el usuario es el owner
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-6xl flex-col py-8 px-4 md:px-8 bg-white dark:bg-black">
      {/* Header Común */}
      <Header />

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold">👤 Gestión de Usuarios</h1>
        <p className="text-muted-foreground mt-1">
          Administración de usuarios y permisos del sistema
        </p>
      </div>

      {/* Tabla de gestión (incluye stats internamente para sincronización) */}
      <UserManagementTable />
      </main>
    </div>
  )
}
