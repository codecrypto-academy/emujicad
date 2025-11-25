'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useContractOwner } from '@/hooks/useContractOwner'
import { Header } from '@/components/Header'
import { UserManagementTable } from '@/components/admin/UserManagementTable'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { DebugLabel, DEBUG_MODE } from '@/lib/debug'

export default function AdminUsersPage() {
  const { address, isConnected } = useAccount()
  const shouldFetchOwner = Boolean(isConnected && address)
  const { owner, isLoading: isLoadingOwner, error: ownerError } = useContractOwner(shouldFetchOwner)
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  
  // Activar diseño moderno si está habilitado
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase()

  // Prevenir hydration mismatch - usar setTimeout para diferir el setState
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Redireccionar si no es owner o si se desconecta
  useEffect(() => {
    if (mounted && !isLoadingOwner) {
      // Si no está conectado O si está conectado pero no es owner
      if (!isConnected || (isConnected && !isOwner)) {
        router.push('/')
      }
    }
  }, [isOwner, isConnected, isLoadingOwner, router, mounted])

  // No renderizar nada hasta que se monte en el cliente
  // No renderizar Header durante carga inicial para evitar problemas de hidratación
  if (!mounted || isLoadingOwner) {
    if (useModernDesign) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
          <DebugLabel component="AdminUsersPage" section="LoadingState" props={{ mounted, isLoadingOwner, useModernDesign: true }} />
          <div className="container mx-auto px-4 py-12">
            <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-8 text-center">
              <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-xl w-48 mx-auto animate-pulse mb-4"></div>
              <p className="text-slate-600 dark:text-slate-400">Verificando permisos...</p>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="container mx-auto py-8">
        <DebugLabel component="AdminUsersPage" section="LoadingState" props={{ mounted, isLoadingOwner, useModernDesign: false }} />
        <Card>
          <CardHeader>
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48 mx-auto animate-pulse"></div>
          </CardHeader>
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Verificando permisos...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Manejo de errores al verificar ownership
  if (ownerError) {
    if (useModernDesign) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
          <DebugLabel component="AdminUsersPage" section="ErrorState" props={{ hasError: true, errorMessage: ownerError.message, useModernDesign: true }} />
          <Header />
          <div className="container mx-auto px-4 py-12">
            <div className="rounded-2xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur-xl border border-red-200 dark:border-red-800 p-8 text-center animate-in fade-in slide-in-from-bottom-4">
              <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">⚠️ Error</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Failed to verify contract ownership. Please try again.
              </p>
              <p className="text-sm text-red-600 dark:text-red-400 mb-6 font-mono">
                {ownerError.message}
              </p>
              <Link href="/">
                <Button variant="outline" className="rounded-xl">Volver al inicio</Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="container mx-auto py-8">
        <DebugLabel component="AdminUsersPage" section="ErrorState" props={{ hasError: true, errorMessage: ownerError.message, useModernDesign: false }} />
        <Card className="border-red-500/50 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4 text-red-600 dark:text-red-400">⚠️ Error</h1>
            <p className="text-muted-foreground mb-4">
              Failed to verify contract ownership. Please try again.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {ownerError.message}
            </p>
            <Link href="/">
              <Button variant="outline">Volver al inicio</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Estados de carga
  if (!isConnected) {
    if (useModernDesign) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
          <DebugLabel component="AdminUsersPage" section="NotConnectedState" props={{ useModernDesign: true }} />
          <Header />
          <div className="container mx-auto px-4 py-12">
            <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-8 text-center animate-in fade-in slide-in-from-bottom-4">
              <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-red-700 dark:from-slate-100 dark:to-red-300 bg-clip-text text-transparent">🔐 Acceso Denegado</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                Debes conectar tu wallet para acceder a esta página.
              </p>
              <Link href="/">
                <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">Volver al inicio</Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="container mx-auto py-8">
        <DebugLabel component="AdminUsersPage" section="NotConnectedState" props={{ useModernDesign: false }} />
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
    if (useModernDesign) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
          <DebugLabel component="AdminUsersPage" section="NotOwnerState" props={{ isConnected, useModernDesign: true }} />
          <Header />
          <div className="container mx-auto px-4 py-12">
            <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-8 text-center animate-in fade-in slide-in-from-bottom-4">
              <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-slate-800 to-red-700 dark:from-slate-100 dark:to-red-300 bg-clip-text text-transparent">🚫 Acceso Denegado</h1>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Solo el propietario del contrato puede acceder a esta página.
              </p>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mb-4 space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Tu dirección: <code className="bg-white dark:bg-slate-700 px-2 py-1 rounded-lg font-mono text-xs">{address}</code>
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Owner: <code className="bg-white dark:bg-slate-700 px-2 py-1 rounded-lg font-mono text-xs">{owner}</code>
                </p>
              </div>
              <Link href="/">
                <Button className="rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">Volver al inicio</Button>
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="container mx-auto py-8">
        <DebugLabel component="AdminUsersPage" section="NotOwnerState" props={{ isConnected, useModernDesign: false }} />
        <Card>
          <CardContent className="pt-6 text-center">
            <h1 className="text-2xl font-bold mb-4">🚫 Acceso Denegado</h1>
            <p className="text-muted-foreground mb-4">
              Solo el propietario del contrato puede acceder a esta página.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Tu dirección: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{address}</code>
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Owner: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{owner}</code>
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
  if (useModernDesign) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
        <Header />
        
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Título Moderno */}
          <div className="relative mb-10 animate-in fade-in slide-in-from-top-4 duration-700" style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
            <DebugLabel component="AdminUsersPage" section="TitleSection" props={{ useModernDesign: true }} position="top-right" offset={4} />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 dark:from-slate-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-3 flex items-center gap-3">
              👤 Gestión de Usuarios
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Administración de usuarios y permisos del sistema
            </p>
          </div>

          {/* Tabla de gestión */}
          <div className="relative animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100" style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
            <DebugLabel component="AdminUsersPage" section="UserManagementTableSection" props={{ useModernDesign: true }} position="top-left" offset={4} />
            <UserManagementTable />
          </div>
        </div>
        {/* DebugLabel de la página principal al final */}
        <DebugLabel component="AdminUsersPage" section="MainContent" props={{ isOwner, useModernDesign: true, isConnected }} position="bottom-right" offset={4} />
      </div>
    )
  }

  // Diseño original
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black" style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
      <main className="flex min-h-screen w-full max-w-6xl flex-col py-8 px-4 md:px-8 bg-white dark:bg-black">
      {/* Header Común */}
      <Header />

      {/* Page Title */}
      <div className="relative" style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '8px', marginBottom: '16px' } : {}}>
        <DebugLabel component="AdminUsersPage" section="TitleSection" props={{ useModernDesign: false }} position="top-right" offset={4} />
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">👤 Gestión de Usuarios</h1>
        <p className="text-muted-foreground dark:text-slate-400 mt-1">
          Administración de usuarios y permisos del sistema
        </p>
      </div>

      {/* Tabla de gestión (incluye stats internamente para sincronización) */}
      <div className="relative" style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
        <DebugLabel component="AdminUsersPage" section="UserManagementTableSection" props={{ useModernDesign: false }} position="top-left" offset={4} />
        <UserManagementTable />
      </div>
      </main>
      {/* DebugLabel de la página principal al final */}
      <DebugLabel component="AdminUsersPage" section="MainContent" props={{ isOwner, useModernDesign: false, isConnected }} position="bottom-right" offset={4} />
    </div>
  )
}
