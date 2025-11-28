'use client';

import { Header } from '@/components/Header';
import { TokenCard } from '@/components/TokenCard';
import { TokenCardModern } from '@/components/TokenCardModern';
import { useGetUserTokens, useGetAllTokens } from '@/hooks/useGetUserTokens';
import { useGetUserTokensWithData } from '@/hooks/useGetUserTokensWithData';
import { useUserTokenStats } from '@/hooks/useUserTokenStats';
import { useDashboardStats } from '@/hooks/useContractReads';
import { UserStatsCards } from '@/components/admin/UserStatsCards';
import { useIsPaused } from '@/hooks/usePause';
import { useAuth } from '@/contexts/AuthContext';
import { useGetUserTransfers } from '@/hooks/useGetUserTransfers';
import { useGetAllTransfers } from '@/hooks/useGetAllTransfers';
import { TransferStatus } from '@/contracts/config';
import { validateBigIntArray } from '@/lib/validation';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Package, Users, ArrowRightLeft, AlertCircle, Pause, Table2, User, Settings } from 'lucide-react';
import Link from 'next/link';
import { UserRole, UserStatus, TokenType } from '@/contracts/config';
import { DebugLabel, DEBUG_MODE } from '@/lib/debug';

export default function DashboardPage() {
  const router = useRouter();
  const { address, isConnected } = useAccount();
  const { isAdmin, isAuthenticated, isLoading, userInfo } = useAuth();
  const queryClient = useQueryClient();
  
  // Enable modern design if enabled
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'
  
  // CRITICAL: ALL hooks must be BEFORE any conditional return
  // This prevents the "Rendered more hooks than during the previous render" error
  // FIXED ORDER: useState, useEffect, data hooks, useMemo
  
  const [mounted, setMounted] = useState(false);
  const [stableValidTokens, setStableValidTokens] = useState<bigint[] | null>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Data hooks - always execute, but are disabled if not authenticated
  // Use isAuthenticated to enable/disable queries
  const shouldFetchData = isConnected && !isLoading && isAuthenticated;
  
  // Use useGetUserTokensWithData instead of useGetUserTokens for the counter
  // This ensures we only count tokens with balance > 0, same as in the list
  const { tokens: userTokensWithData, isLoading: isLoadingTokens, error: tokensError, refetch: refetchUserTokens } = useGetUserTokensWithData(
    shouldFetchData ? address : undefined
  );
  
  // Optimization: use batch reads instead of 3 separate calls
  // CRITICAL: Disable if not authenticated to avoid unnecessary queries
  const { 
    totalTokens, 
    totalUsers, 
    totalTransfers, 
    isLoading: isLoadingStats,
    errors: statsErrors 
  } = useDashboardStats(shouldFetchData);
  
  // CRITICAL: Disable if not authenticated to avoid unnecessary queries
  const { data: isPaused } = useIsPaused(shouldFetchData);
  
  // Get user transfers for statistics (only for non-admin users)
  const { transfers, isLoading: isLoadingTransfers, refetch: refetchTransfers } = useGetUserTransfers(
    shouldFetchData && !isAdmin ? address : undefined
  );

  // Get all system transfers (only for admin)
  const { transfers: allTransfers, isLoading: isLoadingAllTransfers } = useGetAllTransfers(
    shouldFetchData && isAdmin
  );

  // Additional hooks for admin (only execute if admin)
  // Note: useGetAllTokens doesn't accept arguments, always executes but only used if admin
  const { tokens: allTokens, isLoading: isLoadingAllTokens } = useGetAllTokens()

  // Calculate token statistics by type (only for admin)
  const tokenStats = useMemo(() => {
    if (!allTokens || allTokens.length === 0) {
      return {
        rawMaterial: 0,
        finishedProduct: 0,
        total: 0
      }
    }

    const rawMaterial = allTokens.filter(t => Number(t.tokenType) === TokenType.RowMaterial).length
    const finishedProduct = allTokens.filter(t => Number(t.tokenType) === TokenType.FinishedProduct).length

    return {
      rawMaterial,
      finishedProduct,
      total: allTokens.length
    }
  }, [allTokens])

  // Calculate system transfer statistics (only for admin)
  const systemTransferStats = useMemo(() => {
    if (!allTransfers || allTransfers.length === 0) {
      return {
        pending: 0,
        accepted: 0,
        rejected: 0,
        cancelled: 0,
      }
    }
    
    return {
      pending: allTransfers.filter(t => Number(t.status) === TransferStatus.Pending).length,
      accepted: allTransfers.filter(t => Number(t.status) === TransferStatus.Accepted).length,
      rejected: allTransfers.filter(t => Number(t.status) === TransferStatus.Rejected).length,
      cancelled: allTransfers.filter(t => Number(t.status) === TransferStatus.Cancelled).length,
    }
  }, [allTransfers])
  
  // Separate transfers into sent and received
  const sentTransfers = useMemo(() => {
    if (!transfers || transfers.length === 0 || !address) return []
    return transfers.filter(t => t.from.toLowerCase() === address.toLowerCase())
  }, [transfers, address])

  const receivedTransfers = useMemo(() => {
    if (!transfers || transfers.length === 0 || !address) return []
    return transfers.filter(t => t.to.toLowerCase() === address.toLowerCase())
  }, [transfers, address])

  // Calculate sent transfer statistics
  const sentStats = useMemo(() => {
    if (!sentTransfers || sentTransfers.length === 0) {
      return {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        cancelled: 0,
      }
    }
    
    return {
      total: sentTransfers.length,
      pending: sentTransfers.filter(t => Number(t.status) === TransferStatus.Pending).length,
      accepted: sentTransfers.filter(t => Number(t.status) === TransferStatus.Accepted).length,
      rejected: sentTransfers.filter(t => Number(t.status) === TransferStatus.Rejected).length,
      cancelled: sentTransfers.filter(t => Number(t.status) === TransferStatus.Cancelled).length,
    }
  }, [sentTransfers]);

  // Calculate received transfer statistics
  const receivedStats = useMemo(() => {
    if (!receivedTransfers || receivedTransfers.length === 0) {
      return {
        total: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        cancelled: 0,
      }
    }
    
    return {
      total: receivedTransfers.length,
      pending: receivedTransfers.filter(t => Number(t.status) === TransferStatus.Pending).length,
      accepted: receivedTransfers.filter(t => Number(t.status) === TransferStatus.Accepted).length,
      rejected: receivedTransfers.filter(t => Number(t.status) === TransferStatus.Rejected).length,
      cancelled: receivedTransfers.filter(t => Number(t.status) === TransferStatus.Cancelled).length,
    }
  }, [receivedTransfers]);

  // Detect user roles
  const isProducer = userInfo && userInfo.role === BigInt(UserRole.Producer)

  // For Producer: only use sentStats
  // For Consumer: only use receivedStats
  // For Factory and Retailer: use both
  const transferStats = useMemo(() => {
    if (!userInfo) return { total: 0, pending: 0, accepted: 0, rejected: 0, cancelled: 0 }
    const roleNum = Number(userInfo.role)
    
    if (roleNum === 0) { // Producer
      return sentStats
    }
    if (roleNum === 3) { // Consumer
      return receivedStats
    }
    // Factory and Retailer: combine both
    return {
      total: sentStats.total + receivedStats.total,
      pending: sentStats.pending + receivedStats.pending,
      accepted: sentStats.accepted + receivedStats.accepted,
      rejected: sentStats.rejected + receivedStats.rejected,
      cancelled: sentStats.cancelled + receivedStats.cancelled,
    }
  }, [sentStats, receivedStats, userInfo]);
  
  // Listen for events when transfers are created, accepted, rejected, or cancelled
  useEffect(() => {
    const handleTransferCreated = () => {
      console.log('[Dashboard] New transfer created, updating statistics and tokens...')
      // Direct refetch of getUserTokens after 2 seconds to update the counter
      setTimeout(() => {
        refetchUserTokens()
        refetchTransfers()
      }, 2000)
      
      // Also invalidate all read queries after 3 seconds to ensure complete update
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['readContract'] })
        queryClient.invalidateQueries({ queryKey: ['readContracts'] })
      }, 3000)
    }
    
    const handleTransferUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ hash: string; tokenId: string; transferId: string; action: 'accept' | 'reject' | 'cancel' }>
      console.log('[Dashboard] Transfer updated (accept/reject/cancel), updating statistics and tokens...', customEvent.detail)
      // Direct refetch of getUserTokens after 2 seconds to update the counter
      // This is important for all actions:
      // - accept: Factory/Retailer/Consumer receives tokens (balance increases)
      // - reject: tokens return to sender (balance increases for sender)
      // - cancel: tokens return to sender (balance increases for sender)
      setTimeout(() => {
        refetchUserTokens()
        refetchTransfers()
      }, 2000)
      
      // Also invalidate all read queries after 3 seconds to ensure complete update
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['readContract'] })
        queryClient.invalidateQueries({ queryKey: ['readContracts'] })
      }, 3000)
    }
    
    window.addEventListener('transferCreated', handleTransferCreated)
    window.addEventListener('transferUpdated', handleTransferUpdated)
    return () => {
      window.removeEventListener('transferCreated', handleTransferCreated)
      window.removeEventListener('transferUpdated', handleTransferUpdated)
    }
  }, [refetchTransfers, refetchUserTokens, queryClient]);
  
  // Use userTokensWithData directly which already filters by balance > 0
  // This ensures the counter matches what is shown in the list
  const displayTokens = userTokensWithData || [];
  
  // Memoize values to avoid flickering during refetch
  const stableTotalTokens = useMemo(() => totalTokens, [totalTokens]);
  const stableTotalUsers = useMemo(() => totalUsers, [totalUsers]);
  const stableTotalTransfers = useMemo(() => totalTransfers, [totalTransfers]);
  
  // Only show loading on first load, not during refetch
  const isInitialStatsLoading = isLoadingStats && stableTotalTokens === undefined && stableTotalUsers === undefined && stableTotalTransfers === undefined;

  // CRITICAL: Redirect IMMEDIATELY if not connected or not authenticated
  // DO NOT wait for loading to finish - redirect as soon as we know user is not authorized
  useEffect(() => {
    if (!mounted) return;
    
    // If not connected, redirect immediately
    if (!isConnected) {
      router.replace('/');
      return;
    }
    
    // If already finished loading and not authenticated, redirect IMMEDIATELY
    // Don't wait more - if isLoading is false and isAuthenticated is false, redirect
    if (!isLoading && !isAuthenticated) {
      router.replace('/');
      return;
    }
  }, [mounted, isConnected, isAuthenticated, isLoading, router]);

  // CRITICAL: Early return AFTER all hooks
  // This prevents any unnecessary rendering
  if (!mounted || !isConnected) {
    return null
  }
  
  // CRITICAL: If already finished loading and not authenticated, redirect IMMEDIATELY
  // Don't wait more - show null while redirecting
  if (!isLoading && !isAuthenticated) {
    return null // Redirect in progress
  }
  
  // If still loading, show loading (but only if really loading)
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <DebugLabel component="DashboardPage" section="LoadingState" props={{ isLoading }} position="top-right" offset={4} />
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

  // Modern design 2025
  if (useModernDesign) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800" style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
        <Header />
        
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Modern Title */}
          <div className="relative mb-10 flex items-start justify-between animate-in fade-in slide-in-from-top-4 duration-700" style={DEBUG_MODE ? { border: '3px solid rgba(255, 165, 0, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
            <DebugLabel component="DashboardPage" section="TitleSection" props={{ useModernDesign: true, isAdmin }} position="top-right" offset={4} />
            <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 dark:from-slate-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-3">
              {isAdmin ? '👑 Admin Dashboard' : '📊 My Dashboard'}
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
                My Profile
              </Button>
            </Link>
          </div>

          {/* Modern Main Statistics */}
          <div className={`relative grid grid-cols-1 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-6`} style={DEBUG_MODE ? { border: '3px solid rgba(0, 0, 255, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
            <DebugLabel component="DashboardPage" section="MainStatsSection" props={{ useModernDesign: true, isAdmin }} position="top-right" offset={4} />
            {/* Total Users - Only visible for administrator */}
            {isAdmin && (
            <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] animate-in fade-in slide-in-from-left-4">
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

            {/* Total Tokens */}
              <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 delay-100">
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
                    // User: Total of their tokens
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
                    // User: Total of their transfers
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

          {/* Transfer Statistics */}
          {!isAdmin && (
            <div className="relative mb-10" style={DEBUG_MODE ? { border: '3px solid rgba(128, 0, 128, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
              <DebugLabel component="DashboardPage" section="TransferStatsSection" props={{ useModernDesign: true, isAdmin }} position="top-right" offset={4} />
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-6">
                Transfers Status
              </h2>
              
              {/* For Factory and Retailer: Separate into Sent and Received */}
              {(userInfo && (Number(userInfo.role) === UserRole.Factory || Number(userInfo.role) === UserRole.Retailer)) ? (
                <>
                  {/* Sent Transfer Statistics */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Sent Transfers</h3>
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                      {/* 1. TOTAL */}
                      <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                        <div className="relative p-6">
                          <div className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent mb-2">
                            {isLoadingTransfers ? '...' : sentStats.total}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</p>
                        </div>
                      </div>
                      
                      {/* 2. TOTAL PENDING BY RECEIVER */}
                      <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-yellow-200/50 dark:border-yellow-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                        <div className="relative p-6">
                          <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 dark:from-yellow-400 dark:to-yellow-300 bg-clip-text text-transparent mb-2">
                            {isLoadingTransfers ? '...' : sentStats.pending}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Pending By Receiver</p>
                        </div>
                      </div>
                      
                      {/* 3. TOTAL ACCEPTED BY RECEIVER */}
                      <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-green-200/50 dark:border-green-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                        <div className="relative p-6">
                          <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent mb-2">
                            {isLoadingTransfers ? '...' : sentStats.accepted}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Accepted By Receiver</p>
                        </div>
                      </div>
                      
                      {/* 4. TOTAL REJECTED BY RECEIVER */}
                      <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-red-200/50 dark:border-red-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                        <div className="relative p-6">
                          <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 dark:from-red-400 dark:to-red-300 bg-clip-text text-transparent mb-2">
                            {isLoadingTransfers ? '...' : sentStats.rejected}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Rejected By Receiver</p>
                        </div>
                      </div>
                      
                      {/* 5. TOTAL CANCELLED BY ME */}
                      <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                        <div className="relative p-6">
                          <div className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent mb-2">
                            {isLoadingTransfers ? '...' : sentStats.cancelled}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Cancelled By Me</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Received Transfer Statistics */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-4">Received Transfers</h3>
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                      {/* 1. TOTAL */}
                      <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                        <div className="relative p-6">
                          <div className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent mb-2">
                            {isLoadingTransfers ? '...' : receivedStats.total}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</p>
                        </div>
                      </div>
                      
                      {/* 2. TOTAL PENDING BY ME */}
                      <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-yellow-200/50 dark:border-yellow-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                        <div className="relative p-6">
                          <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 dark:from-yellow-400 dark:to-yellow-300 bg-clip-text text-transparent mb-2">
                            {isLoadingTransfers ? '...' : receivedStats.pending}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Pending By Me</p>
                        </div>
                      </div>
                      
                      {/* 3. TOTAL ACCEPTED BY ME */}
                      <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-green-200/50 dark:border-green-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                        <div className="relative p-6">
                          <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent mb-2">
                            {isLoadingTransfers ? '...' : receivedStats.accepted}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Accepted By Me</p>
                        </div>
                      </div>
                      
                      {/* 4. TOTAL REJECTED BY ME */}
                      <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-red-200/50 dark:border-red-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                        <div className="relative p-6">
                          <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 dark:from-red-400 dark:to-red-300 bg-clip-text text-transparent mb-2">
                            {isLoadingTransfers ? '...' : receivedStats.rejected}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Rejected By Me</p>
                        </div>
                      </div>
                      
                      {/* 5. TOTAL CANCELLED BY SENDER */}
                      <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                        <div className="relative p-6">
                          <div className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent mb-2">
                            {isLoadingTransfers ? '...' : receivedStats.cancelled}
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Cancelled By Sender</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                /* For Producer and Consumer: single section */
                isProducer ? (
                <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                    {/* 1. TOTAL */}
                  <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative p-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent mb-2">
                        {isLoadingTransfers ? '...' : transferStats.total}
                      </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</p>
                    </div>
                  </div>
                  
                    {/* 2. TOTAL PENDING BY RECEIVER */}
                  <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-yellow-200/50 dark:border-yellow-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative p-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 dark:from-yellow-400 dark:to-yellow-300 bg-clip-text text-transparent mb-2">
                        {isLoadingTransfers ? '...' : transferStats.pending}
                      </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Pending By Receiver</p>
                    </div>
                  </div>
                  
                    {/* 3. TOTAL ACCEPTED BY RECEIVER */}
                  <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-green-200/50 dark:border-green-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative p-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent mb-2">
                        {isLoadingTransfers ? '...' : transferStats.accepted}
                      </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Accepted By Receiver</p>
                    </div>
                  </div>
                  
                    {/* 4. TOTAL REJECTED BY RECEIVER */}
                  <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-red-200/50 dark:border-red-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative p-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 dark:from-red-400 dark:to-red-300 bg-clip-text text-transparent mb-2">
                        {isLoadingTransfers ? '...' : transferStats.rejected}
                      </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Rejected By Receiver</p>
                      </div>
                    </div>
                  
                    {/* 5. TOTAL CANCELLED BY ME */}
                    <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                      <div className="relative p-6">
                        <div className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent mb-2">
                          {isLoadingTransfers ? '...' : transferStats.cancelled}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Cancelled By Me</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* For Consumer: new format */
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                    {/* 1. TOTAL */}
                    <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                      <div className="relative p-6">
                        <div className="text-4xl font-bold bg-gradient-to-r from-slate-600 to-slate-800 dark:from-slate-300 dark:to-slate-100 bg-clip-text text-transparent mb-2">
                          {isLoadingTransfers ? '...' : transferStats.total}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total</p>
                    </div>
                  </div>
                  
                    {/* 2. TOTAL PENDING BY ME */}
                    <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-yellow-200/50 dark:border-yellow-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                      <div className="relative p-6">
                        <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 dark:from-yellow-400 dark:to-yellow-300 bg-clip-text text-transparent mb-2">
                          {isLoadingTransfers ? '...' : transferStats.pending}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Pending By Me</p>
                      </div>
                    </div>
                    
                    {/* 3. TOTAL ACCEPTED BY ME */}
                    <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-green-200/50 dark:border-green-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                      <div className="relative p-6">
                        <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent mb-2">
                          {isLoadingTransfers ? '...' : transferStats.accepted}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Accepted By Me</p>
                      </div>
                    </div>
                    
                    {/* 4. TOTAL REJECTED BY ME */}
                    <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-red-200/50 dark:border-red-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                      <div className="relative p-6">
                        <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 dark:from-red-400 dark:to-red-300 bg-clip-text text-transparent mb-2">
                          {isLoadingTransfers ? '...' : transferStats.rejected}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Rejected By Me</p>
                      </div>
                    </div>
                    
                    {/* 5. TOTAL CANCELLED BY SENDER */}
                  <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative p-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent mb-2">
                        {isLoadingTransfers ? '...' : transferStats.cancelled}
                      </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Total Cancelled By Sender</p>
                    </div>
                  </div>
                </div>
                )
              )}
            </div>
          )}

          {/* Administrator Sections */}
          {isAdmin && (
            <div className="relative mb-10 space-y-6" style={DEBUG_MODE ? { border: '3px solid rgba(255, 192, 203, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
              <DebugLabel component="DashboardPage" section="AdminSection" props={{ useModernDesign: true, isAdmin }} position="top-left" offset={4} />
              {/* User Statistics (Admin Only) */}
              <div className="relative mb-10" style={DEBUG_MODE ? { border: '3px solid rgba(255, 165, 0, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
                <DebugLabel component="DashboardPage" section="UserStatsSection" props={{ useModernDesign: true, isAdmin }} position="top-right" offset={4} />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-6">
                  User Statistics
                </h2>
                <UserStatsCards />
              </div>

              {/* Token Statistics (Admin Only) */}
              <div className="relative mb-10" style={DEBUG_MODE ? { border: '3px solid rgba(0, 255, 255, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
                <DebugLabel component="DashboardPage" section="TokenStatsSection" props={{ useModernDesign: true, isAdmin }} position="top-right" offset={4} />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-6">
                  Tokens Statistics
                </h2>
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-blue-200/50 dark:border-blue-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                          Raw Material
                        </h3>
                        <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-400/20">
                          <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent mb-2">
                        {isLoadingAllTokens ? (
                          <Skeleton className="h-10 w-20" />
                        ) : tokenStats.rawMaterial}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {tokenStats.rawMaterial === 1 ? 'Token' : 'Tokens'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-green-200/50 dark:border-green-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                          Finished Product
                        </h3>
                        <div className="p-2 rounded-xl bg-green-500/10 dark:bg-green-400/20">
                          <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent mb-2">
                        {isLoadingAllTokens ? (
                          <Skeleton className="h-10 w-20" />
                        ) : tokenStats.finishedProduct}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                        {tokenStats.finishedProduct === 1 ? 'Token' : 'Tokens'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* System Transfer Statistics (Admin Only) */}
              <div className="relative mb-10" style={DEBUG_MODE ? { border: '3px solid rgba(255, 20, 147, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
                <DebugLabel component="DashboardPage" section="SystemTransferStatsSection" props={{ useModernDesign: true, isAdmin }} position="top-right" offset={4} />
                <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent mb-6">
                  Transfer Statistics
                </h2>
                
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                  <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-yellow-200/50 dark:border-yellow-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative p-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 dark:from-yellow-400 dark:to-yellow-300 bg-clip-text text-transparent mb-2">
                        {isLoadingAllTransfers ? (
                          <Skeleton className="h-10 w-20" />
                        ) : systemTransferStats.pending}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Pending</p>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-green-200/50 dark:border-green-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative p-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-800 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent mb-2">
                        {isLoadingAllTransfers ? (
                          <Skeleton className="h-10 w-20" />
                        ) : systemTransferStats.accepted}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Accepted</p>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-red-200/50 dark:border-red-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative p-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 dark:from-red-400 dark:to-red-300 bg-clip-text text-transparent mb-2">
                        {isLoadingAllTransfers ? (
                          <Skeleton className="h-10 w-20" />
                        ) : systemTransferStats.rejected}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Rejected</p>
                    </div>
                  </div>
                  
                  <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
                    <div className="relative p-6">
                      <div className="text-4xl font-bold bg-gradient-to-r from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-100 bg-clip-text text-transparent mb-2">
                        {isLoadingAllTransfers ? (
                          <Skeleton className="h-10 w-20" />
                        ) : systemTransferStats.cancelled}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Cancelled</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modern Administrator Panel */}
              <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50/80 to-yellow-50/80 dark:from-amber-900/30 dark:to-yellow-900/30 backdrop-blur-xl border border-amber-200/50 dark:border-amber-700/50 shadow-xl" style={DEBUG_MODE ? { border: '3px solid rgba(255, 140, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
                <DebugLabel component="DashboardPage" section="AdministratorPanel" props={{ useModernDesign: true, isAdmin }} position="top-right" offset={4} />
                <div className="relative p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-amber-500/20 dark:bg-amber-400/20">
                      <Shield className="h-6 w-6 text-amber-700 dark:text-amber-300" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-amber-800 dark:text-amber-200">Administrator Panel</h2>
                      <p className="text-sm text-amber-700/80 dark:text-amber-300/80">Manage the entire supply chain system</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link 
                      href="/admin"
                      className="block p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl border-2 border-amber-200 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-lg transition-all cursor-pointer group/link"
                    >
                      <div className="flex items-center gap-3">
                        <Settings className="h-8 w-8 text-amber-600 dark:text-amber-400 group-hover/link:scale-110 transition-transform" />
                        <div>
                          <h3 className="font-semibold text-slate-800 dark:text-slate-200">Admin Panel</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">System controls and pause</p>
                        </div>
                      </div>
                    </Link>
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
            </div>
          )}

          {/* Content for regular users */}
          {!isAdmin && (
            <div className="relative" style={DEBUG_MODE ? { border: '3px solid rgba(0, 255, 0, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
              <DebugLabel component="DashboardPage" section="UserTokensSection" props={{ useModernDesign: true, isAdmin }} position="top-right" offset={4} />
              {/* TokenTypeStatsTable - Muestra tokens agrupados por tipo */}
              <TokenTypeStatsTable userRole={userInfo ? Number(userInfo.role) : null} />
            </div>
          )}

          {/* "My Tokens" section removed - Information is shown in "My Tokens by Type" */}
          {false && !isAdmin && (
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
                  <p className="text-red-600 dark:text-red-400 mb-4">{tokensError?.message || 'Failed to load your tokens. Please try again.'}</p>
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
                  {displayTokens.slice(0, 6).map((token, index) => {
                    const tokenId = typeof token === 'bigint' ? token : token.tokenId;
                    return (
                    <div
                      key={tokenId.toString()}
                      className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {useModernDesign ? (
                        <TokenCardModern 
                          tokenId={tokenId}
                          showBalance={true}
                          onClick={() => router.push(`/tokens/${tokenId.toString()}`)}
                        />
                      ) : (
                      <TokenCard 
                        tokenId={tokenId}
                        showBalance={true}
                        onClick={() => router.push(`/tokens/${tokenId.toString()}`)}
                      />
                      )}
                    </div>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-2 border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
                  <Package className="h-16 w-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">No tokens yet</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {(() => {
                      if (!userInfo || userInfo?.status === undefined) return 'No tokens available yet'
                      // TypeScript now knows userInfo is not null after the check
                      const role = Number(userInfo!.role)
                      const status = Number(userInfo!.status)
                      return (role === UserRole.Producer || role === UserRole.Factory) && status === UserStatus.Approved
                        ? 'Create your first token to start tracking products'
                        : 'No tokens available yet'
                    })()}
                  </p>
                  {(() => {
                    if (!userInfo || userInfo?.status === undefined) return null
                    // TypeScript now knows userInfo is not null after the check
                    const role = Number(userInfo!.role)
                    const status = Number(userInfo!.status)
                    if ((role === UserRole.Producer || role === UserRole.Factory) && status === UserStatus.Approved) {
                      return (
                    <>
                      {isPaused === true && (
                        <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                          <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                          <AlertDescription className="text-yellow-700 dark:text-yellow-300 text-sm">
                            <strong>⚠️ Contract Paused:</strong> You cannot create tokens while the contract is paused.
                          </AlertDescription>
                        </Alert>
                      )}
                      <Button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          const tokenType = role === UserRole.Producer ? 'raw' : 'product'
                          router.push(`/tokens/create?type=${tokenType}`)
                        }}
                        disabled={isPaused === true}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                      >
                        Create Token
                      </Button>
                    </>
                    )
                  }
                  return null
                  })()}
                </div>
              )}
            </div>
          )}

        </div>
        {/* Main page DebugLabel at the end */}
        <DebugLabel component="DashboardPage" section="MainContent" props={{ isAdmin, useModernDesign: true, isAuthenticated }} position="bottom-right" offset={4} />
      </div>
    )
  }

  // Original design
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800" style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Title */}
        <div className="relative mb-8 flex items-start justify-between" style={DEBUG_MODE ? { border: '3px solid rgba(255, 165, 0, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
          <DebugLabel component="DashboardPage" section="TitleSection" props={{ useModernDesign: false, isAdmin }} position="top-right" offset={4} />
          <div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2">
            {isAdmin ? '👑 Admin Dashboard' : '📊 My Dashboard'}
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

        {/* Main Statistics */}
        <div className={`relative grid grid-cols-1 ${isAdmin ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-6 mb-6`} style={DEBUG_MODE ? { border: '3px solid rgba(0, 0, 255, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
          <DebugLabel component="DashboardPage" section="MainStatsSection" props={{ useModernDesign: false, isAdmin }} position="top-right" offset={4} />
          {/* Total Users - Solo visible para administrador */}
          {isAdmin && (
            <Card className="border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50 to-white dark:from-green-900/20 dark:to-slate-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-in fade-in slide-in-from-left-4">
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

          {/* Total Tokens */}
          <Card className="border-blue-200 dark:border-blue-800 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-slate-800 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] animate-in fade-in slide-in-from-bottom-4 delay-100">
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
                  // User: Total of their tokens
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
                  // User: Total of their transfers
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

        {/* Transfer Statistics */}
        {!isAdmin && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Transfers Status</h2>
            
            {/* For Factory and Retailer: Separate into Sent and Received */}
            {(userInfo && (Number(userInfo.role) === UserRole.Factory || Number(userInfo.role) === UserRole.Retailer)) ? (
              <>
                {/* Sent Transfer Statistics */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">Sent Transfers</h3>
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                    {/* 1. TOTAL */}
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">
                          {isLoadingTransfers ? '...' : sentStats.total}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total</p>
                      </CardContent>
                    </Card>
                    
                    {/* 2. TOTAL PENDING BY RECEIVER */}
                    <Card className="border-yellow-200 dark:border-yellow-800">
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                          {isLoadingTransfers ? '...' : sentStats.pending}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Pending By Receiver</p>
                      </CardContent>
                    </Card>
                    
                    {/* 3. TOTAL ACCEPTED BY RECEIVER */}
                    <Card className="border-green-200 dark:border-green-800">
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {isLoadingTransfers ? '...' : sentStats.accepted}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Accepted By Receiver</p>
                      </CardContent>
                    </Card>
                    
                    {/* 4. TOTAL REJECTED BY RECEIVER */}
                    <Card className="border-red-200 dark:border-red-800">
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                          {isLoadingTransfers ? '...' : sentStats.rejected}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Rejected By Receiver</p>
                      </CardContent>
                    </Card>
                    
                    {/* 5. TOTAL CANCELLED BY ME */}
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                          {isLoadingTransfers ? '...' : sentStats.cancelled}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Cancelled By Me</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Received Transfer Statistics */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-3">Received Transfers</h3>
                  <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                    {/* 1. TOTAL */}
                    <Card className="border-slate-200 dark:border-slate-700">
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">
                          {isLoadingTransfers ? '...' : receivedStats.total}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total</p>
                      </CardContent>
                    </Card>
                    
                    {/* 2. TOTAL PENDING BY ME */}
                    <Card className="border-yellow-200 dark:border-yellow-800">
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                          {isLoadingTransfers ? '...' : receivedStats.pending}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Pending By Me</p>
                      </CardContent>
                    </Card>
                    
                    {/* 3. TOTAL ACCEPTED BY ME */}
                    <Card className="border-green-200 dark:border-green-800">
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                          {isLoadingTransfers ? '...' : receivedStats.accepted}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Accepted By Me</p>
                      </CardContent>
                    </Card>
                    
                    {/* 4. TOTAL REJECTED BY ME */}
                    <Card className="border-red-200 dark:border-red-800">
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                          {isLoadingTransfers ? '...' : receivedStats.rejected}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Rejected By Me</p>
                      </CardContent>
                    </Card>
                    
                    {/* 5. TOTAL CANCELLED BY SENDER */}
                    <Card className="border-gray-200 dark:border-gray-700">
                      <CardContent className="pt-6">
                        <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                          {isLoadingTransfers ? '...' : receivedStats.cancelled}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Cancelled By Sender</p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            ) : (
              /* For Producer and Consumer: single section */
              userInfo && Number(userInfo.role) === UserRole.Producer ? (
              <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                  {/* 1. TOTAL */}
                <Card className="border-slate-200 dark:border-slate-700">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">
                      {isLoadingTransfers ? '...' : transferStats.total}
                    </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total</p>
                  </CardContent>
                </Card>
                
                  {/* 2. TOTAL PENDING BY RECEIVER */}
                <Card className="border-yellow-200 dark:border-yellow-800">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                      {isLoadingTransfers ? '...' : transferStats.pending}
                    </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Pending By Receiver</p>
                  </CardContent>
                </Card>
                
                  {/* 3. TOTAL ACCEPTED BY RECEIVER */}
                <Card className="border-green-200 dark:border-green-800">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {isLoadingTransfers ? '...' : transferStats.accepted}
                    </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Accepted By Receiver</p>
                  </CardContent>
                </Card>
                
                  {/* 4. TOTAL REJECTED BY RECEIVER */}
                <Card className="border-red-200 dark:border-red-800">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                      {isLoadingTransfers ? '...' : transferStats.rejected}
                    </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Rejected By Receiver</p>
                    </CardContent>
                  </Card>
                
                  {/* 5. TOTAL CANCELLED BY ME */}
                  <Card className="border-gray-200 dark:border-gray-700">
                    <CardContent className="pt-6">
                      <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                        {isLoadingTransfers ? '...' : transferStats.cancelled}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Cancelled By Me</p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                /* For Consumer: new format */
                <div className="grid gap-4 grid-cols-2 md:grid-cols-5">
                  {/* 1. TOTAL */}
                  <Card className="border-slate-200 dark:border-slate-700">
                    <CardContent className="pt-6">
                      <div className="text-3xl font-bold text-slate-700 dark:text-slate-300">
                        {isLoadingTransfers ? '...' : transferStats.total}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total</p>
                  </CardContent>
                </Card>
                
                  {/* 2. TOTAL PENDING BY ME */}
                  <Card className="border-yellow-200 dark:border-yellow-800">
                    <CardContent className="pt-6">
                      <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                        {isLoadingTransfers ? '...' : transferStats.pending}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Pending By Me</p>
                    </CardContent>
                  </Card>
                  
                  {/* 3. TOTAL ACCEPTED BY ME */}
                  <Card className="border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                      <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {isLoadingTransfers ? '...' : transferStats.accepted}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Accepted By Me</p>
                    </CardContent>
                  </Card>
                  
                  {/* 4. TOTAL REJECTED BY ME */}
                  <Card className="border-red-200 dark:border-red-800">
                    <CardContent className="pt-6">
                      <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                        {isLoadingTransfers ? '...' : transferStats.rejected}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Rejected By Me</p>
                    </CardContent>
                  </Card>
                  
                  {/* 5. TOTAL CANCELLED BY SENDER */}
                <Card className="border-gray-200 dark:border-gray-700">
                  <CardContent className="pt-6">
                    <div className="text-3xl font-bold text-gray-600 dark:text-gray-400">
                      {isLoadingTransfers ? '...' : transferStats.cancelled}
                    </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Total Cancelled By Sender</p>
                  </CardContent>
                </Card>
              </div>
              )
            )}
          </div>
        )}

        {/* Administrator Panel */}
        {isAdmin && (
          <div className="mb-8 space-y-6">
            <Card className="border-amber-300 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <Shield className="h-6 w-6" />
                  Administrator Panel
                </CardTitle>
                <CardDescription className="dark:text-amber-300/80">
                  Manage the entire supply chain system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link 
                    href="/admin"
                    className="p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-amber-200 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
                    aria-label="Navigate to admin panel"
                  >
                    <div className="flex items-center gap-3">
                      <Settings className="h-8 w-8 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                      <div>
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Admin Panel</h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">System statistics and controls</p>
                      </div>
                    </div>
                  </Link>
                  <Link 
                    href="/admin/users"
                    className="p-4 bg-white dark:bg-slate-800 rounded-lg border-2 border-amber-200 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-md transition-all cursor-pointer group"
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

        {/* Content for regular users */}
        {!isAdmin && (
          <div className="relative" style={DEBUG_MODE ? { border: '3px solid rgba(0, 255, 0, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
            <DebugLabel component="DashboardPage" section="UserTokensSection" props={{ useModernDesign: false, isAdmin }} position="top-right" offset={4} />
            {/* TokenTypeStatsTable - Shows tokens grouped by type for all users */}
            <TokenTypeStatsTable userRole={userInfo ? Number(userInfo.role) : null} />
          </div>
        )}

        {/* Sección "My Tokens" eliminada - La información se muestra en "My Tokens by Type" */}

      </div>
      {/* DebugLabel de la página principal al final */}
      <DebugLabel component="DashboardPage" section="MainContent" props={{ isAdmin, useModernDesign: false, isAuthenticated }} position="bottom-right" offset={4} />
    </div>
  );
}

/**
 * Component to display token statistics grouped by type in a table with tokens listed below each category
 */
function TokenTypeStatsTable({ userRole }: { userRole: number | null }) {
  const { address } = useAccount();
  const router = useRouter();
  const { rowMaterial, finishedProduct, isLoading, error } = useUserTokenStats(address);
  const { tokens: userTokens, isLoading: isLoadingTokens } = useGetUserTokensWithData(address);
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'
  
  // DEBUG_MODE is already imported at module level
  
  // Separate tokens by type
  const rawMaterialTokens = useMemo(() => {
    if (!userTokens) return []
    return userTokens.filter(token => Number(token.tokenType) === TokenType.RowMaterial)
  }, [userTokens])
  
  const finishedProductTokens = useMemo(() => {
    if (!userTokens) return []
    return userTokens.filter(token => Number(token.tokenType) === TokenType.FinishedProduct)
  }, [userTokens])

  // Determine which token types the user can see according to their role
  const isProducer = userRole === UserRole.Producer
  const isFactory = userRole === UserRole.Factory
  const isRetailer = userRole === UserRole.Retailer
  const isConsumer = userRole === UserRole.Consumer
  
  // Producer: can only see Raw Material
  // Factory: can see both types
  // Retailer/Consumer: can only see Finished Product
  const shouldShowRawMaterial = isProducer || isFactory
  const shouldShowFinishedProduct = isFactory || isRetailer || isConsumer

  // Only show rows that have tokens AND that the user can see according to their role
  // Note: We only check tokenCount, not totalBalance, because it doesn't make sense to sum tokens of different types
  const hasRowMaterial = shouldShowRawMaterial && rowMaterial.tokenCount > 0;
  const hasFinishedProduct = shouldShowFinishedProduct && finishedProduct.tokenCount > 0;
  const hasAnyTokens = hasRowMaterial || hasFinishedProduct;

  if (error) {
    return (
      <Card className="mb-8 border-red-200 dark:border-red-800" style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
        <DebugLabel component="TokenTypeStatsTable" section="ErrorState" props={{ hasError: true }} position="top-right" offset={4} />
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
    <Card className="mb-8 border-slate-200 dark:border-slate-700" style={DEBUG_MODE ? { border: '3px solid rgba(0, 255, 255, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
      <DebugLabel component="TokenTypeStatsTable" section="MainContent" props={{ isLoading, hasAnyTokens }} position="top-right" offset={4} />
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
          <div className="space-y-6">
            {/* Raw Material Section - Only show if user can see this type AND has tokens */}
                {shouldShowRawMaterial && hasRowMaterial && rowMaterial.tokenCount > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {rowMaterial.tokenTypeName}
                        </span>
                      </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Count: <span className="font-semibold text-slate-800 dark:text-slate-200">{rowMaterial.tokenCount}</span>
                    </span>
                  </div>
                </div>
                
                {isLoadingTokens ? (
                  <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : rawMaterialTokens.length > 0 ? (
                  <div className="space-y-1 pl-5">
                    {rawMaterialTokens.map((token) => (
                      <div 
                        key={token.tokenId.toString()} 
                        className="flex items-center justify-between py-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded px-2 -mx-2 cursor-pointer"
                        onClick={() => router.push(`/tokens/${token.tokenId.toString()}`)}
                      >
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {token.name || `Token #${token.tokenId.toString()}`}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 font-semibold">
                          {token.balance?.toString() || '0'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2 pl-5">
                    No raw material tokens found
                  </p>
                )}
              </div>
                )}

            {/* Finished Product Section - Only show if user can see this type AND has tokens */}
                {shouldShowFinishedProduct && hasFinishedProduct && finishedProduct.tokenCount > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {finishedProduct.tokenTypeName}
                        </span>
                      </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-600 dark:text-slate-400">
                      Count: <span className="font-semibold text-slate-800 dark:text-slate-200">{finishedProduct.tokenCount}</span>
                    </span>
                  </div>
                </div>
                
                {isLoadingTokens ? (
                  <div className="space-y-2">
                    {[...Array(2)].map((_, i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : finishedProductTokens.length > 0 ? (
                  <div className="space-y-1 pl-5">
                    {finishedProductTokens.map((token) => (
                      <div 
                        key={token.tokenId.toString()} 
                        className="flex items-center justify-between py-1 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded px-2 -mx-2 cursor-pointer"
                        onClick={() => router.push(`/tokens/${token.tokenId.toString()}`)}
                      >
                        <span className="text-slate-700 dark:text-slate-300 font-medium">
                          {token.name || `Token #${token.tokenId.toString()}`}
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 font-semibold">
                          {token.balance?.toString() || '0'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-2 pl-5">
                    No finished product tokens found
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
