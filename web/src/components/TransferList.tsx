'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useGetUserTransfers, type TransferData } from '@/hooks/useGetUserTransfers'
import { useTransfer } from '@/hooks/useTransfer'
import { useIsPaused } from '@/hooks/usePause'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/contracts/config'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { TransferStatus } from '@/contracts/config'
import { ArrowRightLeft, CheckCircle2, XCircle, Ban, Clock, Pause, Loader2 } from 'lucide-react'

type FilterDirection = 'all' | 'sent' | 'received'
type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected' | 'cancelled'

interface TransferListProps {
  userAddress?: `0x${string}`
}

export function TransferList({ userAddress }: TransferListProps): React.ReactElement {
  const { address: connectedAddress } = useAccount()
  const addressToUse: `0x${string}` | undefined = userAddress || connectedAddress
  
  const { transfers, isLoading, error, totalTransfers } = useGetUserTransfers(addressToUse)
  const transferError: Error | null = error as Error | null
  const { acceptTransfer, rejectTransfer, cancelTransfer, isPending, isConfirming, isSuccess, error: actionError, hash } = useTransfer()
  const { data: isPaused } = useIsPaused()
  const { userInfo } = useAuth()
  
  const [filterDirection, setFilterDirection] = useState<FilterDirection>('all')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [lastSuccessHash, setLastSuccessHash] = useState<string | null>(null)
  
  // Activar diseño moderno si está habilitado
  const useModernDesign: boolean = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'
  
  // Detectar si el usuario es Consumer para simplificar la UI
  const isConsumer = userInfo && userInfo.role === BigInt(UserRole.Consumer)

  // Refetch cuando la transacción sea exitosa
  useEffect(() => {
    if (isSuccess && hash && hash !== lastSuccessHash) {
      const timer = setTimeout(() => {
        console.log('✅ Transacción exitosa, recargando transferencias...')
        setLastSuccessHash(hash)
        // El hook useGetUserTransfers ya tiene refetchInterval, se actualizará automáticamente
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, hash, lastSuccessHash])

  // Filtrar transferencias
  const filteredTransfers = useMemo<TransferData[]>(() => {
    if (!transfers || transfers.length === 0) return []

    if (!addressToUse) return []
    
    return transfers.filter((transfer: TransferData) => {
      // Filtro por dirección (enviadas/recibidas)
      if (filterDirection === 'sent' && transfer.from.toLowerCase() !== addressToUse.toLowerCase()) {
        return false
      }
      if (filterDirection === 'received' && transfer.to.toLowerCase() !== addressToUse.toLowerCase()) {
        return false
      }

      // Filtro por estado
      if (filterStatus === 'pending' && transfer.status !== TransferStatus.Pending) {
        return false
      }
      if (filterStatus === 'accepted' && transfer.status !== TransferStatus.Accepted) {
        return false
      }
      if (filterStatus === 'rejected' && transfer.status !== TransferStatus.Rejected) {
        return false
      }
      if (filterStatus === 'cancelled' && transfer.status !== TransferStatus.Cancelled) {
        return false
      }

      return true
    })
  }, [transfers, filterDirection, filterStatus, addressToUse])

  // Calcular estadísticas
  type StatsType = {
    total: number
    sent: number
    received: number
    pending: number
    accepted: number
    rejected: number
    cancelled: number
  }
  const stats: StatsType = useMemo<StatsType>(() => {
    if (!transfers || transfers.length === 0) {
      return {
        total: 0,
        sent: 0,
        received: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        cancelled: 0,
      }
    }

    if (!addressToUse) {
      return {
        total: 0,
        sent: 0,
        received: 0,
        pending: 0,
        accepted: 0,
        rejected: 0,
        cancelled: 0,
      }
    }
    
    return {
      total: transfers.length,
      sent: transfers.filter(t => t.from.toLowerCase() === addressToUse.toLowerCase()).length,
      received: transfers.filter(t => t.to.toLowerCase() === addressToUse.toLowerCase()).length,
      pending: transfers.filter(t => t.status === TransferStatus.Pending).length,
      accepted: transfers.filter(t => t.status === TransferStatus.Accepted).length,
      rejected: transfers.filter(t => t.status === TransferStatus.Rejected).length,
      cancelled: transfers.filter(t => t.status === TransferStatus.Cancelled).length,
    }
  }, [transfers, addressToUse])

  // Helpers para UI
  const getStatusBadge = (status: TransferStatus): React.ReactElement => {
    const statusConfig: Record<TransferStatus, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
      [TransferStatus.Pending]: { 
        label: 'Pending', 
        icon: Clock, 
        color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800' 
      },
      [TransferStatus.Accepted]: { 
        label: 'Accepted', 
        icon: CheckCircle2, 
        color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' 
      },
      [TransferStatus.Rejected]: { 
        label: 'Rejected', 
        icon: XCircle, 
        color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' 
      },
      [TransferStatus.Cancelled]: { 
        label: 'Cancelled', 
        icon: Ban, 
        color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700' 
      },
    }
    const config = statusConfig[status]
    const IconComponent: React.ComponentType<{ className?: string }> = config?.icon || Clock
    
    return config ? (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    ) : (
      <Badge variant="outline">Unknown</Badge>
    )
  }

  const formatAddress = (addr: `0x${string}` | string): string => {
    if (!addr) return 'N/A'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const formatDate = (timestamp: bigint) => {
    try {
      const date = new Date(Number(timestamp) * 1000)
      const now = new Date()
      const diffMs = now.getTime() - date.getTime()
      const diffSecs = Math.floor(diffMs / 1000)
      const diffMins = Math.floor(diffSecs / 60)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)
      
      if (diffSecs < 60) return `${diffSecs} second${diffSecs !== 1 ? 's' : ''} ago`
      if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`
      if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`
      if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`
      
      return date.toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  const handleAccept = (transferId: bigint) => {
    if (isPaused) return
    acceptTransfer(transferId)
  }

  const handleReject = (transferId: bigint) => {
    if (isPaused) return
    rejectTransfer(transferId)
  }

  const handleCancel = (transferId: bigint) => {
    if (isPaused) return
    cancelTransfer(transferId)
  }

  // ⚠️ VALIDACIÓN según permisos del contrato inteligente (SupplyChain.sol):
  // 
  // ACEPTAR/RECHAZAR (acceptTransfer/rejectTransfer):
  //   - Roles permitidos: Factory, Retailer, Consumer (modifier: onlyReceiverAllowed)
  //   - Condición: Solo transferencias RECIBIDAS (transfer.to === msg.sender)
  //   - Status: Solo PENDING
  // 
  // CANCELAR (cancelTransfer):
  //   - Roles permitidos: Producer, Factory, Retailer (modifier: onlyTransfersAllowed)
  //   - Condición: Solo transferencias ENVIADAS (transfer.from === msg.sender)
  //   - Status: Solo PENDING

  const canAccept = (transfer: TransferData): boolean => {
    if (!addressToUse) return false
    // Solo el DESTINATARIO puede aceptar transferencias RECIBIDAS en estado PENDING
    // Roles válidos: Factory, Retailer, Consumer
    return (
      transfer.status === TransferStatus.Pending &&
      transfer.to.toLowerCase() === addressToUse.toLowerCase() &&
      !isPaused
    )
  }

  const canReject = (transfer: TransferData): boolean => {
    if (!addressToUse) return false
    // Solo el DESTINATARIO puede rechazar transferencias RECIBIDAS en estado PENDING
    // Roles válidos: Factory, Retailer, Consumer
    return (
      transfer.status === TransferStatus.Pending &&
      transfer.to.toLowerCase() === addressToUse.toLowerCase() &&
      !isPaused
    )
  }

  const canCancel = (transfer: TransferData): boolean => {
    if (!addressToUse) return false
    // Solo el REMITENTE puede cancelar transferencias ENVIADAS en estado PENDING
    // Roles válidos: Producer, Factory, Retailer
    // Nota: Consumer nunca aparecerá aquí porque no puede crear transferencias
    return (
      transfer.status === TransferStatus.Pending &&
      transfer.from.toLowerCase() === addressToUse.toLowerCase() &&
      !isPaused
    )
  }

  // Calcular className para las cards
  const cardClass: string = useModernDesign 
    ? "border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-2xl" 
    : ""

  if (transferError) {
    const errorMessage = transferError instanceof Error ? transferError.message : String(transferError) || 'Unknown error occurred'
    return (
      <Card className="border-red-200 dark:border-red-800">
        <CardContent className="pt-6">
          <Alert variant="destructive">
            <AlertDescription>
              Error loading transfers: {errorMessage}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estadísticas - Simplificadas para Consumer */}
      <div className={`grid gap-4 ${isConsumer ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'}`}>
        <Card className={cardClass}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total Transfers</p>
          </CardContent>
        </Card>
        
        {/* Ocultar "Sent" para Consumer (siempre será 0) */}
        {!isConsumer && (
        <Card className={cardClass}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.sent}</div>
            <p className="text-xs text-muted-foreground">Sent</p>
          </CardContent>
        </Card>
        )}
        
        <Card className={cardClass}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.received}</div>
            <p className="text-xs text-muted-foreground">Received</p>
          </CardContent>
        </Card>
        <Card className={cardClass}>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
      </div>

      <Card className={cardClass}>
        <CardHeader>
          <CardTitle>
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Consumer solo necesita filtro de Status (todas sus transferencias son "received") */}
          <div className={`grid gap-4 ${isConsumer ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'}`}>
            {/* Ocultar filtro Direction para Consumer (todas son "received") */}
            {!isConsumer && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Direction</label>
              <Select value={filterDirection} onValueChange={(value) => setFilterDirection(value as FilterDirection)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                </SelectContent>
              </Select>
            </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={(value) => setFilterStatus(value as FilterStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  {/* Ocultar "Cancelled" para Consumer (nunca cancela porque no envía) */}
                  {!isConsumer && <SelectItem value="cancelled">Cancelled</SelectItem>}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerta de pausa */}
      {isPaused && (
        <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
          <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-700 dark:text-yellow-300">
            <strong>⚠️ Contract Paused:</strong> Transfer actions are disabled while the contract is paused.
          </AlertDescription>
        </Alert>
      )}

      {/* Error de acción */}
      {actionError && (
        <Alert variant="destructive">
          <AlertDescription>
            Error: {actionError.message || 'Unknown error occurred'}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabla de transferencias */}
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle>Transfers</CardTitle>
          <CardDescription>
            Showing {Number(filteredTransfers.length)} of {Number(totalTransfers)} transfer{Number(totalTransfers) !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTransfers.length === 0 ? (
            <div className="text-center py-12">
              <ArrowRightLeft className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No transfers found</p>
              {(filterDirection !== 'all' || filterStatus !== 'all') && (
                <p className="text-sm text-muted-foreground mt-2">
                  Try adjusting your filters
                </p>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Token ID</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransfers.map((transfer) => (
                    <TransferRow
                      key={transfer.id.toString()}
                      transfer={transfer}
                      addressToUse={addressToUse}
                      canAccept={canAccept(transfer)}
                      canReject={canReject(transfer)}
                      canCancel={canCancel(transfer)}
                      onAccept={handleAccept}
                      onReject={handleReject}
                      onCancel={handleCancel}
                      isPending={isPending}
                      isConfirming={isConfirming}
                      formatAddress={formatAddress}
                      formatDate={formatDate}
                      getStatusBadge={getStatusBadge}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Componente separado para cada fila (para mejor rendimiento)
interface TransferRowProps {
  transfer: TransferData
  addressToUse?: `0x${string}`
  canAccept: boolean
  canReject: boolean
  canCancel: boolean
  onAccept: (id: bigint) => void
  onReject: (id: bigint) => void
  onCancel: (id: bigint) => void
  isPending: boolean
  isConfirming: boolean
  formatAddress: (addr: string) => string
  formatDate: (timestamp: bigint) => string
  getStatusBadge: (status: TransferStatus) => React.ReactElement
}

function TransferRow({
  transfer,
  addressToUse,
  canAccept,
  canReject,
  canCancel,
  onAccept,
  onReject,
  onCancel,
  isPending,
  isConfirming,
  formatAddress,
  formatDate,
  getStatusBadge,
}: TransferRowProps): React.ReactElement {
  const isSent = transfer.from.toLowerCase() === addressToUse?.toLowerCase()
  
  return (
    <TableRow>
      <TableCell className="font-mono text-sm">#{transfer.id.toString()}</TableCell>
      <TableCell className="font-mono text-sm">{formatAddress(transfer.from)}</TableCell>
      <TableCell className="font-mono text-sm">{formatAddress(transfer.to)}</TableCell>
      <TableCell className="font-mono text-sm">#{transfer.tokenId.toString()}</TableCell>
      <TableCell className="font-semibold">{transfer.amount.toString()}</TableCell>
      <TableCell>{getStatusBadge(transfer.status)}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{formatDate(transfer.dateCreated)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {canAccept && (
            <Button
              size="sm"
              variant="default"
              onClick={() => onAccept(transfer.id)}
              disabled={isPending || isConfirming}
              className="bg-green-600 hover:bg-green-700"
            >
              {isPending || isConfirming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
            </Button>
          )}
          {canReject && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => onReject(transfer.id)}
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
            </Button>
          )}
          {canCancel && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onCancel(transfer.id)}
              disabled={isPending || isConfirming}
            >
              {isPending || isConfirming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Ban className="h-4 w-4" />
              )}
            </Button>
          )}
          {!canAccept && !canReject && !canCancel && (
            <span className="text-xs text-muted-foreground">-</span>
          )}
        </div>
      </TableCell>
    </TableRow>
  )
}

