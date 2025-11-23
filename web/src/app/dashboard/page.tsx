'use client';

import { Header } from '@/components/Header';
import { UserProfileCard } from '@/components/UserProfileCard';
import { TokenCard } from '@/components/TokenCard';
import { PauseControl } from '@/components/admin/PauseControl';
import { useGetUserTokens } from '@/hooks/useGetUserTokens';
import { useUserTokenStats } from '@/hooks/useUserTokenStats';
import { useDashboardStats } from '@/hooks/useContractReads';
import { useIsPaused } from '@/hooks/usePause';
import { useAuth } from '@/contexts/AuthContext';
import { useGetUserTransfers } from '@/hooks/useGetUserTransfers';
import { TransferStatus } from '@/contracts/config';
import { validateBigIntArray } from '@/lib/validation';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Package, Users, ArrowRightLeft, AlertCircle, Pause, Table2, User } from 'lucide-react';
import Link from 'next/link';
import { UserRole, UserStatus } from '@/contracts/config';

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { isAdmin, isAuthenticated, isLoading, userInfo } = useAuth();
  
  // Activar diseño moderno si está habilitado
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'
  
  // CRÍTICO: TODOS los hooks deben estar ANTES de cualquier return condicional
  // Esto previene el error "Rendered more hooks than during the previous render"
  // ORDEN FIJO: useState, useEffect, hooks de datos, useMemo
  
  const [mounted, setMounted] = useState(false);
  const [stableValidTokens, setStableValidTokens] = useState<bigint[] | null>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Hooks de datos - se ejecutan siempre, pero se deshabilitan si no está autenticado
  // Usar isAuthenticated para habilitar/deshabilitar consultas
  const shouldFetchData = isConnected && !isLoading && isAuthenticated;
  
  const { data: userTokens, isLoading: isLoadingTokens, error: tokensError } = useGetUserTokens(
    shouldFetchData ? address : undefined
  );
  
  // Optimización: usar batch reads en lugar de 3 llamadas separadas
  // CRÍTICO: Deshabilitar si no está autenticado para evitar consultas innecesarias
  const { 
    totalTokens, 
    totalUsers, 
    totalTransfers, 
    isLoading: isLoadingStats,
    errors: statsErrors 
  } = useDashboardStats(shouldFetchData);
  
  // CRÍTICO: Deshabilitar si no está autenticado para evitar consultas innecesarias
  const { data: isPaused } = useIsPaused(shouldFetchData);
  
  // Obtener transferencias del usuario para estadísticas
  const { transfers, isLoading: isLoadingTransfers, refetch: refetchTransfers } = useGetUserTransfers(
    shouldFetchData ? address : undefined
  );
  
  // Calcular estadísticas de transferencias
  const transferStats = useMemo(() => {
    if (!transfers || transfers.length === 0) {
      return {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        cancelled: 0,
      }
    }
    
    return {
      total: transfers.length,
      pending: transfers.filter(t => Number(t.status) === TransferStatus.Pending).length,
      accepted: transfers.filter(t => Number(t.status) === TransferStatus.Accepted).length,
      rejected: transfers.filter(t => Number(t.status) === TransferStatus.Rejected).length,
      cancelled: transfers.filter(t => Number(t.status) === TransferStatus.Cancelled).length,
    }
  }, [transfers]);
  
  // Escuchar evento cuando se crea una nueva transferencia
  useEffect(() => {
    const handleTransferCreated = () => {
      console.log('[Dashboard] Nueva transferencia creada, actualizando estadísticas...')
      setTimeout(() => {
        refetchTransfers()
      }, 2000)
    }
    
    window.addEventListener('transferCreated', handleTransferCreated)
    return () => {
      window.removeEventListener('transferCreated', handleTransferCreated)
    }
  }, [refetchTransfers]);
  
  // Memoizar tokens validados para evitar re-renders innecesarios
  const validTokens = useMemo(() => {
    return validateBigIntArray(userTokens);
  }, [userTokens]);
  
  useEffect(() => {
    if (validTokens && validTokens.length > 0) {
      setStableValidTokens(validTokens);
    }
  }, [validTokens]);
  
  // Usar tokens estables si existen, sino usar los actuales
  const displayTokens = stableValidTokens || validTokens || [];
  
  // Memoizar valores para evitar parpadeos durante refetch
  const stableTotalTokens = useMemo(() => totalTokens, [totalTokens]);
  const stableTotalUsers = useMemo(() => totalUsers, [totalUsers]);
  const stableTotalTransfers = useMemo(() => totalTransfers, [totalTransfers]);
  
  // Solo mostrar loading en la primera carga, no durante refetch
  const isInitialStatsLoading = isLoadingStats && stableTotalTokens === undefined && stableTotalUsers === undefined && stableTotalTransfers === undefined;

  // CRÍTICO: Redirigir INMEDIATAMENTE si no está conectado o no está autenticado
  // NO esperar a que termine de cargar - redirigir tan pronto como sepamos que no está autorizado
  useEffect(() => {
    if (!mounted) return;
    
    // Si no está conectado, redirigir inmediatamente
    if (!isConnected) {
      router.replace('/');
      return;
    }
    
    // Si ya terminó de cargar y no está autenticado, redirigir INMEDIATAMENTE
    // No esperar más - si isLoading es false y isAuthenticated es false, redirigir
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
      return;
    }
  }, [mounted, isConnected, isAuthenticated, isLoading, router]);

  // CRÍTICO: Early return DESPUÉS de todos los hooks
  // Esto previene cualquier renderizado innecesario
  if (!mounted || !isConnected) {
    return null
  }
  
  // CRÍTICO: Si ya terminó de cargar y no está autenticado, redirigir INMEDIATAMENTE
  // No esperar más - mostrar null mientras se redirige
  if (!isLoading && !isAuthenticated) {
    return null // Redirección en progreso
  }
  
  // Si aún está cargando, mostrar loading (pero solo si realmente está cargando)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <Header />
        <div className="flex min-h-[calc(100vh-200px)] items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Loading Dashboard...</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Verifying your access permissions...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Diseño moderno 2025
  if (useModernDesign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <Header />
        
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Título Moderno */}
          <div className="mb-10 flex items-start justify-between animate-in fade-in slide-in-from-top-4 duration-700">
            <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 dark:from-slate-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-3">
              {isAdmin ? '👑 Admin Dashboard' : '📊 Dashboard'}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {isAdmin 
                ? 'Manage the entire supply chain system' 
                : 'Track your tokens and supply chain activities'}
            </p>
            </div>
            <Link href="/profile">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 rounded-xl px-6 py-6">
                <User className="h-5 w-5 mr-2" />
                View Profile
              </Button>
            </Link>
          </div>

          {/* Estadísticas Principales Modernas */}
          <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-6`}>
            {/* Total Tokens */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] animate-in fade-in slide-in-from-left-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    {isAdmin ? 'Total Tokens' : 'My Tokens'}
                  </h3>
                  <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-400/20">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent mb-2">
                  {isAdmin ? (
                    // Admin: Total del sistema
                    statsErrors?.totalTokens ? (
                      <span className="text-red-500 text-sm">Error</span>
                    ) : isInitialStatsLoading ? (
                      <Skeleton className="h-10 w-20" />
                    ) : stableTotalTokens !== undefined ? Number(stableTotalTokens) : '-'
                  ) : (
                    // Usuario: Total de sus tokens
                    isLoadingTokens ? (
                      <Skeleton className="h-10 w-20" />
                    ) : displayTokens.length
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAdmin ? 'Tokens in the system' : 'Tokens you own'}
                </p>
              </div>
            </div>

            {/* Total Users - Solo visible para administrador */}
            {isAdmin && (
              <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 delay-100">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                      Total Users
                    </h3>
                    <div className="p-2 rounded-xl bg-green-500/10 dark:bg-green-400/20">
                      <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent mb-2">
                    {statsErrors?.totalUsers ? (
                      <span className="text-red-500 text-sm">Error</span>
                    ) : isInitialStatsLoading ? (
                      <Skeleton className="h-10 w-20" />
                    ) : stableTotalUsers !== undefined ? Number(stableTotalUsers) : '-'}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Registered users
                  </p>
                </div>
              </div>
            )}

            {/* Total Transfers */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] animate-in fade-in slide-in-from-right-4 delay-200">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    {isAdmin ? 'Total Transfers' : 'My Transfers'}
                  </h3>
                  <div className="p-2 rounded-xl bg-purple-500/10 dark:bg-purple-400/20">
                    <ArrowRightLeft className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent mb-2">
                  {isAdmin ? (
                    // Admin: Total del sistema
                    statsErrors?.totalTransfers ? (
                      <span className="text-red-500 text-sm">Error</span>
                    ) : isInitialStatsLoading ? (
                      <Skeleton className="h-10 w-20" />
                    ) : stableTotalTransfers !== undefined ? Number(stableTotalTransfers) : '-'
                  ) : (
                    // Usuario: Total de sus transferencias
                    isLoadingTransfers ? (
                      <Skeleton className="h-10 w-20" />
                    ) : transferStats.total
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAdmin ? 'Completed transfers' : 'Your transfers'}
                </p>
              </div>
            </div>
          </div>

          {/* Estadísticas de Transferencias */}
          {!isAdmin && (
            <div className="mb-10">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-6">
                Transfer Statistics
              </h2>
              <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                  <div className="relative p-6">
                    <div className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent mb-2">
                      {isLoadingTransfers ? '...' : transferStats.total}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Transfers</p>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-yellow-200/50 dark:border-yellow-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                  <div className="relative p-6">
                    <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 dark:from-yellow-400 dark:to-yellow-300 bg-clip-text text-transparent mb-2">
                      {isLoadingTransfers ? '...' : transferStats.pending}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Pending</p>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-green-200/50 dark:border-green-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                  <div className="relative p-6">
                    <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent mb-2">
                      {isLoadingTransfers ? '...' : transferStats.accepted}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Accepted</p>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-red-200/50 dark:border-red-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                  <div className="relative p-6">
                    <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 dark:from-red-400 dark:to-red-300 bg-clip-text text-transparent mb-2">
                      {isLoadingTransfers ? '...' : transferStats.rejected}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Rejected</p>
                  </div>
                </div>
                
                <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                  <div className="relative p-6">
                    <div className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent mb-2">
                      {isLoadingTransfers ? '...' : transferStats.cancelled}
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Cancelled</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Panel de Administrador Moderno */}
          {isAdmin && (
            <div className="mb-10 space-y-6">
              <PauseControl />
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50/80 to-yellow-50/80 dark:from-amber-900/30 dark:to-yellow-900/30 backdrop-blur-xl border border-amber-200/50 dark:border-amber-700/50 shadow-xl">
                <div className="relative p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-amber-500/20 dark:bg-amber-400/20">
                      <Shield className="h-6 w-6 text-amber-700 dark:text-amber-300" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200">Administrator Panel</h2>
                      <p className="text-sm text-amber-700/80 dark:text-amber-300/80">Manage users, approve registrations, and oversee the system</p>
                    </div>
                  </div>
                  <Link 
                    href="/admin/users"
                    className="block p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border-2 border-amber-200 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg transition-all cursor-pointer group/link"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-amber-600 dark:text-amber-400 group-hover/link:scale-110 transition-transform" />
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Manage Users</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Approve or reject user registrations</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Contenido para usuarios regulares */}
          {!isAdmin && (
            <>
              {/* TokenTypeStatsTable solo tiene sentido para Factory (puede tener ambos tipos de tokens) */}
              {userInfo && Number(userInfo.role) === UserRole.Factory && (
                <TokenTypeStatsTable />
              )}
            </>
          )}

          {/* Mis Tokens Moderno */}
          {!isAdmin && (
            <div className="mb-10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
                  My Tokens
                </h2>
                <Link 
                  href="/tokens"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-colors"
                >
                  View All →
                </Link>
              </div>

              {tokensError ? (
                <div className="rounded-2xl bg-red-50/80 dark:bg-red-900/20 backdrop-blur-xl border border-red-200 dark:border-red-800 p-12 text-center">
                  <AlertCircle className="h-16 w-16 text-red-400 dark:text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">Error Loading Tokens</h3>
                  <p className="text-red-600 dark:text-red-400 mb-4">{tokensError.message || 'Failed to load your tokens. Please try again.'}</p>
                  <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
                </div>
              ) : isLoadingTokens && displayTokens.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6 animate-pulse">
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-4"></div>
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : displayTokens && displayTokens.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {displayTokens.slice(0, 6).map((tokenId, index) => (
                    <div
                      key={tokenId.toString()}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <TokenCard 
                        tokenId={tokenId}
                        showBalance={true}
                        onClick={() => router.push(`/tokens/${tokenId.toString()}`)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                  <Package className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No tokens yet</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {userInfo && 
                     (Number(userInfo.role) === UserRole.Producer || Number(userInfo.role) === UserRole.Factory) &&
                     Number(userInfo.status) === UserStatus.Approved
                      ? 'Create your first token to start tracking products'
                      : 'No tokens available yet'}
                  </p>
                  {userInfo && 
                   (Number(userInfo.role) === UserRole.Producer || Number(userInfo.role) === UserRole.Factory) &&
                   Number(userInfo.status) === UserStatus.Approved && (
                    <>
                      {isPaused === true && (
                        <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                          <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <AlertDescription className="text-yellow-700 dark:text-yellow-300 text-sm">
                            <strong>⚠️ Contrato Pausado:</strong> No puedes crear tokens mientras el contrato esté pausado.
                          </AlertDescription>
                        </Alert>
                      )}
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const tokenType = Number(userInfo.role) === UserRole.Producer ? 'raw' : 'product'
                          router.push(`/tokens/create?type=${tokenType}`)
                        }}
                        disabled={isPaused === true}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        Create Token
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actividad Reciente para Admin */}
          {isAdmin && (
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-6">
                System Activity
              </h2>
              <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg p-6">
                <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 text-slate-400 dark:text-slate-600" />
                  <p>Activity timeline coming soon...</p>
                </div>
              </div>
            </div>
          )}
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
        <div className="mb-8 flex items-start justify-between">
          <div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {isAdmin ? '👑 Admin Dashboard' : '📊 Dashboard'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {isAdmin 
              ? 'Manage the entire supply chain system' 
              : 'Track your tokens and supply chain activities'}
          </p>
          </div>
          <Link href="/profile">
            <Button size="default" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 rounded-xl px-6 py-5">
              <User className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          </Link>
        </div>

        {/* Estadísticas Principales */}
        <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-6`}>
          {/* Total Tokens */}
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-in fade-in slide-in-from-left-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isAdmin ? 'Total Tokens' : 'My Tokens'}
              </CardTitle>
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {isAdmin ? (
                  // Admin: Total del sistema
                  statsErrors?.totalTokens ? (
                    <span className="text-red-500 text-sm">Error</span>
                  ) : isInitialStatsLoading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : stableTotalTokens !== undefined ? Number(stableTotalTokens) : '-'
                ) : (
                  // Usuario: Total de sus tokens
                  isLoadingTokens ? (
                    <Skeleton className="h-9 w-16" />
                  ) : displayTokens.length
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {isAdmin ? 'Tokens in the system' : 'Tokens you own'}
              </p>
            </CardContent>
          </Card>

          {/* Total Users - Solo visible para administrador */}
          {isAdmin && (
            <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-slate-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 delay-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Total Users
                </CardTitle>
                <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {statsErrors?.totalUsers ? (
                    <span className="text-red-500 text-sm">Error</span>
                  ) : isInitialStatsLoading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : stableTotalUsers !== undefined ? Number(stableTotalUsers) : '-'}
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Registered users
                </p>
              </CardContent>
            </Card>
          )}

          {/* Total Transfers */}
          <Card className="border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-slate-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-in fade-in slide-in-from-right-4 delay-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {isAdmin ? 'Total Transfers' : 'My Transfers'}
              </CardTitle>
              <ArrowRightLeft className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {isAdmin ? (
                  // Admin: Total del sistema
                  statsErrors?.totalTransfers ? (
                    <span className="text-red-500 text-sm">Error</span>
                  ) : isInitialStatsLoading ? (
                    <Skeleton className="h-9 w-16" />
                  ) : stableTotalTransfers !== undefined ? Number(stableTotalTransfers) : '-'
                ) : (
                  // Usuario: Total de sus transferencias
                  isLoadingTransfers ? (
                    <Skeleton className="h-9 w-16" />
                  ) : transferStats.total
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                {isAdmin ? 'Completed transfers' : 'Your transfers'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Estadísticas de Transferencias */}
        {!isAdmin && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Transfer Statistics</h2>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
              <Card className="border-slate-200 dark:border-slate-700">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">
                    {isLoadingTransfers ? '...' : transferStats.total}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Transfers</p>
                </CardContent>
              </Card>
              
              <Card className="border-yellow-200 dark:border-yellow-800">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                    {isLoadingTransfers ? '...' : transferStats.pending}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Pending</p>
                </CardContent>
              </Card>
              
              <Card className="border-green-200 dark:border-green-800">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {isLoadingTransfers ? '...' : transferStats.accepted}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Accepted</p>
                </CardContent>
              </Card>
              
              <Card className="border-red-200 dark:border-red-800">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {isLoadingTransfers ? '...' : transferStats.rejected}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Rejected</p>
                </CardContent>
              </Card>
              
              <Card className="border-gray-200 dark:border-gray-700">
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                    {isLoadingTransfers ? '...' : transferStats.cancelled}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Cancelled</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Panel de Administrador */}
        {isAdmin && (
          <div className="mb-8 space-y-6">
            {/* Control de Pausa */}
            <PauseControl />

            <Card className="border-amber-300 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Shield className="h-6 w-6" />
                  Administrator Panel
                </CardTitle>
                <CardDescription className="dark:text-amber-300/80">
                  Manage users, approve registrations, and oversee the system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Link 
                    href="/admin/users"
                    className="flex-1 p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-amber-200 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
                    aria-label="Navigate to user management page"
                  >
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Manage Users</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Approve or reject user registrations</p>
                      </div>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Contenido para usuarios regulares */}
        {!isAdmin && (
          <>
            {/* TokenTypeStatsTable solo tiene sentido para Factory (puede tener ambos tipos de tokens) */}
            {userInfo && Number(userInfo.role) === UserRole.Factory && (
              <TokenTypeStatsTable />
            )}
          </>
        )}

        {/* Mis Tokens */}
        {!isAdmin && (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Tokens</h2>
              <Link 
                href="/tokens"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm"
              >
                View All →
              </Link>
            </div>

            {tokensError ? (
              <Card className="border-red-200 dark:border-red-800">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-16 w-16 text-red-400 dark:text-red-600 mb-4" />
                  <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
                    Error Loading Tokens
                  </h3>
                  <p className="text-red-600 dark:text-red-400 text-center mb-4">
                    {tokensError.message || 'Failed to load your tokens. Please try again.'}
                  </p>
                  <Button
                    onClick={() => window.location.reload()}
                    variant="outline"
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : isLoadingTokens && displayTokens.length === 0 ? (
              // Solo mostrar loading si no hay datos previos (displayTokens está vacío)
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader>
                      <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : displayTokens && displayTokens.length > 0 ? (
              // Mostrar tokens (mantener datos anteriores durante refetch)
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayTokens.slice(0, 6).map((tokenId) => (
                  <TokenCard 
                    key={tokenId.toString()}
                    tokenId={tokenId}
                    showBalance={true}
                    onClick={() => router.push(`/tokens/${tokenId.toString()}`)}
                  />
                ))}
              </div>
            ) : (
              <Card className="border-dashed dark:border-slate-700">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    No tokens yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-center mb-4">
                    {userInfo && 
                     (Number(userInfo.role) === UserRole.Producer || Number(userInfo.role) === UserRole.Factory) &&
                     Number(userInfo.status) === UserStatus.Approved
                      ? 'Create your first token to start tracking products'
                      : 'No tokens available yet'}
                  </p>
                  {/* Solo Producer y Factory aprobados pueden crear tokens (según el contrato) */}
                  {userInfo && 
                   (Number(userInfo.role) === UserRole.Producer || Number(userInfo.role) === UserRole.Factory) &&
                   Number(userInfo.status) === UserStatus.Approved && (
                    <>
                      {isPaused === true && (
                        <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 w-full max-w-md">
                          <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <AlertDescription className="text-yellow-700 dark:text-yellow-300 text-sm">
                            <strong>⚠️ Contrato Pausado:</strong> No puedes crear tokens mientras el contrato esté pausado.
                          </AlertDescription>
                        </Alert>
                      )}
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const tokenType = Number(userInfo.role) === UserRole.Producer ? 'raw' : 'product'
                          router.push(`/tokens/create?type=${tokenType}`)
                        }}
                        disabled={isPaused === true}
                        className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Create Token
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Actividad Reciente para Admin */}
        {isAdmin && (
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">System Activity</h2>
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions in the supply chain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-600 dark:text-slate-400">
                  <AlertCircle className="h-12 w-12 mx-auto mb-2 text-slate-400 dark:text-slate-600" />
                  <p>Activity timeline coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Component to display token statistics grouped by type in a table
 */
function TokenTypeStatsTable() {
  const { address } = useAccount();
  const { rowMaterial, finishedProduct, isLoading, error } = useUserTokenStats(address);

  // Only show rows that have tokens
  const hasRowMaterial = rowMaterial.tokenCount > 0 || rowMaterial.totalBalance > BigInt(0);
  const hasFinishedProduct = finishedProduct.tokenCount > 0 || finishedProduct.totalBalance > BigInt(0);
  const hasAnyTokens = hasRowMaterial || hasFinishedProduct;

  if (error) {
    return (
      <Card className="mb-8 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
            <AlertCircle className="h-5 w-5" />
            Error Loading Token Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600 dark:text-red-400">
            {error.message || 'Failed to load token statistics. Please try again.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-8 border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100">
          <Table2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          My Tokens by Type
        </CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-400">
          Overview of your tokens grouped by type
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : !hasAnyTokens ? (
          <div className="text-center py-8 text-slate-600 dark:text-slate-400">
            <Package className="h-12 w-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
            <p>No tokens yet. Create your first token to see statistics here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    Token Type
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    Total Balance
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                    Token Count
                  </th>
                </tr>
              </thead>
              <tbody>
                {hasRowMaterial && (
                  <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {rowMaterial.tokenTypeName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                      {rowMaterial.totalBalance.toString()}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                      {rowMaterial.tokenCount}
                    </td>
                  </tr>
                )}
                {hasFinishedProduct && (
                  <tr className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {finishedProduct.tokenTypeName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                      {finishedProduct.totalBalance.toString()}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-400">
                      {finishedProduct.tokenCount}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
