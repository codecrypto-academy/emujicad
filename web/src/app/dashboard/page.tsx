'use client';

import { Header } from '@/components/Header';
import { UserProfileCard } from '@/components/UserProfileCard';
import { TokenCard } from '@/components/TokenCard';
import { QuickActions } from '@/components/QuickActions';
import { PauseControl } from '@/components/admin/PauseControl';
import { useGetUserTokens } from '@/hooks/useGetUserTokens';
import { useUserTokenStats } from '@/hooks/useUserTokenStats';
import { useDashboardStats } from '@/hooks/useContractReads';
import { useIsPaused } from '@/hooks/usePause';
import { useAuth } from '@/contexts/AuthContext';
import { validateBigIntArray } from '@/lib/validation';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Package, Users, ArrowRightLeft, AlertCircle, Pause, Table2 } from 'lucide-react';
import Link from 'next/link';
import { UserRole, UserStatus } from '@/contracts/config';

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { isAdmin, isAuthenticated, isLoading, userInfo } = useAuth();
  
  // Activar diseño moderno si está habilitado
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'
  
  const { data: userTokens, isLoading: isLoadingTokens, error: tokensError } = useGetUserTokens(address);
  
  // Memoizar tokens validados para evitar re-renders innecesarios
  const validTokens = useMemo(() => {
    return validateBigIntArray(userTokens);
  }, [userTokens]);
  
  // Mantener tokens estables durante refetch para evitar parpadeos
  const [stableValidTokens, setStableValidTokens] = useState<bigint[] | null>(null);
  
  useEffect(() => {
    if (validTokens && validTokens.length > 0) {
      setStableValidTokens(validTokens);
    }
  }, [validTokens]);
  
  // Usar tokens estables si existen, sino usar los actuales
  const displayTokens = stableValidTokens || validTokens || [];
  // Optimización: usar batch reads en lugar de 3 llamadas separadas
  const { 
    totalTokens, 
    totalUsers, 
    totalTransfers, 
    isLoading: isLoadingStats,
    errors: statsErrors 
  } = useDashboardStats();
  
  // Memoizar valores para evitar parpadeos durante refetch
  const stableTotalTokens = useMemo(() => totalTokens, [totalTokens]);
  const stableTotalUsers = useMemo(() => totalUsers, [totalUsers]);
  const stableTotalTransfers = useMemo(() => totalTransfers, [totalTransfers]);
  
  // Solo mostrar loading en la primera carga, no durante refetch
  const isInitialStatsLoading = isLoadingStats && stableTotalTokens === undefined && stableTotalUsers === undefined && stableTotalTransfers === undefined;
  const { data: isPaused } = useIsPaused();
  
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirigir inmediatamente si no está autenticado (sin esperar a que termine de cargar)
  useEffect(() => {
    if (!mounted) return;
    
    // Si no está conectado, redirigir inmediatamente
    if (!isConnected) {
      router.replace('/');
      return;
    }
    
    // Si ya terminó de cargar y no está autenticado, redirigir inmediatamente
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
      return;
    }
  }, [mounted, isConnected, isAuthenticated, isLoading, router]);

  // Estado de carga unificado - evitar múltiples re-renders
  // Renderizar siempre el mismo contenido en servidor y cliente para evitar hydration errors
  const isInitialLoading = isLoading || !isConnected;
  const shouldShowContent = isConnected && !isLoading && isAuthenticated;

  // No renderizar nada hasta que esté montado o mientras carga la autenticación
  // Pero siempre renderizar la misma estructura para evitar hydration mismatch
  if (!mounted || isInitialLoading) {
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

  // Si no está autenticado después de cargar, no renderizar (redirección en progreso)
  if (!shouldShowContent) {
    return null;
  }

  // Diseño moderno 2025
  if (useModernDesign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <Header />
        
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Título Moderno */}
          <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 dark:from-slate-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-3">
              {isAdmin ? '👑 Admin Dashboard' : '📊 Dashboard'}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {isAdmin 
                ? 'Manage the entire supply chain system' 
                : 'Track your tokens and supply chain activities'}
            </p>
          </div>

          {/* Estadísticas Principales Modernas */}
          <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-10`}>
            {/* Total Tokens */}
            <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] animate-in fade-in slide-in-from-left-4">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                    Total Tokens
                  </h3>
                  <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-400/20">
                    <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent mb-2">
                  {statsErrors?.totalTokens ? (
                    <span className="text-red-500 text-sm">Error</span>
                  ) : isInitialStatsLoading ? (
                    <Skeleton className="h-10 w-20" />
                  ) : stableTotalTokens !== undefined ? Number(stableTotalTokens) : '-'}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tokens in the system
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
                    Total Transfers
                  </h3>
                  <div className="p-2 rounded-xl bg-purple-500/10 dark:bg-purple-400/20">
                    <ArrowRightLeft className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-300 bg-clip-text text-transparent mb-2">
                  {statsErrors?.totalTransfers ? (
                    <span className="text-red-500 text-sm">Error</span>
                  ) : isInitialStatsLoading ? (
                    <Skeleton className="h-10 w-20" />
                  ) : stableTotalTransfers !== undefined ? Number(stableTotalTransfers) : '-'}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Completed transfers
                </p>
              </div>
            </div>
          </div>

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
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <div className="lg:col-span-1">
                  <UserProfileCard />
                </div>
                <div className="lg:col-span-2">
                  <QuickActions />
                </div>
              </div>
              <TokenTypeStatsTable />
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {isAdmin ? '👑 Admin Dashboard' : '📊 Dashboard'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {isAdmin 
              ? 'Manage the entire supply chain system' 
              : 'Track your tokens and supply chain activities'}
          </p>
        </div>

        {/* Estadísticas Principales */}
        <div className={`grid grid-cols-1 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-8`}>
          {/* Total Tokens */}
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-in fade-in slide-in-from-left-4">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Total Tokens
              </CardTitle>
              <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {statsErrors?.totalTokens ? (
                  <span className="text-red-500 text-sm">Error</span>
                ) : isInitialStatsLoading ? (
                  <Skeleton className="h-9 w-16" />
                ) : stableTotalTokens !== undefined ? Number(stableTotalTokens) : '-'}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Tokens in the system
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
                Total Transfers
              </CardTitle>
              <ArrowRightLeft className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {statsErrors?.totalTransfers ? (
                  <span className="text-red-500 text-sm">Error</span>
                ) : isInitialStatsLoading ? (
                  <Skeleton className="h-9 w-16" />
                ) : stableTotalTransfers !== undefined ? Number(stableTotalTransfers) : '-'}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Completed transfers
              </p>
            </CardContent>
          </Card>
        </div>

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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Perfil del Usuario */}
              <div className="lg:col-span-1">
                <UserProfileCard />
              </div>

              {/* Acciones Rápidas */}
              <div className="lg:col-span-2">
                <QuickActions />
              </div>
            </div>

            {/* Tabla de Tokens por Tipo */}
            <TokenTypeStatsTable />
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
