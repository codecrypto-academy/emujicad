'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/Header'
import { useGetToken, useGetTokenBalance } from '@/hooks/useGetUserTokens'
import { useTransfer } from '@/hooks/useTransfer'
import { useIsPaused } from '@/hooks/usePause'
import { useAuth } from '@/contexts/AuthContext'
import { useUsersByRole } from '@/hooks/useUsersByRole'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Send, Loader2, CheckCircle, XCircle, Pause, AlertCircle, Package, Hash } from 'lucide-react'
import { isAddress } from 'viem'
import { validateTokenDataTuple } from '@/lib/validation'
import type { TokenData } from '@/types'
import { AddressDisplay } from '@/components/AddressDisplay'
import { UserRole, TokenType } from '@/contracts/config'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function TokenTransferPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { address } = useAccount()
  const { userInfo, isAdmin } = useAuth()
  
  const tokenId = BigInt(id)
  
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)
  
  const { transfer, isPending, isConfirming, isSuccess, error: transferError, hash } = useTransfer()
  const { data: isPaused } = useIsPaused()
  
  // Obtener datos del token
  const { data: rawTokenData, isLoading: isLoadingToken } = useGetToken(tokenId)
  const { data: balance, isLoading: isLoadingBalance } = useGetTokenBalance(tokenId, address)
  
  // Validar y procesar datos del token
  const tokenData = useMemo(() => {
    return rawTokenData
      ? (Array.isArray(rawTokenData)
          ? validateTokenDataTuple(rawTokenData) ?? undefined
          : undefined)
      : undefined
  }, [rawTokenData])
  
  // Obtener usuarios disponibles según rol
  const { users: availableUsers, isLoading: isLoadingUsers, error: usersError, targetRole } = useUsersByRole(userInfo?.role)
  
  // Obtener el nombre del rol objetivo
  const targetRoleName = useMemo(() => {
    if (!userInfo) return ''
    const roleNum = Number(userInfo.role)
    if (roleNum === UserRole.Producer) return 'Factory'
    if (roleNum === UserRole.Factory) return 'Retailer'
    if (roleNum === UserRole.Retailer) return 'Consumer'
    return ''
  }, [userInfo])
  
  // Validar amount en tiempo real
  useEffect(() => {
    if (!amount || !balance) {
      setAmountError(null)
      return
    }
    
    const amountNum = Number(amount)
    const maxBalance = balance ? Number(balance) : 0
    
    if (isNaN(amountNum)) {
      setAmountError('Amount must be a valid number')
      return
    }
    
    if (amountNum <= 0) {
      setAmountError('Amount must be greater than 0')
      return
    }
    
    if (maxBalance > 0 && amountNum > maxBalance) {
      setAmountError(`Amount cannot exceed available balance (${maxBalance})`)
      return
    }
    
    setAmountError(null)
  }, [amount, balance])
  
  // Verificar si el usuario puede transferir
  const canTransfer = userInfo && (
    userInfo.role === BigInt(UserRole.Producer) ||
    userInfo.role === BigInt(UserRole.Factory) ||
    userInfo.role === BigInt(UserRole.Retailer)
  )
  
  // Reset form on success
  useEffect(() => {
    if (isSuccess && hash) {
      // Disparar evento personalizado para notificar que se creó una transferencia
      const event = new CustomEvent('transferCreated', { detail: { hash } })
      window.dispatchEvent(event)
      
      // Redirigir a la página de detalles después de un breve delay
      setTimeout(() => {
        router.push(`/tokens/${id}`)
      }, 2000)
    }
  }, [isSuccess, hash, router, id])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    
    if (isPaused) {
      setFormError('Cannot create transfers while the contract is paused.')
      return
    }
    
    // Basic validation
    if (!to || !amount) {
      setFormError('All fields are required.')
      return
    }
    if (!isAddress(to)) {
      setFormError('Invalid recipient address.')
      return
    }
    
    const amountNum = Number(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Amount must be a positive number.')
      return
    }
    
    // Validar que el amount no exceda el balance disponible
    if (balance && amountNum > Number(balance)) {
      setFormError(`Insufficient balance. Available: ${balance.toString()}`)
      return
    }
    
    transfer(to as `0x${string}`, tokenId, BigInt(amount))
  }
  
  const tokenType = tokenData ? Number(tokenData.tokenType) as TokenType : undefined
  const isRawMaterial = tokenType === TokenType.RowMaterial
  
  // Calcular balance después de la transferencia
  const balanceAfter = useMemo(() => {
    if (!balance || !amount) return null
    const amountNum = Number(amount)
    if (isNaN(amountNum) || amountNum <= 0) return null
    return balance - BigInt(amountNum)
  }, [balance, amount])
  
  const isLoading = isLoadingToken || (isLoadingBalance && balance === undefined)
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-12 w-64 mb-6" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    )
  }
  
  if (!tokenData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => router.push(`/tokens/${id}`)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Token Details
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
  
  // Si el usuario es Consumer, mostrar mensaje informativo
  if (userInfo && userInfo.role === BigInt(UserRole.Consumer)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => router.push(`/tokens/${id}`)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Token Details
          </Button>
          <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-3xl">
            <CardHeader>
              <CardTitle>Transfer Tokens</CardTitle>
              <CardDescription>Initiate a token transfer</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  <strong>Consumer Role:</strong> As a Consumer, you can only receive transfers. 
                  You cannot initiate transfers to other users. This is by design in the supply chain workflow.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  // Si no puede transferir por otras razones
  if (!canTransfer && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => router.push(`/tokens/${id}`)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Token Details
          </Button>
          <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-3xl">
            <CardHeader>
              <CardTitle>Transfer Tokens</CardTitle>
              <CardDescription>Initiate a token transfer</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your role does not allow creating transfers. Only Producer, Factory, and Retailer roles can send transfers.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  // Si no tiene balance
  if (!balance || balance === BigInt(0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => router.push(`/tokens/${id}`)}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Token Details
          </Button>
          <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-3xl">
            <CardHeader>
              <CardTitle>Transfer Tokens</CardTitle>
              <CardDescription>Initiate a token transfer</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  You don't have any balance of this token to transfer.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header con botón de regreso */}
        <Button
          variant="ghost"
          onClick={() => router.push(`/tokens/${id}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Token Details
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal - Formulario */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle>Transfer Tokens</CardTitle>
                <CardDescription>
                  Transfer tokens from your balance to another user
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Información del token (solo lectura) */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${
                        isRawMaterial
                          ? 'from-blue-500/10 to-cyan-500/10'
                          : 'from-purple-500/10 to-pink-500/10'
                      }`}>
                        <Package className={`h-5 w-5 ${
                          isRawMaterial
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-purple-600 dark:text-purple-400'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{tokenData.name}</span>
                          <Badge variant="outline" className="text-xs">
                            <Hash className="h-3 w-3 mr-1" />
                            #{tokenId.toString()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {isRawMaterial ? 'Raw Material' : 'Finished Product'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Available Balance</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {balance.toString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Total Supply</p>
                        <p className="text-lg font-semibold">
                          {tokenData.totalSupply?.toString() || '0'}
                        </p>
                      </div>
                    </div>
                    <Link href={`/tokens/${id}`} className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
                      View full token details →
                    </Link>
                  </div>
                  
                  {/* Campo de cantidad */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Amount
                      <span className="text-xs text-muted-foreground ml-2">
                        (Max: {balance.toString()})
                      </span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="e.g., 100"
                      value={amount}
                      onChange={(e) => {
                        const value = e.target.value
                        if (value === '') {
                          setAmount('')
                          setAmountError(null)
                          return
                        }
                        const numValue = Number(value)
                        if (!isNaN(numValue) && numValue >= 0) {
                          setAmount(value)
                        }
                      }}
                      disabled={isPending || isConfirming}
                      min="1"
                      max={balance.toString()}
                      className={amountError ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    {amountError && (
                      <p className="text-sm text-red-600 dark:text-red-400">{amountError}</p>
                    )}
                  </div>
                  
                  {/* Selector de destinatario */}
                  <div className="space-y-2">
                    <Label htmlFor="to">
                      Recipient {targetRoleName ? `(${targetRoleName})` : ''}
                    </Label>
                    {isLoadingUsers || targetRole === undefined ? (
                      <Skeleton className="h-10 w-full" />
                    ) : usersError ? (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Error loading users: {usersError.message}
                        </AlertDescription>
                      </Alert>
                    ) : availableUsers.length === 0 ? (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No {targetRoleName.toLowerCase()} users available (must be approved)
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Select
                        value={to}
                        onValueChange={setTo}
                        disabled={isPending || isConfirming}
                      >
                        <SelectTrigger id="to" className="w-full">
                          <SelectValue placeholder={`Select ${targetRoleName || 'recipient'}...`} />
                        </SelectTrigger>
                        <SelectContent>
                          {availableUsers.map((user) => (
                            <SelectItem key={user.userAddress} value={user.userAddress}>
                              <AddressDisplay address={user.userAddress} className="text-sm" />
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  
                  {/* Resumen antes de enviar */}
                  {amount && to && !amountError && Number(amount) > 0 && (
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <p className="text-sm font-medium mb-2">Transfer Summary</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Token:</span>
                          <span className="font-medium">{tokenData.name} (#{tokenId.toString()})</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-medium">{amount} tokens</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">To:</span>
                          <AddressDisplay address={to} className="text-sm font-medium" />
                        </div>
                        {balanceAfter !== null && (
                          <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-800">
                            <span className="text-muted-foreground">Your balance after:</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">
                              {balanceAfter.toString()} tokens
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Botones */}
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push(`/tokens/${id}`)}
                      disabled={isPending || isConfirming}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isPaused || isPending || isConfirming || !!amountError || !to || !amount || Number(amount) <= 0}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white"
                    >
                      {isPending || isConfirming ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isConfirming ? 'Confirming...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Transfer Tokens
                        </>
                      )}
                    </Button>
                  </div>
                </form>
                
                {isPaused && (
                  <Alert variant="warning" className="mt-4">
                    <Pause className="h-4 w-4" />
                    <AlertDescription>
                      The contract is currently paused. Transfer creation is disabled.
                    </AlertDescription>
                  </Alert>
                )}
                
                {formError && (
                  <Alert variant="destructive" className="mt-4">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                
                {transferError && (
                  <Alert variant="destructive" className="mt-4">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      {transferError.message || 'An error occurred while creating the transfer.'}
                    </AlertDescription>
                  </Alert>
                )}
                
                {isSuccess && hash && (
                  <Alert className="mt-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                    <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-700 dark:text-green-300">
                      <strong>Transfer created successfully!</strong> Redirecting to token details...
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Columna lateral - Información adicional */}
          <div>
            <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-3xl">
              <CardHeader>
                <CardTitle className="text-lg">Token Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Token Name</p>
                  <p className="font-semibold">{tokenData.name}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Token ID</p>
                  <p className="font-mono text-sm">#{tokenId.toString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Type</p>
                  <Badge
                    variant="outline"
                    className={
                      isRawMaterial
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                        : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300'
                    }
                  >
                    {isRawMaterial ? 'Raw Material' : 'Finished Product'}
                  </Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Creator</p>
                  <AddressDisplay address={tokenData.creator || 'N/A'} className="text-xs" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Necesario para usar useState, useEffect, useMemo
import { useState, useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'

