'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useAccount, useReadContracts } from 'wagmi'
import { useGetUserTransfers, type TransferData } from '@/hooks/useGetUserTransfers'
import { useTransfer } from '@/hooks/useTransfer'
import { useIsPaused } from '@/hooks/usePause'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole, SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config'
import { validateTokenDataTuple } from '@/lib/validation'
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
import { AddressDisplay } from '@/components/AddressDisplay'

type FilterAddress = 'all' | string // string para direcciones específicas
type FilterStatus = 'all' | 'pending' | 'accepted' | 'rejected' | 'cancelled'

interface TransferListProps {
  userAddress?: `0x${string}`
}

export function TransferList({ userAddress }: TransferListProps): React.ReactElement {
  const { address: connectedAddress } = useAccount()
  const addressToUse: `0x${string}` | undefined = userAddress || connectedAddress
  
  const { transfers, isLoading, error, totalTransfers, refetch: refetchTransfers } = useGetUserTransfers(addressToUse)
  const transferError: Error | null = error as Error | null
  const { acceptTransfer, rejectTransfer, cancelTransfer, isPending, isConfirming, isSuccess, error: actionError, hash } = useTransfer()
  const { data: isPaused } = useIsPaused()
  const { userInfo } = useAuth()
  
  const [filterFrom, setFilterFrom] = useState<FilterAddress>('all')
  const [filterTo, setFilterTo] = useState<FilterAddress>('all')
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [lastSuccessHash, setLastSuccessHash] = useState<string | null>(null)
  
  // Activar diseño moderno si está habilitado
  const useModernDesign: boolean = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'

  // Detectar roles del usuario para simplificar la UI
  const isConsumer = userInfo && userInfo.role === BigInt(UserRole.Consumer)
  const isProducer = userInfo && userInfo.role === BigInt(UserRole.Producer)
  const isFactory = userInfo && userInfo.role === BigInt(UserRole.Factory)
  const isRetailer = userInfo && userInfo.role === BigInt(UserRole.Retailer)
  // Roles que pueden enviar transferencias (Producer, Factory, Retailer)
  const canSendTransfers = isProducer || isFactory || isRetailer
  // Roles que pueden recibir transferencias (Factory, Retailer, Consumer)
  const canReceiveTransfers = isFactory || isRetailer || isConsumer
  
  // Obtener tokenIds únicos de las transferencias
  const uniqueTokenIds = useMemo(() => {
    if (!transfers || transfers.length === 0) return []
    const ids = new Set<bigint>()
    transfers.forEach(t => ids.add(t.tokenId))
    return Array.from(ids)
  }, [transfers])
  
  // Crear contratos para batch read de tokens
  const tokenContracts = useMemo(() => {
    if (uniqueTokenIds.length === 0) return []
    return uniqueTokenIds.map(tokenId => ({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'getToken' as const,
      args: [tokenId],
    }))
  }, [uniqueTokenIds])
  
  // Batch read de tokens
  const { data: tokensData, isLoading: isLoadingTokens } = useReadContracts({
    contracts: tokenContracts as any,
    query: {
      enabled: tokenContracts.length > 0,
      refetchInterval: 5000,
    },
  })
  
  // Crear mapa tokenId -> nombre
  const tokenNamesMap = useMemo(() => {
    const map = new Map<bigint, string>()
    if (!tokensData || tokensData.length === 0) return map
    
    tokensData.forEach((result, index) => {
      if (result.error || !result.result) return
      
      const tokenData = validateTokenDataTuple(result.result as any)
      if (tokenData && uniqueTokenIds[index]) {
        map.set(uniqueTokenIds[index], tokenData.name)
      }
    })
    
    return map
  }, [tokensData, uniqueTokenIds])

  // Obtener direcciones únicas de "To" (destinatarios) - para Producer, Factory, Retailer
  const uniqueToAddresses = useMemo(() => {
    if (!transfers || transfers.length === 0 || !addressToUse) return []
    
    const recipients = new Map<string, string>() // Map<lowercase, original>
    transfers.forEach((transfer) => {
      // Solo incluir transferencias enviadas por el usuario actual
      if (transfer.from.toLowerCase() === addressToUse.toLowerCase()) {
        const lowerKey = transfer.to.toLowerCase()
        if (!recipients.has(lowerKey)) {
          recipients.set(lowerKey, transfer.to) // Guardar dirección original
        }
      }
    })
    
    return Array.from(recipients.values()).sort()
  }, [transfers, addressToUse])

  // Obtener direcciones únicas de "From" (remitentes) - para Factory, Retailer, Consumer
  const uniqueFromAddresses = useMemo(() => {
    if (!transfers || transfers.length === 0 || !addressToUse) return []
    
    const senders = new Map<string, string>() // Map<lowercase, original>
    transfers.forEach((transfer) => {
      // Solo incluir transferencias recibidas por el usuario actual
      if (transfer.to.toLowerCase() === addressToUse.toLowerCase()) {
        const lowerKey = transfer.from.toLowerCase()
        if (!senders.has(lowerKey)) {
          senders.set(lowerKey, transfer.from) // Guardar dirección original
        }
      }
    })
    
    return Array.from(senders.values()).sort()
  }, [transfers, addressToUse])

  // Refetch cuando la transacción sea exitosa (accept, reject, cancel)
  useEffect(() => {
    if (isSuccess && hash && hash !== lastSuccessHash) {
      const timer = setTimeout(() => {
        console.log('✅ Transacción exitosa (accept/reject/cancel), recargando transferencias...')
        setLastSuccessHash(hash)
        refetchTransfers()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, hash, lastSuccessHash, refetchTransfers])

  // Escuchar evento cuando se crea una nueva transferencia
  useEffect(() => {
    const handleTransferCreated = (event: Event) => {
      const customEvent = event as CustomEvent<{ hash: string }>
      console.log('✅ Nueva transferencia creada, recargando transferencias...', customEvent.detail)
      // Refetch inmediato después de crear transferencia
      setTimeout(() => {
        refetchTransfers()
      }, 2000) // Esperar 2 segundos para que la transacción se confirme en blockchain
    }
    
    window.addEventListener('transferCreated', handleTransferCreated)
    return () => {
      window.removeEventListener('transferCreated', handleTransferCreated)
    }
  }, [refetchTransfers])

  // Separar transferencias en enviadas y recibidas
  const sentTransfers = useMemo<TransferData[]>(() => {
    if (!transfers || transfers.length === 0 || !addressToUse) return []
    return transfers.filter(t => t.from.toLowerCase() === addressToUse.toLowerCase())
  }, [transfers, addressToUse])

  const receivedTransfers = useMemo<TransferData[]>(() => {
    if (!transfers || transfers.length === 0 || !addressToUse) return []
    return transfers.filter(t => t.to.toLowerCase() === addressToUse.toLowerCase())
  }, [transfers, addressToUse])

  // Filtrar transferencias según filtros aplicados
  const filterTransfers = (transferList: TransferData[]): TransferData[] => {
    if (!addressToUse) return []
    
    return transferList.filter((transfer: TransferData) => {
      // Filtro por dirección "From" (remitente)
      if (filterFrom !== 'all') {
        if (transfer.from.toLowerCase() !== filterFrom.toLowerCase()) {
        return false
        }
      }

      // Filtro por dirección "To" (destinatario)
      if (filterTo !== 'all') {
        if (transfer.to.toLowerCase() !== filterTo.toLowerCase()) {
        return false
        }
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
  }

  // Para Producer: solo mostrar enviadas
  // Para Consumer: solo mostrar recibidas
  // Para Factory y Retailer: mostrar ambas separadas
  const filteredSentTransfers = useMemo(() => {
    if (isProducer) return filterTransfers(sentTransfers)
    if (isFactory || isRetailer) return filterTransfers(sentTransfers)
    return []
  }, [sentTransfers, filterFrom, filterTo, filterStatus, addressToUse, isProducer, isFactory, isRetailer])

  const filteredReceivedTransfers = useMemo(() => {
    if (isConsumer) return filterTransfers(receivedTransfers)
    if (isFactory || isRetailer) return filterTransfers(receivedTransfers)
    return []
  }, [receivedTransfers, filterFrom, filterTo, filterStatus, addressToUse, isConsumer, isFactory, isRetailer])

  // Para Producer y Consumer: usar lista única
  const filteredTransfers = useMemo<TransferData[]>(() => {
    if (isProducer) return filteredSentTransfers
    if (isConsumer) return filteredReceivedTransfers
    // Para Factory y Retailer, se mostrarán separadas
    return []
  }, [filteredSentTransfers, filteredReceivedTransfers, isProducer, isConsumer])

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
      <Card className={cardClass}>
        <CardHeader>
          <CardTitle>
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-4 ${
            (isProducer && !isFactory && !isRetailer) || isConsumer 
              ? 'grid-cols-1 md:grid-cols-2' 
              : 'grid-cols-1 md:grid-cols-3'
          }`}>
            {/* Filtro "From" - Para Factory, Retailer y Consumer */}
            {(isFactory || isRetailer || isConsumer) && (
              <div className="space-y-2">
                <label className="text-sm font-medium">From</label>
                <Select value={filterFrom} onValueChange={(value) => setFilterFrom(value as FilterAddress)}>
                  <SelectTrigger>
                    <SelectValue>
                      {filterFrom === 'all' 
                        ? 'All' 
                        : formatAddress(filterFrom)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    {uniqueFromAddresses.length > 0 ? (
                      uniqueFromAddresses.map((fromAddr) => (
                        <SelectItem key={fromAddr} value={fromAddr}>
                          {formatAddress(fromAddr)}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="all" disabled>No senders yet</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Filtro "To" - Para Producer, Factory y Retailer */}
            {(isProducer || isFactory || isRetailer) && (
            <div className="space-y-2">
                <label className="text-sm font-medium">To</label>
                <Select value={filterTo} onValueChange={(value) => setFilterTo(value as FilterAddress)}>
                <SelectTrigger>
                    <SelectValue>
                      {filterTo === 'all' 
                        ? 'All' 
                        : formatAddress(filterTo)}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                    {uniqueToAddresses.length > 0 ? (
                      uniqueToAddresses.map((toAddr) => (
                        <SelectItem key={toAddr} value={toAddr}>
                          {formatAddress(toAddr)}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="all" disabled>No recipients yet</SelectItem>
                    )}
                </SelectContent>
              </Select>
            </div>
            )}
            
            {/* Filtro Status - Para todos */}
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
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            {(() => {
              const errorMessage = actionError.message || String(actionError) || 'Unknown error occurred'
              
              // Detectar si el usuario rechazó la transacción en MetaMask
              if (errorMessage.includes('User rejected') || 
                  errorMessage.includes('User denied') || 
                  errorMessage.includes('user rejected') ||
                  errorMessage.includes('denied transaction')) {
                return (
                  <div>
                    <strong>Transaction Cancelled</strong>
                    <p className="mt-1 text-sm">
                      You cancelled the transaction in MetaMask. No changes were made to the transfer.
                    </p>
                  </div>
                )
              }
              
              // Otros errores - mostrar mensaje más amigable
              if (errorMessage.includes('insufficient funds') || errorMessage.includes('insufficient balance')) {
                return (
                  <div>
                    <strong>Insufficient Balance</strong>
                    <p className="mt-1 text-sm">
                      You don't have enough tokens to complete this action.
                    </p>
                  </div>
                )
              }
              
              if (errorMessage.includes('paused') || errorMessage.includes('Paused')) {
                return (
                  <div>
                    <strong>Contract Paused</strong>
                    <p className="mt-1 text-sm">
                      The contract is currently paused. Please try again later.
                    </p>
                  </div>
                )
              }
              
              // Error genérico pero más amigable
              return (
                <div>
                  <strong>Transaction Failed</strong>
                  <p className="mt-1 text-sm">
                    The transaction could not be completed. Please check your connection and try again.
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <p className="mt-2 text-xs opacity-75 font-mono">
                      {errorMessage}
                    </p>
                  )}
                </div>
              )
            })()}
          </AlertDescription>
        </Alert>
      )}

      {/* Tabla de transferencias - Separada para Factory y Retailer */}
      {(isFactory || isRetailer) ? (
        <>
          {/* Transferencias Recibidas - PRIMERO */}
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle>Received Transfers</CardTitle>
              <CardDescription>
                Showing {Number(filteredReceivedTransfers.length)} of {Number(receivedTransfers.length)} received transfer{Number(receivedTransfers.length) !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredReceivedTransfers.length === 0 ? (
                <div className="text-center py-8">
                  <ArrowRightLeft className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No received transfers found</p>
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
                        <TableHead>Token Name</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredReceivedTransfers.map((transfer) => (
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
                          tokenName={tokenNamesMap.get(transfer.tokenId)}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transferencias Enviadas - SEGUNDO */}
          <Card className={cardClass}>
            <CardHeader>
              <CardTitle>Sent Transfers</CardTitle>
              <CardDescription>
                Showing {Number(filteredSentTransfers.length)} of {Number(sentTransfers.length)} sent transfer{Number(sentTransfers.length) !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : filteredSentTransfers.length === 0 ? (
                <div className="text-center py-8">
                  <ArrowRightLeft className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No sent transfers found</p>
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
                        <TableHead>Token Name</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-center">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSentTransfers.map((transfer) => (
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
                          tokenName={tokenNamesMap.get(transfer.tokenId)}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Para Producer y Consumer: una sola tabla */
      <Card className={cardClass}>
        <CardHeader>
            <CardTitle>
              {isProducer ? 'Sent Transfers' : isConsumer ? 'Received Transfers' : 'Transfers'}
            </CardTitle>
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
                {(filterFrom !== 'all' || filterTo !== 'all' || filterStatus !== 'all') && (
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
                      <TableHead>Token Name</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                      <TableHead className="text-center">Actions</TableHead>
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
                        tokenName={tokenNamesMap.get(transfer.tokenId)}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      )}
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
  tokenName?: string
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
  tokenName,
}: TransferRowProps): React.ReactElement {
  const isSent = transfer.from.toLowerCase() === addressToUse?.toLowerCase()
  
  return (
    <TableRow>
      <TableCell className="font-mono text-sm">#{transfer.id.toString()}</TableCell>
      <TableCell>
        <AddressDisplay address={transfer.from} />
      </TableCell>
      <TableCell>
        <AddressDisplay address={transfer.to} />
      </TableCell>
      <TableCell className="font-mono text-sm">#{transfer.tokenId.toString()}</TableCell>
      <TableCell className="text-sm">
        {tokenName || <span className="text-muted-foreground">Loading...</span>}
      </TableCell>
      <TableCell className="font-semibold">{transfer.amount.toString()}</TableCell>
      <TableCell>{getStatusBadge(transfer.status)}</TableCell>
      <TableCell className="text-sm text-muted-foreground">{formatDate(transfer.dateCreated)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          {canAccept && (
            <Button
              size="sm"
              onClick={() => onAccept(transfer.id)}
              disabled={isPending || isConfirming}
              className="bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white"
            >
              {isPending || isConfirming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                '✅ Aceptar'
              )}
            </Button>
          )}
          {canReject && (
            <Button
              size="sm"
              onClick={() => onReject(transfer.id)}
              disabled={isPending || isConfirming}
              className="bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white"
            >
              {isPending || isConfirming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                '❌ Rechazar'
              )}
            </Button>
          )}
          {canCancel && (
            <Button
              size="sm"
              onClick={() => onCancel(transfer.id)}
              disabled={isPending || isConfirming}
              className="bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  Cancelando...
                </>
              ) : (
                '🚫 Cancelar'
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

