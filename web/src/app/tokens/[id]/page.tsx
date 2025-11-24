'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { useGetToken, useGetTokenBalance } from '@/hooks/useGetUserTokens'
import { useGetAllTransfers } from '@/hooks/useGetAllTransfers'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Package, ArrowLeft, Send, ExternalLink, Calendar, User, Hash, TrendingUp, AlertCircle, Loader2 } from 'lucide-react'
import { validateTokenDataTuple } from '@/lib/validation'
import type { TokenData } from '@/types'
import { AddressDisplay } from '@/components/AddressDisplay'
import { TokenType, TransferStatus, UserRole } from '@/contracts/config'
import Link from 'next/link'
import { useTokenTraceability } from '@/hooks/useTokenTraceability'
import { TraceabilityTimeline } from '@/components/TraceabilityTimeline'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function TokenDetailPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { address } = useAccount()
  const { userInfo } = useAuth()
  
  const tokenId = BigInt(id)
  
  // Obtener datos del token
  const { data: rawTokenData, isLoading: isLoadingToken } = useGetToken(tokenId)
  const { data: balance, isLoading: isLoadingBalance } = useGetTokenBalance(tokenId, address)
  
  // Obtener todas las transferencias y filtrar por tokenId
  const { transfers: allTransfers, isLoading: isLoadingTransfers } = useGetAllTransfers(true)
  
  // Obtener trazabilidad end-to-end
  const { traceability, isLoading: isLoadingTraceability } = useTokenTraceability(tokenId)
  
  // Validar y procesar datos del token
  const tokenData = useMemo(() => {
    return rawTokenData
      ? (Array.isArray(rawTokenData)
          ? validateTokenDataTuple(rawTokenData) ?? undefined
          : undefined)
      : undefined
  }, [rawTokenData])
  
  // Obtener datos del token padre si existe
  const parentTokenId = useMemo(() => {
    if (!tokenData?.parentToken) return undefined
    return tokenData.parentToken !== BigInt(0) ? tokenData.parentToken : undefined
  }, [tokenData?.parentToken])
  
  const { data: rawParentTokenData, isLoading: isLoadingParentToken } = useGetToken(parentTokenId)
  const parentTokenData = useMemo(() => {
    return rawParentTokenData
      ? (Array.isArray(rawParentTokenData)
          ? validateTokenDataTuple(rawParentTokenData) ?? undefined
          : undefined)
      : undefined
  }, [rawParentTokenData])
  
  // Filtrar transferencias por tokenId
  const tokenTransfers = useMemo(() => {
    if (!allTransfers || allTransfers.length === 0) return []
    return allTransfers.filter(t => t.tokenId === tokenId)
  }, [allTransfers, tokenId])
  
  // Estadísticas de transferencias
  const transferStats = useMemo(() => {
    const stats = {
      total: tokenTransfers.length,
      pending: 0,
      accepted: 0,
      rejected: 0,
      cancelled: 0,
      totalAmount: BigInt(0),
    }
    
    tokenTransfers.forEach(t => {
      if (t.status === TransferStatus.Pending) stats.pending++
      else if (t.status === TransferStatus.Accepted) {
        stats.accepted++
        stats.totalAmount += t.amount
      }
      else if (t.status === TransferStatus.Rejected) stats.rejected++
      else if (t.status === TransferStatus.Cancelled) stats.cancelled++
    })
    
    return stats
  }, [tokenTransfers])
  
  // Filtros
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'cancelled'>('all')
  
  const filteredTransfers = useMemo(() => {
    if (filterStatus === 'all') return tokenTransfers
    
    const statusMap = {
      pending: TransferStatus.Pending,
      accepted: TransferStatus.Accepted,
      rejected: TransferStatus.Rejected,
      cancelled: TransferStatus.Cancelled,
    }
    
    return tokenTransfers.filter(t => t.status === statusMap[filterStatus])
  }, [tokenTransfers, filterStatus])
  
  // Verificar si el usuario puede transferir
  const canTransfer = userInfo && (
    userInfo.role === BigInt(UserRole.Producer) ||
    userInfo.role === BigInt(UserRole.Factory) ||
    userInfo.role === BigInt(UserRole.Retailer)
  )
  
  const tokenType = tokenData ? Number(tokenData.tokenType) as TokenType : undefined
  const isRawMaterial = tokenType === TokenType.RowMaterial
  
  // Formatear fecha
  const dateCreated = tokenData?.createdAt
    ? new Date(Number(tokenData.createdAt) * 1000)
    : null
  const formattedDate = dateCreated
    ? dateCreated.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'N/A'
  
  // Parsear features JSON
  let featuresParsed: any = null
  try {
    if (tokenData?.features) {
      featuresParsed = JSON.parse(tokenData.features)
    }
  } catch (e) {
    // Si no es JSON válido, mostrar como texto
  }
  
  const isLoading = isLoadingToken || (isLoadingBalance && balance === undefined)
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Skeleton className="h-12 w-64 mb-6" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-96 w-full" />
            </div>
            <div>
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  if (!tokenData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <Button
            variant="ghost"
            onClick={() => router.push('/tokens')}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tokens
          </Button>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Token not found. It may have been deleted or the ID is invalid.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header con botón de regreso */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/tokens')}
            className="mb-0"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tokens
          </Button>
          {canTransfer && balance && balance > BigInt(0) && (
            <Link href={`/tokens/${id}/transfer`}>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white">
                <Send className="h-4 w-4 mr-2" />
                Transfer Tokens
              </Button>
            </Link>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal - Información del token */}
          <div className="lg:col-span-2 space-y-6">
            {/* Card principal del token */}
            <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-3xl overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${
                        isRawMaterial
                          ? 'from-blue-500/10 to-cyan-500/10 dark:from-blue-400/20 dark:to-cyan-400/20'
                          : 'from-purple-500/10 to-pink-500/10 dark:from-purple-400/20 dark:to-pink-400/20'
                      }`}>
                        <Package className={`h-6 w-6 ${
                          isRawMaterial
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-purple-600 dark:text-purple-400'
                        }`} />
                      </div>
                      <div>
                        <CardTitle className="text-3xl font-bold mb-1">
                          {tokenData.name || 'Unnamed Token'}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Hash className="h-4 w-4" />
                          <span className="font-mono">#{tokenId.toString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={`rounded-xl px-4 py-2 text-sm font-semibold border-0 ${
                      isRawMaterial
                        ? 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 text-blue-700 dark:text-blue-300'
                        : 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-700 dark:text-purple-300'
                    }`}
                  >
                    {isRawMaterial ? 'Raw Material' : 'Finished Product'}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* Información básica */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground">Total Supply</p>
                    <p className="text-2xl font-bold">{tokenData.totalSupply?.toString() || '0'}</p>
                  </div>
                  {balance !== undefined && balance !== null && (
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">My Balance</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {balance.toString()}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="border-t pt-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Creator</span>
                    </div>
                    <AddressDisplay address={tokenData.creator || 'N/A'} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-muted-foreground">Created</span>
                    </div>
                    <span className="text-sm">{formattedDate}</span>
                  </div>
                  
                  {/* Parent Token solo para Finished Product */}
                  {!isRawMaterial && parentTokenId && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-muted-foreground">Parent Token</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">#{parentTokenId.toString()}</Badge>
                        {isLoadingParentToken ? (
                          <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                        ) : parentTokenData?.name ? (
                          <span className="text-sm text-muted-foreground">({parentTokenData.name})</span>
                        ) : null}
                        {parentTokenId && (
                          <Link href={`/tokens/${parentTokenId.toString()}`}>
                            <Button variant="ghost" size="sm" className="h-6 px-2">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Features */}
                {featuresParsed && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-muted-foreground mb-2">Features</p>
                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4">
                      <pre className="text-xs overflow-x-auto">
                        {JSON.stringify(featuresParsed, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Historial de transferencias */}
            <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-3xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Transfer History</CardTitle>
                    <CardDescription>
                      All transfers related to this token
                    </CardDescription>
                  </div>
                  <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="accepted">Accepted</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              
              <CardContent>
                {isLoadingTransfers ? (
                  <div className="space-y-2">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : filteredTransfers.length === 0 ? (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No transfers found for this token.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>From</TableHead>
                          <TableHead>To</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTransfers.map((transfer) => {
                          const transferDate = new Date(Number(transfer.dateCreated) * 1000)
                          const statusLabels = ['Pending', 'Accepted', 'Rejected', 'Cancelled']
                          const statusColors = {
                            [TransferStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                            [TransferStatus.Accepted]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                            [TransferStatus.Rejected]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                            [TransferStatus.Cancelled]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                          }
                          
                          return (
                            <TableRow key={transfer.id.toString()}>
                              <TableCell className="font-mono text-xs">
                                #{transfer.id.toString()}
                              </TableCell>
                              <TableCell>
                                <AddressDisplay address={transfer.from} className="text-xs" />
                              </TableCell>
                              <TableCell>
                                <AddressDisplay address={transfer.to} className="text-xs" />
                              </TableCell>
                              <TableCell className="font-semibold">
                                {transfer.amount.toString()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={statusColors[transfer.status] || ''}
                                >
                                  {statusLabels[Number(transfer.status)] || 'Unknown'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground">
                                {transferDate.toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Columna lateral - Estadísticas */}
          <div className="space-y-6">
            {/* Estadísticas de transferencias */}
            <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Transfer Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Transfers</span>
                  <span className="font-bold text-lg">{transferStats.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Accepted</span>
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {transferStats.accepted}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                    {transferStats.pending}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rejected</span>
                  <span className="font-semibold text-red-600 dark:text-red-400">
                    {transferStats.rejected}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cancelled</span>
                  <span className="font-semibold text-gray-600 dark:text-gray-400">
                    {transferStats.cancelled}
                  </span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Total Transferred</span>
                    <span className="font-bold text-lg text-blue-600 dark:text-blue-400">
                      {transferStats.totalAmount.toString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Trazabilidad End-to-End - Sección completa al final */}
        <div className="mt-6">
          <TraceabilityTimeline 
            traceability={traceability || null}
            isLoading={isLoadingTraceability}
          />
        </div>
      </div>
    </div>
  )
}

// Necesario para usar useMemo y useState
import { useMemo, useState } from 'react'

