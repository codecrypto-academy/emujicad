'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Package, Factory, ShoppingCart, User, ArrowRight, Calendar, Hash, TrendingUp, CheckCircle2 } from 'lucide-react'
import { AddressDisplay } from '@/components/AddressDisplay'
import { TokenType, UserRole } from '@/contracts/config'
import type { TraceabilityChain } from '@/hooks/useTokenTraceability'

interface TraceabilityTimelineProps {
  traceability: TraceabilityChain | null
  isLoading: boolean
}

export function TraceabilityTimeline({ traceability, isLoading }: TraceabilityTimelineProps) {
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
      </CardHeader>
      
      <CardContent className="p-6">
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
                              <Badge variant="outline" className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800">
                                <ArrowRight className="h-3 w-3 mr-1" />
                                Transfer
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
                        {/* Address */}
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                            {step.stage === 'creation' ? 'Creator' : step.role === 'Factory' ? 'To Factory' : step.role === 'Retailer' ? 'To Retailer' : 'To Consumer'}
                          </p>
                          <AddressDisplay address={step.address} className="text-sm font-medium" />
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
                        
                        {/* Amount (if transfer) */}
                        {step.amount && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wide">
                              Amount Transferred
                            </p>
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                              {step.amount.toString()} units
                            </p>
                          </div>
                        )}
                        
                        {/* Transfer ID (if transfer) */}
                        {step.transferId && (
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
        
      </CardContent>
    </Card>
  )
}

