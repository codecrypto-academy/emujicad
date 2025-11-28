'use client'

import React from 'react'
import { useGetToken, useGetTokenBalance } from '@/hooks/useGetUserTokens'
import { useAccount } from 'wagmi'
import { validateTokenDataTuple } from '@/lib/validation'
import type { TokenData } from '@/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TokenType } from '@/contracts/config'
import { Package, Calendar, User, Hash } from 'lucide-react'
import { AddressDisplay } from '@/components/AddressDisplay'

interface TokenCardModernProps {
  tokenId: bigint
  showBalance?: boolean
  onClick?: () => void
}

export function TokenCardModern({ tokenId, showBalance = false, onClick }: TokenCardModernProps) {
  const { address } = useAccount()
  const { data: rawTokenData, isLoading: isLoadingToken, refetch: refetchToken } = useGetToken(tokenId)
  const { data: balance, isLoading: isLoadingBalance, refetch: refetchBalance } = useGetTokenBalance(tokenId, address)
  
  // Listen for transfer events to force immediate balance update
  React.useEffect(() => {
    const handleTransferCreated = () => {
      console.log(`[TokenCardModern] Transfer created, refetching balance for token ${tokenId.toString()}...`)
      // Refetch balance after 2 seconds to allow blockchain to update
      setTimeout(() => {
        refetchBalance()
      }, 2000)
    }
    
    const handleTransferUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<{ hash: string; tokenId: string; transferId: string; action: 'accept' | 'reject' | 'cancel' }>
      // Refetch balance for all tokens when any transfer is updated
      // This ensures balances update even if the tokenId doesn't match (e.g., when sender's balance changes)
      console.log(`[TokenCardModern] Transfer updated, refetching balance for token ${tokenId.toString()}...`, customEvent.detail)
      setTimeout(() => {
        refetchBalance()
      }, 2000)
    }
    
    window.addEventListener('transferCreated', handleTransferCreated)
    window.addEventListener('transferUpdated', handleTransferUpdated)
    return () => {
      window.removeEventListener('transferCreated', handleTransferCreated)
      window.removeEventListener('transferUpdated', handleTransferUpdated)
    }
  }, [tokenId, refetchBalance])

  const tokenData = React.useMemo(() => {
    return rawTokenData
      ? (Array.isArray(rawTokenData)
          ? validateTokenDataTuple(rawTokenData) ?? undefined
          : undefined)
      : undefined
  }, [rawTokenData])

  const stableTokenDataRef = React.useRef<TokenData | undefined>(tokenData)
  const stableBalanceRef = React.useRef<bigint | undefined>(
    balance !== null && balance !== undefined && typeof balance === 'bigint' ? balance : undefined
  )

  React.useEffect(() => {
    if (tokenData) {
      if (!stableTokenDataRef.current || tokenData.id !== stableTokenDataRef.current.id) {
        stableTokenDataRef.current = tokenData
      }
    }
  }, [tokenData?.id])

  React.useEffect(() => {
    if (balance !== undefined && balance !== null && typeof balance === 'bigint') {
      stableBalanceRef.current = balance
    }
  }, [balance])

  const displayTokenData = stableTokenDataRef.current || tokenData
  const displayBalance = stableBalanceRef.current !== undefined ? stableBalanceRef.current : balance
  
  // Obtener datos del token padre si existe (después de que displayTokenData esté definido)
  const parentTokenId = React.useMemo(() => {
    if (!displayTokenData?.parentToken) return undefined;
    return displayTokenData.parentToken !== BigInt(0) ? displayTokenData.parentToken : undefined;
  }, [displayTokenData?.parentToken]);
  
  const { data: rawParentTokenData, isLoading: isLoadingParentToken } = useGetToken(parentTokenId);
  const parentTokenData = React.useMemo(() => {
    return rawParentTokenData
      ? (Array.isArray(rawParentTokenData)
          ? validateTokenDataTuple(rawParentTokenData) ?? undefined
          : undefined)
      : undefined;
  }, [rawParentTokenData]);

  const isInitialLoading = (isLoadingToken && !displayTokenData) || (showBalance && isLoadingBalance && displayBalance === undefined) || tokenId === undefined

  if (isInitialLoading) {
    return (
      <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg hover:shadow-xl rounded-3xl overflow-hidden transition-all duration-500 group cursor-pointer">
        <CardHeader className="pb-3">
          <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-xl w-3/4 animate-pulse"></div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-2/3 animate-pulse"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-lg w-1/2 animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  if (!displayTokenData) {
    return null
  }

  const tokenType = Number(displayTokenData.tokenType) as TokenType
  const isRowMaterial = tokenType === TokenType.RowMaterial

  // Formatear fecha y hora completa
  const dateCreated = displayTokenData.createdAt
    ? new Date(Number(displayTokenData.createdAt) * 1000)
    : null
  const formattedDate = dateCreated
    ? dateCreated.toLocaleString('en-US', { 
        month: '2-digit', 
        day: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      })
    : 'N/A'


  return (
    <Card
      onClick={onClick}
      className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg hover:shadow-2xl rounded-3xl overflow-hidden transition-all duration-500 group cursor-pointer hover:scale-[1.02] hover:-translate-y-1 border border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300/50 dark:hover:border-blue-600/50"
    >
      <CardHeader className="pb-4 space-y-4">
        {/* Header con gradiente */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <div className={`p-2 rounded-xl bg-gradient-to-br ${
                isRowMaterial 
                  ? 'from-blue-500/10 to-cyan-500/10 dark:from-blue-400/20 dark:to-cyan-400/20' 
                  : 'from-purple-500/10 to-pink-500/10 dark:from-purple-400/20 dark:to-pink-400/20'
              }`}>
                <Package className={`h-5 w-5 ${
                  isRowMaterial 
                    ? 'text-blue-600 dark:text-blue-400' 
                    : 'text-purple-600 dark:text-purple-400'
                }`} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                {displayTokenData.name || 'Unnamed Token'}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Token ID: <span className="font-mono">{tokenId.toString()}</span>
              </span>
            </div>
          </div>
          <Badge 
            className={`rounded-xl px-3 py-1.5 text-xs font-semibold border-0 ${
              isRowMaterial
                ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-300 dark:from-blue-400/20 dark:to-cyan-400/20'
                : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-300 dark:from-purple-400/20 dark:to-pink-400/20'
            }`}
          >
            {isRowMaterial ? 'Raw Material' : 'Finished Product'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        {/* Balance destacado */}
        {showBalance && displayBalance !== undefined && (
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200/50 dark:border-blue-800/50">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">My Balance</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {displayBalance !== null && displayBalance !== undefined && typeof displayBalance === 'bigint' ? displayBalance.toString() : '0'}
              </span>
            </div>
          </div>
        )}

        {/* Información del token */}
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Supply</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {displayTokenData.totalSupply?.toString() || 'N/A'}
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Creator</span>
            </div>
            <AddressDisplay address={displayTokenData.creator || 'N/A'} className="text-xs" />
          </div>

          {/* Parent Token solo para Finished Product (no para Raw Material) */}
          {!isRowMaterial && displayTokenData.parentToken && displayTokenData.parentToken !== BigInt(0) && (
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700/50">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Parent Token</span>
              <div className="flex items-center gap-2">
                <Badge variant="outline">#{displayTokenData.parentToken.toString()}</Badge>
                {isLoadingParentToken ? (
                  <span className="text-xs text-slate-500 dark:text-slate-400">Loading...</span>
                ) : parentTokenData?.name ? (
                  <span className="text-xs text-slate-500 dark:text-slate-400">({parentTokenData.name})</span>
                ) : null}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Created</span>
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {formattedDate}
            </span>
          </div>

          {/* Features - Solo mostrar si hay features */}
          {displayTokenData.features && displayTokenData.features.length > 0 && displayTokenData.features !== '{}' && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50">
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">Features</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 break-words">
                {displayTokenData.features}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

