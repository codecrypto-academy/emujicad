'use client'

import { Header } from '@/components/Header'
import { TransferList } from '@/components/TransferList'
import { CreateTransferForm } from '@/components/CreateTransferForm'
import { UserTokenList } from '@/components/UserTokenList'
import { useAuth } from '@/contexts/AuthContext'
import { useContractOwner } from '@/hooks/useContractOwner'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowRightLeft, AlertCircle } from 'lucide-react'

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

  // Detectar si es Consumer para layout especial
  const { userInfo: authUserInfo } = useAuth()
  const isConsumerRole = authUserInfo && authUserInfo.role === BigInt(3) // Consumer = 3
  
  // Diseño moderno 2025
  if (useModernDesign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <Header />
        
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Título moderno con animación */}
          <div className="mb-12 flex items-start justify-between animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="space-y-3">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent mb-2 flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20 backdrop-blur-sm border border-blue-200/50 dark:border-blue-500/30">
                  <ArrowRightLeft className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                {isConsumerRole ? 'Incoming Transfers' : 'Transfers'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-light">
                {isConsumerRole 
                  ? 'Review and manage transfers sent to you' 
                  : 'Manage your token transfers in the supply chain'}
              </p>
            </div>
          </div>

          {/* Consumer solo ve la lista de transferencias, sin formulario */}
          {!isConsumerRole && <CreateTransferForm />}
          
          {/* Todos los roles ven sus tokens en la misma posición (consistencia) */}
          <UserTokenList />
          
          <TransferList />
        </div>
      </div>
    )
  }

  // Diseño original
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
            <ArrowRightLeft className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            {isConsumerRole ? 'Incoming Transfers' : 'Transfers'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {isConsumerRole 
              ? 'Review and manage transfers sent to you' 
              : 'View and manage your token transfers'}
          </p>
        </div>

          {/* Consumer solo ve la lista de transferencias, sin formulario */}
          {!isConsumerRole && <CreateTransferForm />}
          
          {/* Todos los roles ven sus tokens en la misma posición (consistencia) */}
          <UserTokenList />
          
          <TransferList />
      </div>
    </div>
  )
}

