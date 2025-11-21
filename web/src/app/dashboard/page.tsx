'use client';

import { Header } from '@/components/Header';
import { UserProfileCard } from '@/components/UserProfileCard';
import { TokenCard } from '@/components/TokenCard';
import { QuickActions } from '@/components/QuickActions';
import { PauseControl } from '@/components/admin/PauseControl';
import { useGetUserTokens } from '@/hooks/useGetUserTokens';
import { useDashboardStats } from '@/hooks/useContractReads';
import { useIsPaused } from '@/hooks/usePause';
import { useAuth } from '@/contexts/AuthContext';
import { validateBigIntArray } from '@/lib/validation';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Package, Users, ArrowRightLeft, AlertCircle, Pause } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { isAdmin, isAuthenticated, isLoading, userInfo } = useAuth();
  
  const { data: userTokens, isLoading: isLoadingTokens, error: tokensError } = useGetUserTokens(address);
  // Optimización: usar batch reads en lugar de 3 llamadas separadas
  const { 
    totalTokens, 
    totalUsers, 
    totalTransfers, 
    isLoading: isLoadingStats,
    errors: statsErrors 
  } = useDashboardStats();
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

  // No renderizar nada hasta que esté montado
  if (!mounted) {
    return null;
  }

  // Si no está conectado, no renderizar nada (redirección en progreso)
  if (!isConnected) {
    return null;
  }

  // Si no está autenticado y ya terminó de cargar, no renderizar nada (redirección en progreso)
  if (!isLoading && !isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
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
    );
  }

  // Verificación final: solo renderizar si está autenticado
  if (!isAuthenticated) {
    return null;
  }

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
                ) : isLoadingStats ? (
                  <Skeleton className="h-9 w-16" />
                ) : totalTokens !== undefined ? Number(totalTokens) : '-'}
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
                  ) : isLoadingStats ? (
                    <Skeleton className="h-9 w-16" />
                  ) : totalUsers !== undefined ? Number(totalUsers) : '-'}
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
                ) : isLoadingStats ? (
                  <Skeleton className="h-9 w-16" />
                ) : totalTransfers !== undefined ? Number(totalTransfers) : '-'}
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

            {isLoadingTokens ? (
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
            ) : tokensError ? (
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
            ) : (() => {
              // Validar userTokens antes de usar
              const validTokens = validateBigIntArray(userTokens)
              if (validTokens && validTokens.length > 0) {
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {validTokens.slice(0, 6).map((tokenId) => (
                      <TokenCard 
                        key={tokenId.toString()}
                        tokenId={tokenId}
                        showBalance={true}
                        onClick={() => router.push(`/tokens/${tokenId.toString()}`)}
                      />
                    ))}
                  </div>
                )
              }
              return null
            })() || (
              <Card className="border-dashed dark:border-slate-700">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Package className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    No tokens yet
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 text-center mb-4">
                    Create your first token to start tracking products
                  </p>
                  {isPaused === true && (
                    <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 w-full max-w-md">
                      <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                      <AlertDescription className="text-yellow-700 dark:text-yellow-300 text-sm">
                        <strong>⚠️ Contrato Pausado:</strong> No puedes crear tokens mientras el contrato esté pausado.
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button
                    onClick={() => router.push('/tokens/create')}
                    disabled={isPaused === true}
                    className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Token
                  </Button>
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
