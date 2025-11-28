'use client'

import { Header } from '@/components/Header'
import { TransferList } from '@/components/TransferList'
import { CreateTransferForm } from '@/components/CreateTransferForm'
import { useAuth } from '@/contexts/AuthContext'
import { useContractOwner } from '@/hooks/useContractOwner'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRightLeft, AlertCircle } from 'lucide-react'
import { DebugLabel, DEBUG_MODE } from '@/lib/debug'

export default function TransfersPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { isAuthenticated, isLoading: isLoadingAuth, userInfo, isAdmin: isAdminFromAuth } = useAuth()
  
  // CRÍTICO: TODOS los hooks deben estar ANTES de cualquier return condicional
  // ORDEN FIJO: useState, hooks de datos, useEffect
  
  // 1. TODOS los useState juntos
  const [mounted, setMounted] = useState(false)
  
  // Activar diseño moderno si está habilitado
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'
  
  // 2. Hooks de datos - se ejecutan siempre, pero se deshabilitan si no está autenticado
  const shouldFetchData = isConnected && !isLoadingAuth && isAuthenticated
  
  const { owner, isLoading: isLoadingOwner } = useContractOwner(shouldFetchData)
  
  // Verificación directa de admin (más rápida que esperar por AuthContext)
  const isAdminDirect = address && owner && address.toLowerCase() === owner.toLowerCase()
  const isAdmin = isAdminDirect || isAdminFromAuth
  const isLoadingAdminCheck = isLoadingOwner || isLoadingAuth
  
  // 3. TODOS los useEffect juntos
  useEffect(() => {
    setMounted(true)
  }, [])

  // CRÍTICO: Redirigir INMEDIATAMENTE si no está conectado o no está autenticado
  useEffect(() => {
    if (!mounted) return
    
    // Si no está conectado, redirigir inmediatamente
    if (!isConnected) {
      router.replace('/')
      return
    }
    
    // Si ya terminó de cargar y no está autenticado, redirigir INMEDIATAMENTE
    if (!isLoadingAuth && !isAuthenticated) {
      router.replace('/')
      return
    }
  }, [mounted, isConnected, isAuthenticated, isLoadingAuth, router])
  
  // Redirigir si es Administrador (después de verificar autenticación)
  useEffect(() => {
    if (!mounted || isLoadingAdminCheck) return
    
    // Administrador puede ver transferencias, pero redirigir si prefiere dashboard
    // Por ahora, permitimos que admin vea transferencias también
    // if (isAdmin) {
    //   router.replace('/dashboard')
    //   return
    // }
  }, [mounted, isLoadingAdminCheck, isAdmin, router])

  // CRÍTICO: Early return DESPUÉS de todos los hooks
  if (!mounted || !isConnected) {
    return null
  }
  
  // CRÍTICO: Si ya terminó de cargar y no está autenticado, redirigir INMEDIATAMENTE
  if (!isLoadingAuth && !isAuthenticated) {
    return null // Redirección en progreso
  }
  
  // Si aún está cargando, mostrar null (no hacer consultas todavía)
  if (isLoadingAuth) {
    return null
  }

  // Detectar roles para layout especial
  // ⚠️ IMPORTANTE: Usar userInfo de la línea 19, NO llamar useAuth() de nuevo aquí
  const isConsumerRole = userInfo && userInfo.role === BigInt(3) // Consumer = 3
  const isProducerRole = userInfo && userInfo.role === BigInt(0) // Producer = 0
  const isFactoryRole = userInfo && userInfo.role === BigInt(1) // Factory = 1
  const isRetailerRole = userInfo && userInfo.role === BigInt(2) // Retailer = 2

  // Diseño moderno 2025
  if (useModernDesign) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
        <Header />
        
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Título moderno con animación */}
          <div className="relative mb-12 flex items-start justify-between animate-in fade-in slide-in-from-top-4 duration-700" style={DEBUG_MODE ? { border: '3px solid rgba(255, 165, 0, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
            <DebugLabel component="TransfersPage" section="TitleSection" props={{ useModernDesign: true, isConsumerRole, isProducerRole }} position="top-right" offset={4} />
            <div className="space-y-3">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent mb-2 flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20 backdrop-blur-sm border border-blue-200/50 dark:border-blue-500/30">
                  <ArrowRightLeft className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                {isConsumerRole ? 'My Incoming Transfer' : isProducerRole ? 'Sent Transfers' : 'Transfers'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-light">
                {isConsumerRole 
                  ? 'Review and manage transfers sent to you'
                  : isProducerRole
                  ? 'Manage transfers you have sent'
                  : 'Manage your token transfers in the supply chain'}
              </p>
            </div>
          </div>

          {/* Consumer solo ve la lista de transferencias, sin formulario */}
          {!isConsumerRole && (
            <div className="relative mb-6" style={DEBUG_MODE ? { border: '3px solid rgba(0, 255, 0, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
              <DebugLabel component="TransfersPage" section="CreateTransferFormSection" props={{ useModernDesign: true, isConsumerRole }} position="top-right" offset={4} />
              <CreateTransferForm />
            </div>
          )}
          
          <div className="relative" style={DEBUG_MODE ? { border: '3px solid rgba(0, 0, 255, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
            <DebugLabel component="TransfersPage" section="TransferListSection" props={{ useModernDesign: true }} position="top-right" offset={4} />
            <TransferList />
          </div>
        </div>
        {/* DebugLabel de la página principal al final */}
        <DebugLabel component="TransfersPage" section="MainContent" props={{ useModernDesign: true, isAuthenticated, isConsumerRole }} position="bottom-right" offset={4} />
      </div>
    )
  }

  // Diseño original
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800" style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Título */}
        <div className="relative mb-8" style={DEBUG_MODE ? { border: '3px solid rgba(255, 165, 0, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
          <DebugLabel component="TransfersPage" section="TitleSection" props={{ useModernDesign: false, isConsumerRole, isProducerRole }} position="top-right" offset={4} />
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
            <ArrowRightLeft className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            {isConsumerRole ? 'Incoming Transfers' : isProducerRole ? 'Sent Transfers' : 'Transfers'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {isConsumerRole 
              ? 'Review and manage transfers sent to you'
              : isProducerRole
              ? 'Manage transfers you have sent'
              : 'View and manage your token transfers'}
          </p>
        </div>

          {/* Consumer solo ve la lista de transferencias, sin formulario */}
          {!isConsumerRole && (
            <div className="relative mb-6" style={DEBUG_MODE ? { border: '3px solid rgba(0, 255, 0, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
              <DebugLabel component="TransfersPage" section="CreateTransferFormSection" props={{ useModernDesign: false, isConsumerRole }} position="top-right" offset={4} />
              <CreateTransferForm />
            </div>
          )}
          
          <div className="relative" style={DEBUG_MODE ? { border: '3px solid rgba(0, 0, 255, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
            <DebugLabel component="TransfersPage" section="TransferListSection" props={{ useModernDesign: false }} position="top-right" offset={4} />
            <TransferList />
          </div>
      </div>
      {/* DebugLabel de la página principal al final */}
      <DebugLabel component="TransfersPage" section="MainContent" props={{ useModernDesign: false, isAuthenticated, isConsumerRole }} position="bottom-right" offset={4} />
    </div>
  )
}

