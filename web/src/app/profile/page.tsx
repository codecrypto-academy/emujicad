'use client'

import { Header } from '@/components/Header'
import { UserProfileCard } from '@/components/UserProfileCard'
import { AdminProfileCard } from '@/components/AdminProfileCard'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { User } from 'lucide-react'
import { DebugLabel, DEBUG_MODE } from '@/lib/debug'

export default function ProfilePage() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const { isAuthenticated, isLoading, isAdmin } = useAuth()
  
  const [mounted, setMounted] = useState(false)
  const [hasRedirected, setHasRedirected] = useState(false)
  
  // Activar diseño moderno si está habilitado
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'
  
  console.log('🔵 ProfilePage - Componente renderizado', { mounted, hasRedirected, isAuthenticated, isAdmin, isLoading });
  
  useEffect(() => {
    console.log('🟢 ProfilePage - useEffect mounted ejecutado');
    setMounted(true)
  }, [])

  // Redirigir si no está conectado o no está autenticado
  useEffect(() => {
    console.log('🔴 Profile Page - Auth Check:', {
      mounted,
      isConnected,
      isAuthenticated,
      isAdmin,
      isLoading,
      hasRedirected
    });
    
    if (!mounted) {
      console.log('⏸️ Not mounted yet, waiting...');
      return
    }
    
    if (hasRedirected) {
      console.log('⏸️ Already redirected, skipping');
      return
    }
    
    if (!isConnected) {
      console.log('❌ Not connected, redirecting to home');
      setHasRedirected(true)
      router.replace('/')
      return
    }
    
    if (isLoading) {
      console.log('⏳ Auth still loading, waiting...');
      return
    }
    
    // CAMBIO CRÍTICO: Solo redirigir si está EXPLÍCITAMENTE no autenticado
    // Y NO es admin (doble verificación)
    if (!isAuthenticated && !isAdmin) {
      console.log('❌ Not authenticated and not admin, redirecting');
      setHasRedirected(true)
      router.replace('/')
      return
    }
    
    console.log('✅ Access granted - authenticated or admin');
  }, [mounted, isConnected, isAuthenticated, isAdmin, isLoading, hasRedirected, router])

  // No renderizar hasta que esté montado
  if (!mounted || !isConnected) {
    console.log('⏸️ Not rendering - not mounted or not connected');
    return null
  }
  
  // Si aún está cargando, mostrar loading
  if (isLoading) {
    console.log('⏳ Not rendering - still loading');
    return null
  }
  
  // CAMBIO CRÍTICO: Solo bloquear si NO está autenticado Y NO es admin
  if (!isAuthenticated && !isAdmin) {
    console.log('❌ Not rendering - not authenticated and not admin');
    return null
  }
  
  console.log('✅ Rendering profile page')

  // Diseño moderno 2025
  if (useModernDesign) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
        <Header />
        
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          {/* Título moderno con animación */}
          <div className="relative mb-12 flex items-start justify-between animate-in fade-in slide-in-from-top-4 duration-700" style={DEBUG_MODE ? { border: '3px solid rgba(255, 165, 0, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
            <DebugLabel component="ProfilePage" section="TitleSection" props={{ useModernDesign: true, isAdmin }} position="top-right" offset={4} />
            <div className="space-y-3">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent mb-2 flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20 backdrop-blur-sm border border-blue-200/50 dark:border-blue-500/30">
                  <User className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                {isAdmin ? 'Admin Profile' : 'My Profile'}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-light">
                View and manage your account information
              </p>
            </div>
          </div>

          <div className="relative" style={DEBUG_MODE ? { border: '3px solid rgba(0, 255, 0, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
            <DebugLabel component="ProfilePage" section="ProfileCardSection" props={{ useModernDesign: true, isAdmin }} position="top-right" offset={4} />
            {isAdmin ? <AdminProfileCard /> : <UserProfileCard />}
          </div>
        </div>
        {/* DebugLabel de la página principal al final */}
        <DebugLabel component="ProfilePage" section="MainContent" props={{ isAdmin, useModernDesign: true, isAuthenticated }} position="bottom-right" offset={4} />
      </div>
    )
  }

  // Diseño original
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800" style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Título */}
        <div className="relative mb-8" style={DEBUG_MODE ? { border: '3px solid rgba(255, 165, 0, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
          <DebugLabel component="ProfilePage" section="TitleSection" props={{ useModernDesign: false, isAdmin }} position="top-right" offset={4} />
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
            <User className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            {isAdmin ? 'Admin Profile' : 'My Profile'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            View and manage your account information
          </p>
        </div>

        <div className="relative" style={DEBUG_MODE ? { border: '3px solid rgba(0, 255, 0, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
          <DebugLabel component="ProfilePage" section="ProfileCardSection" props={{ useModernDesign: false, isAdmin }} position="top-right" offset={4} />
          {isAdmin ? <AdminProfileCard /> : <UserProfileCard />}
        </div>
      </div>
      {/* DebugLabel de la página principal al final */}
      <DebugLabel component="ProfilePage" section="MainContent" props={{ isAdmin, useModernDesign: false, isAuthenticated }} position="bottom-right" offset={4} />
    </div>
  )
}

