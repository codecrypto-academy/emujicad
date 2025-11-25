'use client'

import { useEffect, useState } from 'react'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useContractOwner } from '@/hooks/useContractOwner'
import { useIsPaused } from '@/hooks/usePause'
import { Header } from '@/components/Header'
import { PauseControl } from '@/components/admin/PauseControl'
import { OwnershipTransfer } from '@/components/admin/OwnershipTransfer'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { DebugLabel } from '@/lib/debug'

export default function AdminPage() {
  const { address, isConnected } = useAccount()
  const shouldFetchOwner = Boolean(isConnected && address)
  const { owner, isLoading: isLoadingOwner, error: ownerError } = useContractOwner(shouldFetchOwner)
  const router = useRouter()
  // Inicializar mounted directamente para evitar setState en effect
  const [mounted, setMounted] = useState(false)
  
  // Activar diseño moderno si está habilitado
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase()

  // Hooks de datos
  // Nota: useIsPaused se usa internamente en PauseControl, no necesitamos los valores aquí
  useIsPaused(Boolean(isConnected && !isLoadingOwner && isOwner))

  // Prevenir hydration mismatch - usar startTransition para evitar warning de React
  useEffect(() => {
    // Usar setTimeout para diferir el setState fuera del render síncrono
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)
    return () => clearTimeout(timer)
  }, [])

  // Redireccionar si no es owner o si se desconecta
  useEffect(() => {
    if (mounted && !isLoadingOwner) {
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
          <DebugLabel component="AdminPage" section="LoadingState" props={{ mounted, isLoadingOwner, useModernDesign: true }} />
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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <DebugLabel component="AdminPage" section="LoadingState" props={{ mounted, isLoadingOwner, useModernDesign: false }} />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <Skeleton className="h-6 w-48 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400">Verificando permisos...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Si no es owner, no mostrar nada (será redirigido)
  if (!isOwner) {
    return null
  }

  if (ownerError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <DebugLabel component="AdminPage" section="ErrorState" props={{ hasError: true, errorMessage: ownerError.message }} />
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al verificar permisos de administrador: {ownerError.message}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${useModernDesign 
      ? 'bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800' 
      : 'bg-slate-50 dark:bg-slate-900'}`}>
      <DebugLabel component="AdminPage" section="MainContent" props={{ isOwner, useModernDesign, isConnected }} />
      <Header />
      
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Título Moderno */}
        <div className="mb-10 flex items-start justify-between animate-in fade-in slide-in-from-top-4 duration-700">
          <DebugLabel component="AdminPage" section="TitleSection" props={{ useModernDesign }} />
          <div>
            <h1 className={`${useModernDesign 
              ? 'text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 dark:from-slate-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-3' 
              : 'text-4xl font-bold text-slate-900 dark:text-slate-100 mb-2'}`}>
              👑 Administrator Panel
            </h1>
            <p className={`${useModernDesign 
              ? 'text-lg text-slate-600 dark:text-slate-400' 
              : 'text-slate-600 dark:text-slate-400'}`}>
              Manage the entire supply chain system
            </p>
          </div>
        </div>

        {/* Control de Pausa */}
        <div className="mb-10">
          <DebugLabel component="AdminPage" section="PauseControlSection" props={{ useModernDesign }} />
          <PauseControl />
        </div>

        {/* Transferencia de Ownership */}
        <div className="mb-10">
          <DebugLabel component="AdminPage" section="OwnershipTransferSection" props={{ useModernDesign }} />
          <OwnershipTransfer />
        </div>

        {/* Accesos Rápidos */}
        <div className="mb-10">
          <DebugLabel component="AdminPage" section="QuickActionsSection" props={{ useModernDesign }} />
          <h2 className={`${useModernDesign 
            ? 'text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-6' 
            : 'text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6'}`}>
            Quick Actions
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {/* Manage Users */}
            <Link href="/admin/users">
              <div className={`${useModernDesign 
                ? 'group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50/80 to-yellow-50/80 dark:from-amber-900/30 dark:to-yellow-900/30 backdrop-blur-xl border border-amber-200/50 dark:border-amber-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] cursor-pointer' 
                : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer'}`}>
                <div className={`${useModernDesign ? 'relative p-6' : 'p-6'}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`${useModernDesign 
                      ? 'p-3 rounded-xl bg-amber-500/20 dark:bg-amber-400/20' 
                      : 'p-3 rounded-lg bg-amber-100 dark:bg-amber-900'}`}>
                      <Users className="h-6 w-6 text-amber-700 dark:text-amber-300" />
                    </div>
                    <div>
                      <h3 className={`${useModernDesign 
                        ? 'text-xl font-bold text-amber-800 dark:text-amber-200' 
                        : 'text-lg font-semibold text-slate-800 dark:text-slate-200'}`}>
                        Manage Users
                      </h3>
                      <p className={`${useModernDesign 
                        ? 'text-sm text-amber-700/80 dark:text-amber-300/80' 
                        : 'text-sm text-slate-600 dark:text-slate-400'}`}>
                        Approve or reject user registrations
                      </p>
                    </div>
                  </div>
                  <div className={`${useModernDesign 
                    ? 'text-sm text-amber-700 dark:text-amber-300' 
                    : 'text-sm text-slate-600 dark:text-slate-400'}`}>
                    Click to manage →
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

