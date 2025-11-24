'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Package, Factory, ShoppingCart, User, ArrowRight, Calendar, Hash, TrendingUp, CheckCircle2, XCircle, Clock, Ban, ChevronDown, ChevronRight, Filter, X } from 'lucide-react'
import { AddressDisplay } from '@/components/AddressDisplay'
import { TokenType, UserRole, TransferStatus } from '@/contracts/config'

// Función helper para convertir string de rol a UserRole enum
const getRoleEnum = (role: string): bigint => {
  switch (role) {
    case 'Producer':
      return BigInt(UserRole.Producer)
    case 'Factory':
      return BigInt(UserRole.Factory)
    case 'Retailer':
      return BigInt(UserRole.Retailer)
    case 'Consumer':
      return BigInt(UserRole.Consumer)
    default:
      return BigInt(0)
  }
}
import type { TraceabilityChain, TransferTreeNode } from '@/hooks/useTokenTraceability'

interface TraceabilityTimelineProps {
  traceability: TraceabilityChain | null
  isLoading: boolean
  currentUserRole?: bigint | null // Rol del usuario actual
}

export function TraceabilityTimeline({ traceability, isLoading, currentUserRole }: TraceabilityTimelineProps) {
  // Estado para controlar qué nodos están expandidos
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [filterAddress, setFilterAddress] = useState<string>('')
  
  // Función para toggle de expansión de nodo
  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId)
    } else {
      newExpanded.add(nodeId)
    }
    setExpandedNodes(newExpanded)
  }
  
  // Obtener todas las direcciones únicas para el filtro
  const allAddresses = useMemo(() => {
    if (!traceability?.tree) return []
    const addresses = new Set<string>()
    const collectAddresses = (node: TransferTreeNode) => {
      addresses.add(node.address.toLowerCase())
      node.children.forEach(collectAddresses)
    }
    collectAddresses(traceability.tree.root)
    return Array.from(addresses).sort()
  }, [traceability?.tree])
  
  // Función para verificar si un nodo debe mostrarse (filtrado)
  const shouldShowNode = (node: TransferTreeNode): boolean => {
    if (!filterAddress) return true
    const nodeAddress = node.address.toLowerCase()
    const filterLower = filterAddress.toLowerCase()
    
    // Mostrar si el nodo coincide con el filtro o tiene hijos que coinciden
    if (nodeAddress.includes(filterLower)) return true
    
    // Verificar recursivamente en los hijos
    return node.children.some(child => shouldShowNode(child))
  }
  
  // Expandir automáticamente el nodo raíz
  React.useEffect(() => {
    if (traceability?.tree) {
      const rootId = `${traceability.tree.root.address}-${traceability.tree.root.tokenId}`
      setExpandedNodes(new Set([rootId]))
    }
  }, [traceability?.tree])
  
  if (isLoading) {
    return (
      <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-3xl">
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!traceability || traceability.steps.length === 0) {
    return (
      <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-3xl">
        <CardHeader>
          <CardTitle>End-to-End Traceability</CardTitle>
          <CardDescription>Complete supply chain journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No traceability data available for this token.</p>
            <p className="text-sm mt-2">Transfer history will appear here once transfers are made.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Producer':
        return <Package className="h-5 w-5" />
      case 'Factory':
        return <Factory className="h-5 w-5" />
      case 'Retailer':
        return <ShoppingCart className="h-5 w-5" />
      case 'Consumer':
        return <User className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Producer':
        return 'from-blue-500 to-cyan-500'
      case 'Factory':
        return 'from-purple-500 to-pink-500'
      case 'Retailer':
        return 'from-orange-500 to-red-500'
      case 'Consumer':
        return 'from-green-500 to-emerald-500'
      default:
        return 'from-gray-500 to-slate-500'
    }
  }

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000)
    return {
      date: date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        second: '2-digit'
      }),
      full: date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  }

  const startDate = traceability.startDate ? formatTimestamp(traceability.startDate) : null
  const endDate = traceability.endDate ? formatTimestamp(traceability.endDate) : null

  return (
    <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 dark:from-blue-500/20 dark:via-purple-500/20 dark:to-pink-500/20 border-b border-slate-200/50 dark:border-slate-700/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              End-to-End Traceability
            </CardTitle>
            <CardDescription className="mt-2 text-base">
              Complete supply chain journey from raw material to consumer
            </CardDescription>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-white/50 dark:bg-slate-800/50 rounded-xl backdrop-blur-sm">
            <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="font-semibold text-sm">{traceability.totalSteps} Steps</span>
          </div>
        </div>
        
        {/* Timeline Summary */}
        {(startDate || endDate) && (
          <div className="mt-4 flex items-center gap-4 text-sm">
            {startDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  Started: <span className="font-semibold text-slate-900 dark:text-slate-100">{startDate.date}</span>
                </span>
              </div>
            )}
            {endDate && (
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-muted-foreground">
                  Completed: <span className="font-semibold text-slate-900 dark:text-slate-100">{endDate.date}</span>
                </span>
              </div>
            )}
          </div>
        )}
        
        {/* Filtro por dirección */}
        {traceability.tree && allAddresses.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterAddress || 'all'} onValueChange={(v) => setFilterAddress(v === 'all' ? '' : v)}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Filter by address..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Addresses</SelectItem>
                {allAddresses.map(addr => (
                  <SelectItem key={addr} value={addr}>
                    {addr.slice(0, 6)}...{addr.slice(-4)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {filterAddress && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilterAddress('')}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="p-6">
        {traceability.tree ? (
          <TreeNodeComponent
            node={traceability.tree.root}
            level={0}
            expandedNodes={expandedNodes}
            onToggle={toggleNode}
            shouldShow={shouldShowNode}
            getRoleIcon={getRoleIcon}
            getRoleColor={getRoleColor}
            formatTimestamp={formatTimestamp}
            currentUserRole={currentUserRole}
          />
        ) : (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-green-500 opacity-30 dark:opacity-50" />
            
            {/* Steps */}
            <div className="space-y-8">
              {traceability.steps.map((step, index) => {
              const isLast = index === traceability.steps.length - 1
              const timestamp = formatTimestamp(step.timestamp)
              const roleColor = getRoleColor(step.role)
              
              return (
                <div key={index} className="relative flex items-start gap-6 group">
                  {/* Step Number Circle */}
                  <div className={`
                    relative z-10 flex items-center justify-center w-16 h-16 rounded-full
                    bg-gradient-to-br ${roleColor}
                    shadow-lg shadow-blue-500/25 dark:shadow-blue-500/50
                    border-4 border-white dark:border-slate-800
                    group-hover:scale-110 transition-transform duration-300
                  `}>
                    <div className="text-white">
                      {getRoleIcon(step.role)}
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center border-2 border-blue-500">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                        {step.step}
                      </span>
                    </div>
                  </div>
                  
                  {/* Step Content */}
                  <div className="flex-1 pt-2">
                    <div className={`
                      p-6 rounded-2xl border-2 transition-all duration-300
                      bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm
                      border-slate-200/50 dark:border-slate-700/50
                      group-hover:border-blue-300 dark:group-hover:border-blue-600
                      group-hover:shadow-xl group-hover:shadow-blue-500/10
                    `}>
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge 
                              className={`
                                bg-gradient-to-r ${roleColor} text-white border-0
                                px-3 py-1 text-sm font-semibold
                              `}
                            >
                              {step.role}
                            </Badge>
                            {step.stage === 'creation' && (
                              <Badge variant="outline" className="bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                                <Package className="h-3 w-3 mr-1" />
                                Creation
                              </Badge>
                            )}
                            {step.stage === 'transfer' && (
                              <Badge 
                                variant="outline" 
                                className={
                                  step.isSender === true
                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                                    : step.transferStatus === TransferStatus.Accepted
                                    ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                                    : step.transferStatus === TransferStatus.Rejected
                                    ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800"
                                    : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                                }
                              >
                                {step.isSender === true ? (
                                  <>
                                    <ArrowRight className="h-3 w-3 mr-1" />
                                    Sent
                                  </>
                                ) : (
                                  <>
                                    <ArrowRight className="h-3 w-3 mr-1 rotate-180" />
                                    Received
                                  </>
                                )}
                              </Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                            {step.tokenName}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Hash className="h-3 w-3" />
                            <span className="font-mono">#{step.tokenId.toString()}</span>
                            <span className="mx-2">•</span>
                            <span>
                              {step.tokenType === TokenType.RowMaterial ? 'Raw Material' : 'Finished Product'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Description */}
                      <p className="text-slate-700 dark:text-slate-300 mb-4">
                        {step.description}
                      </p>
                      
                      {/* Details Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                        {/* Address - Mostrar claramente si es quien transfiere o quien recibe */}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                            {step.stage === 'creation' 
                              ? 'Creator' 
                              : step.isSender === true
                              ? `${step.role} (Sender)`
                              : step.isSender === false
                              ? `${step.role} (Receiver)`
                              : step.role}
                          </p>
                          <AddressDisplay address={step.address} className="text-sm font-medium" />
                          {step.stage === 'transfer' && step.isSender === false && step.transferStatus === TransferStatus.Accepted && (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-medium">
                              ✓ Received
                            </p>
                          )}
                          {step.stage === 'transfer' && step.isSender === false && step.transferStatus === TransferStatus.Rejected && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-1 font-medium">
                              ✗ Rejected
                            </p>
                          )}
                        </div>
                        
                        {/* Timestamp */}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                            Timestamp
                          </p>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{timestamp.date}</p>
                              <p className="text-xs text-muted-foreground">{timestamp.time}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Total Supply (if creation) */}
                        {step.stage === 'creation' && step.totalSupply !== undefined && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                              Total Supply Created
                            </p>
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                              {step.totalSupply.toString()} units
                            </p>
                          </div>
                        )}
                        
                        {/* Amount (if transfer) */}
                        {step.stage === 'transfer' && step.amount && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                              Amount Transferred
                            </p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {step.amount.toString()} units
                            </p>
                          </div>
                        )}
                        
                        {/* Transfer Status (if transfer) */}
                        {step.stage === 'transfer' && step.transferStatus !== undefined && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                              Transfer Status
                            </p>
                            {(() => {
                              const statusLabels = ['Pending', 'Accepted', 'Rejected', 'Cancelled']
                              const statusIcons = {
                                [TransferStatus.Pending]: Clock,
                                [TransferStatus.Accepted]: CheckCircle2,
                                [TransferStatus.Rejected]: XCircle,
                                [TransferStatus.Cancelled]: Ban,
                              }
                              const statusColors = {
                                [TransferStatus.Pending]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
                                [TransferStatus.Accepted]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
                                [TransferStatus.Rejected]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
                                [TransferStatus.Cancelled]: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
                              }
                              const StatusIcon = statusIcons[step.transferStatus] || Clock
                              const statusLabel = statusLabels[Number(step.transferStatus)] || 'Unknown'
                              
                              return (
                                <Badge
                                  variant="outline"
                                  className={`${statusColors[step.transferStatus] || ''} flex items-center gap-1 w-fit`}
                                >
                                  <StatusIcon className="h-3 w-3" />
                                  {statusLabel}
                                </Badge>
                              )
                            })()}
                          </div>
                        )}
                        
                        {/* Transfer ID (if transfer) */}
                        {step.stage === 'transfer' && step.transferId && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                              Transfer ID
                            </p>
                            <p className="text-sm font-mono text-muted-foreground">
                              #{step.transferId.toString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Arrow to next step */}
                    {!isLast && (
                      <div className="flex justify-center my-2">
                        <div className={`
                          w-0.5 h-8 bg-gradient-to-b ${roleColor} opacity-50
                        `} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        )}
      </CardContent>
    </Card>
  )
}

// Componente recursivo para renderizar nodos del árbol
interface TreeNodeComponentProps {
  node: TransferTreeNode
  level: number
  expandedNodes: Set<string>
  onToggle: (nodeId: string) => void
  shouldShow: (node: TransferTreeNode) => boolean
  getRoleIcon: (role: string) => React.ReactNode
  getRoleColor: (role: string) => string
  formatTimestamp: (timestamp: bigint) => { date: string; time: string; full: string }
  currentUserRole?: bigint | null
}

function TreeNodeComponent({
  node,
  level,
  expandedNodes,
  onToggle,
  shouldShow,
  getRoleIcon,
  getRoleColor,
  formatTimestamp,
  currentUserRole,
}: TreeNodeComponentProps) {
  const nodeId = `${node.address}-${node.tokenId}-${node.transferId || 'root'}`
  const isExpanded = expandedNodes.has(nodeId)
  const hasChildren = node.children.length > 0
  const visibleChildren = node.children.filter(shouldShow)
  const shouldRender = shouldShow(node)
  
  if (!shouldRender && visibleChildren.length === 0) {
    return null
  }
  
  const timestamp = formatTimestamp(node.timestamp)
  const roleColor = getRoleColor(node.role)
  
  // Verificar si este nodo corresponde al rol del usuario actual
  const nodeRoleEnum = getRoleEnum(node.role)
  // Comparar bigints correctamente
  const isCurrentUserRole = currentUserRole !== null && 
                            currentUserRole !== undefined && 
                            BigInt(nodeRoleEnum) === BigInt(currentUserRole)
  
  return (
    <div className="relative">
      {/* Línea vertical para conectar con hijos */}
      {hasChildren && isExpanded && visibleChildren.length > 0 && (
        <div 
          className="absolute left-8 top-16 bottom-0 w-0.5 bg-gradient-to-b opacity-30 dark:opacity-50"
          style={{ 
            background: `linear-gradient(to bottom, ${roleColor.includes('blue') ? '#3b82f6' : roleColor.includes('purple') ? '#a855f7' : roleColor.includes('orange') ? '#f97316' : '#10b981'}, transparent)`,
            marginLeft: `${level * 24}px`
          }}
        />
      )}
      
      {/* Nodo */}
      {shouldRender && (
        <div className="relative flex items-start gap-4 mb-4" style={{ marginLeft: `${level * 24}px` }}>
          {/* Botón de expandir/colapsar */}
          {hasChildren && (
            <button
              onClick={() => onToggle(nodeId)}
              className="mt-2 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}
          
          {/* Contenido del nodo */}
          <div className="flex-1">
            <div className={`
              p-4 rounded-xl border-2 transition-all duration-300
              backdrop-blur-sm
              ${isCurrentUserRole
                ? node.role === 'Producer' 
                  ? 'bg-gradient-to-br from-green-50 via-white to-green-50/30 border-green-400 dark:border-green-500 shadow-lg shadow-green-200/60 dark:shadow-green-900/40 dark:from-green-900/30 dark:via-slate-800 dark:to-green-900/20' 
                  : node.role === 'Factory'
                  ? 'bg-gradient-to-br from-orange-50 via-white to-orange-50/30 border-orange-400 dark:border-orange-500 shadow-lg shadow-orange-200/60 dark:shadow-orange-900/40 dark:from-orange-900/30 dark:via-slate-800 dark:to-orange-900/20'
                  : node.role === 'Retailer'
                  ? 'bg-gradient-to-br from-red-50 via-white to-red-50/30 border-red-400 dark:border-red-500 shadow-lg shadow-red-200/60 dark:shadow-red-900/40 dark:from-red-900/30 dark:via-slate-800 dark:to-red-900/20'
                  : 'bg-gradient-to-br from-blue-50 via-white to-blue-50/30 border-blue-400 dark:border-blue-500 shadow-lg shadow-blue-200/60 dark:shadow-blue-900/40 dark:from-blue-900/30 dark:via-slate-800 dark:to-blue-900/20'
                : 'bg-gradient-to-br from-white via-white to-slate-50/50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900/50 border-slate-200/50 dark:border-slate-700/50 shadow-sm'
              }
              hover:shadow-xl hover:scale-[1.02]
            `}>
              <div className="flex items-start gap-3 mb-3">
                <div className={`
                  flex items-center justify-center w-12 h-12 rounded-full
                  bg-gradient-to-br ${roleColor}
                  shadow-md
                  border-2 border-white dark:border-slate-800
                `}>
                  <div className="text-white">
                    {getRoleIcon(node.role)}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={`bg-gradient-to-r ${roleColor} text-white border-0 px-2 py-0.5 text-xs`}>
                      {node.role}
                    </Badge>
                    {node.isCreation ? (
                      <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                        <Package className="h-3 w-3 mr-1" />
                        Creation
                      </Badge>
                    ) : node.children.length > 0 && node.children[0].transferId === node.transferId ? (
                      // Nodo de ENVÍO (tiene hijos que son recepciones de la misma transferencia)
                      <>
                        <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                          <ArrowRight className="h-3 w-3 mr-1" />
                          Transfers to {node.children[0]?.role || 'Receiver'}
                        </Badge>
                        {node.children[0]?.transferStatus !== undefined && (
                          <Badge
                            variant="outline"
                            className={
                              node.children[0].transferStatus === TransferStatus.Accepted
                                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-xs"
                                : node.children[0].transferStatus === TransferStatus.Rejected
                                ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-xs"
                                : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 text-xs"
                            }
                          >
                            {node.children[0].transferStatus === TransferStatus.Accepted ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Transfer Accepted
                              </>
                            ) : node.children[0].transferStatus === TransferStatus.Rejected ? (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Transfer Rejected
                              </>
                            ) : node.children[0].transferStatus === TransferStatus.Pending ? (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Transfer Pending
                              </>
                            ) : (
                              <>
                                <Ban className="h-3 w-3 mr-1" />
                                Transfer Cancelled
                              </>
                            )}
                          </Badge>
                        )}
                      </>
                    ) : node.parent && node.parent.transferId === node.transferId ? (
                      // Nodo de RECEPCIÓN (tiene el mismo transferId que el padre)
                      <>
                        <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800">
                          <ArrowRight className="h-3 w-3 mr-1 rotate-180" />
                          Receives from {node.parent.role}
                        </Badge>
                        {node.transferStatus !== undefined && (
                          <Badge
                            variant="outline"
                            className={
                              node.transferStatus === TransferStatus.Accepted
                                ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800 text-xs"
                                : node.transferStatus === TransferStatus.Rejected
                                ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800 text-xs"
                                : "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800 text-xs"
                            }
                          >
                            {node.transferStatus === TransferStatus.Accepted ? (
                              <>
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Transfer Accepted
                              </>
                            ) : node.transferStatus === TransferStatus.Rejected ? (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Transfer Rejected
                              </>
                            ) : node.transferStatus === TransferStatus.Pending ? (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Transfer Pending
                              </>
                            ) : (
                              <>
                                <Ban className="h-3 w-3 mr-1" />
                                Transfer Cancelled
                              </>
                            )}
                          </Badge>
                        )}
                      </>
                    ) : null}
                  </div>
                  
                  {node.isCreation ? (
                    <div className="mb-2 p-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Token #{node.tokenId.toString()}: <span className="font-normal">{node.tokenName}</span> <span className="text-sm text-muted-foreground font-normal">({node.tokenType === TokenType.RowMaterial ? 'Raw Material' : 'Finished Product'})</span>
                        </p>
                        <span>•</span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Creator:
                        </p>
                        <AddressDisplay address={node.address} className="text-sm font-medium" />
                      </div>
                    </div>
                  ) : node.children.length > 0 && node.children[0].transferId === node.transferId ? (
                    // Nodo de ENVÍO
                    <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Token #{node.tokenId.toString()}: <span className="font-normal">{node.tokenName}</span> <span className="text-sm text-muted-foreground font-normal">({node.tokenType === TokenType.RowMaterial ? 'Raw Material' : 'Finished Product'})</span>
                        </p>
                        <span>•</span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Sender:
                        </p>
                        <AddressDisplay address={node.address} className="text-sm font-medium" />
                        <span>•</span>
                        <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                          Transferring to:
                        </p>
                        {node.children.map((child, idx) => (
                          <React.Fragment key={idx}>
                            <AddressDisplay address={child.address} className="text-sm font-mono" />
                            {idx < node.children.length - 1 && <span>•</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ) : node.parent && node.parent.transferId === node.transferId ? (
                    // Nodo de RECEPCIÓN
                    <div className="mb-2 p-2 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Token #{node.tokenId.toString()}: <span className="font-normal">{node.tokenName}</span> <span className="text-sm text-muted-foreground font-normal">({node.tokenType === TokenType.RowMaterial ? 'Raw Material' : 'Finished Product'})</span>
                        </p>
                        <span>•</span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Transferred by:
                        </p>
                        <AddressDisplay address={node.parent.address} className="text-sm font-medium" />
                        <span>•</span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Receiver:
                        </p>
                        <AddressDisplay address={node.address} className="text-sm font-medium" />
                      </div>
                    </div>
                  ) : (
                    <div className="mb-2 p-2 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          Token #{node.tokenId.toString()}: <span className="font-normal">{node.tokenName}</span> <span className="text-sm text-muted-foreground font-normal">({node.tokenType === TokenType.RowMaterial ? 'Raw Material' : 'Finished Product'})</span>
                        </p>
                        <span>•</span>
                        <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {node.role}:
                        </p>
                        <AddressDisplay address={node.address} className="text-sm font-medium" />
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 text-sm flex-wrap">
                      {node.totalSupply !== undefined && (
                        <>
                          <span className="font-semibold text-purple-600 dark:text-purple-400">
                            Total Supply Created: {node.totalSupply.toString()} units
                          </span>
                          <span>•</span>
                        </>
                      )}
                      
                      {node.amount !== undefined && (
                        <>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">
                            {node.children.length > 0 && node.children[0].transferId === node.transferId
                              ? 'Amount Transferred:'
                              : 'Amount Received:'} {node.amount.toString()} units
                          </span>
                          <span>•</span>
                        </>
                      )}
                      
                      {node.transferId && (
                        <>
                          <span className="font-mono text-muted-foreground">
                            Transfer ID: #{node.transferId.toString()}
                          </span>
                          <span>•</span>
                        </>
                      )}
                      
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{timestamp.date} {timestamp.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Renderizar hijos si está expandido */}
      {isExpanded && visibleChildren.length > 0 && (
        <div className="ml-8">
          {visibleChildren.map((child, index) => (
            <TreeNodeComponent
              key={`${child.address}-${child.tokenId}-${child.transferId || index}`}
              node={child}
              level={level + 1}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              shouldShow={shouldShow}
              getRoleIcon={getRoleIcon}
              getRoleColor={getRoleColor}
              formatTimestamp={formatTimestamp}
              currentUserRole={currentUserRole}
            />
          ))}
        </div>
      )}
    </div>
  )
}

