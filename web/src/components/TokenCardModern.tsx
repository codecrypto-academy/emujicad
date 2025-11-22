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

interface TokenCardModernProps {
  tokenId: bigint
  showBalance?: boolean
  onClick?: () => void
}

export function TokenCardModern({ tokenId, showBalance = false, onClick }: TokenCardModernProps) {
  const { address } = useAccount()
  const { data: rawTokenData, isLoading: isLoadingToken } = useGetToken(tokenId)
  const { data: balance, isLoading: isLoadingBalance } = useGetTokenBalance(tokenId, address)

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

  // Formatear fecha
  const dateCreated = displayTokenData.createdAt
    ? new Date(Number(displayTokenData.createdAt) * 1000)
    : null
  const formattedDate = dateCreated
    ? dateCreated.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : 'N/A'

  // Formatear dirección del creador
  const creatorAddress = displayTokenData.creator || 'N/A'
  const shortAddress = creatorAddress.length > 10
    ? `${creatorAddress.slice(0, 6)}...${creatorAddress.slice(-4)}`
    : creatorAddress

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
              <Hash className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-sm font-mono text-slate-500 dark:text-slate-400">
                #{tokenId.toString()}
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
            <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
              {shortAddress}
            </span>
          </div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Created</span>
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {formattedDate}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

