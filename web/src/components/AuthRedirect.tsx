'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAccount } from 'wagmi'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Componente que maneja redirecciones automáticas basadas en el estado de autenticación
 * 
 * Lógica según requerimientos:
 * 1. Al conectar → verificar admin inmediatamente
 *    - Si es admin → redirigir a /dashboard (admin dashboard)
 * 2. Si no es admin → verificar registro inmediatamente
 *    - Si está registrado → verificar rol y estatus
 *      - Si está aprobado → redirigir a /dashboard (user dashboard)
 *      - Si no está aprobado → permanecer en / (mostrar estado pendiente)
 *    - Si no está registrado → permanecer en / (mostrar formulario de registro)
 * 
 * La información se recolecta UNA SOLA VEZ en AuthContext y persiste durante toda la sesión.
 * Se actualiza automáticamente cuando cambia el usuario o se desconecta.
 * 
 * Este componente debe estar en el layout para que funcione en todas las páginas
 */
export function AuthRedirect() {
  const router = useRouter()
  const pathname = usePathname()
  const { isConnected } = useAccount()
  const { isAdmin, isAuthenticated, isLoading, userInfo } = useAuth()

  useEffect(() => {
    // No hacer nada si no está conectado
    if (!isConnected) return

    // ============================================
    // LÓGICA 1: Si es admin → redirigir a dashboard
    // ============================================
    // Verificar admin INMEDIATAMENTE si ya terminó de cargar
    if (!isLoading && isAdmin) {
      // Permitir acceso a páginas de admin y profile
      if (pathname?.startsWith('/admin') || pathname === '/profile') {
        return
      }
      // Si está en otra página (incluyendo home), redirigir a dashboard
      if (pathname !== '/dashboard') {
        router.replace('/dashboard')
      }
      return
    }

    // ============================================
    // LÓGICA 2: Si es usuario aprobado → permitir acceso
    // ============================================
    // Verificar autenticación INMEDIATAMENTE si ya terminó de cargar
    if (!isLoading && isAuthenticated) {
      // Si está en home, redirigir a dashboard
      if (pathname === '/') {
        router.replace('/dashboard')
      }
      // Permitir acceso a otras páginas (dashboard, tokens, etc.)
      return
    }

    // ============================================
    // LÓGICA 3: Si no está autenticado (no registrado o no aprobado)
    // ============================================
    // CRÍTICO: Redirigir INMEDIATAMENTE si ya terminó de cargar y no está autenticado
    // NO esperar más - si isLoading es false y isAuthenticated es false, redirigir
    if (!isLoading && !isAuthenticated) {
      const protectedPaths = ['/dashboard', '/tokens', '/transfers', '/profile']
      if (pathname && protectedPaths.some(path => pathname.startsWith(path))) {
        router.replace('/')
      }
      // Si está en home, permanecer ahí (mostrar registro o estado pendiente)
      return
    }
  }, [isLoading, isConnected, isAdmin, isAuthenticated, pathname, router, userInfo])

  // Este componente no renderiza nada
  return null
}

