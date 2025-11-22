'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Componente que maneja redirecciones automáticas basadas en el estado de autenticación
 * 
 * Lógica:
 * 1. Si es admin → redirigir a /dashboard (admin dashboard)
 * 2. Si es usuario aprobado → redirigir a /dashboard (user dashboard)
 * 3. Si no está registrado → permanecer en / (mostrar formulario de registro)
 * 4. Si está registrado pero no aprobado → permanecer en / (mostrar estado pendiente)
 * 
 * Este componente debe estar en el layout para que funcione en todas las páginas
 */
export function AuthRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const { isConnected } = useAccount()
  const { isAdmin, isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    // No hacer nada si aún está cargando
    if (isLoading) return

    // No hacer nada si no está conectado
    if (!isConnected) return

    // Si es admin, redirigir a dashboard (excepto si ya está ahí o en admin pages)
    if (isAdmin) {
      // Permitir acceso a páginas de admin
      if (pathname?.startsWith('/admin')) {
        return
      }
      // Si está en otra página, redirigir a dashboard
      if (pathname !== '/dashboard') {
        router.replace('/dashboard')
      }
      return
    }

    // Si es usuario aprobado, redirigir a dashboard desde home
    if (isAuthenticated) {
      // Si está en home, redirigir a dashboard
      if (pathname === '/') {
        router.replace('/dashboard')
      }
      // Permitir acceso a otras páginas (dashboard, tokens, etc.)
      return
    }

    // Si no está autenticado (no registrado o no aprobado)
    // Solo redirigir a home si está en una página protegida
    if (!isAuthenticated) {
      const protectedPaths = ['/dashboard', '/tokens', '/transfers', '/profile']
      if (pathname && protectedPaths.some(path => pathname.startsWith(path))) {
        router.replace('/')
      }
    }
  }, [isLoading, isConnected, isAdmin, isAuthenticated, pathname, router])

  // Este componente no renderiza nada
  return null
}

