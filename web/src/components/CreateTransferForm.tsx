'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useTransfer } from '@/hooks/useTransfer'
import { useIsPaused } from '@/hooks/usePause'
import { useAuth } from '@/contexts/AuthContext'
import { useUsersByRole } from '@/hooks/useUsersByRole'
import { useGetUserTokensWithData } from '@/hooks/useGetUserTokensWithData'
import { useAccount } from 'wagmi'
import { UserRole } from '@/contracts/config'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Send, Pause, AlertCircle } from 'lucide-react'
import { isAddress } from 'viem'

export function CreateTransferForm() {
  const [to, setTo] = useState('')
  const [selectedTokenId, setSelectedTokenId] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [formError, setFormError] = useState<string | null>(null)
  const [amountError, setAmountError] = useState<string | null>(null)

  const { transfer, isPending, isConfirming, isSuccess, error: transferError, hash } = useTransfer()
  const { data: isPaused } = useIsPaused()
  const { userInfo, isAdmin } = useAuth()
  const { address } = useAccount()
  
  // Obtener usuarios filtrados por rol según el flujo de la cadena de suministro
  const { users: availableUsers, isLoading: isLoadingUsers, error: usersError, targetRole } = useUsersByRole(userInfo?.role)
  
  // Debug: Log usuarios disponibles
  useEffect(() => {
    console.log('[CreateTransferForm] 🔍 Complete Users state:', {
      userInfo: userInfo ? {
        role: Number(userInfo.role),
        roleName: ['Producer', 'Factory', 'Retailer', 'Consumer'][Number(userInfo.role)] || 'Unknown',
        status: Number(userInfo.status),
        statusName: ['Pending', 'Approved', 'Rejected', 'Canceled'][Number(userInfo.status)] || 'Unknown',
        address: userInfo.userAddress
      } : null,
      userInfoRoleRaw: userInfo?.role,
      targetRole,
      targetRoleName: targetRole !== undefined ? ['Producer', 'Factory', 'Retailer', 'Consumer'][targetRole] || 'Unknown' : 'undefined',
      availableUsersCount: availableUsers.length,
      availableUsers: availableUsers.map(u => ({
        address: u.userAddress,
        role: Number(u.role),
        roleName: ['Producer', 'Factory', 'Retailer', 'Consumer'][Number(u.role)] || 'Unknown',
        status: Number(u.status),
        statusName: ['Pending', 'Approved', 'Rejected', 'Canceled'][Number(u.status)] || 'Unknown',
        id: u.id.toString()
      })),
      isLoadingUsers,
      usersError: usersError?.message
    })
  }, [availableUsers, isLoadingUsers, usersError, userInfo, targetRole])
  
  // Obtener tokens del usuario con balance > 0
  const { tokens: availableTokens, isLoading: isLoadingTokens } = useGetUserTokensWithData(address)
  
  // ⚠️ VALIDACIÓN CRÍTICA: Solo Producer, Factory y Retailer pueden ENVIAR transferencias
  // Esto debe estar alineado con el contrato inteligente (modifier onlyTransfersAllowed)
  const canTransfer = userInfo && (
    userInfo.role === BigInt(UserRole.Producer) || 
    userInfo.role === BigInt(UserRole.Factory) || 
    userInfo.role === BigInt(UserRole.Retailer)
  )
  
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'
  
  // Obtener el balance del token seleccionado para validación
  const selectedToken = useMemo(() => {
    if (!selectedTokenId) return null
    return availableTokens.find(t => t.tokenId.toString() === selectedTokenId)
  }, [selectedTokenId, availableTokens])
  
  // Validar amount en tiempo real
  useEffect(() => {
    if (!amount || !selectedToken) {
      setAmountError(null)
      return
    }
    
    const amountNum = Number(amount)
    const maxBalance = selectedToken.balance ? Number(selectedToken.balance) : 0
    
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
  }, [amount, selectedToken])
  
  // Obtener el nombre del rol objetivo para mostrar en el label
  const targetRoleName = useMemo(() => {
    if (!userInfo) return ''
    const roleNum = Number(userInfo.role)
    if (roleNum === UserRole.Producer) return 'Factory'
    if (roleNum === UserRole.Factory) return 'Retailer'
    if (roleNum === UserRole.Retailer) return 'Consumer'
    return ''
  }, [userInfo])

  useEffect(() => {
    if (isSuccess && hash) {
      // Reset form on successful transaction
      setTo('')
      setSelectedTokenId('')
      setAmount('')
      setFormError(null)
      
      // Disparar evento personalizado para notificar que se creó una transferencia
      // Esto permitirá que TransferList se actualice inmediatamente
      const event = new CustomEvent('transferCreated', { detail: { hash } })
      window.dispatchEvent(event)
      console.log('[CreateTransferForm] Transfer created, dispatching event:', hash)
    }
  }, [isSuccess, hash])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (isPaused) {
      setFormError('Cannot create transfers while the contract is paused.')
      return
    }

    // Basic validation
    if (!to || !selectedTokenId || !amount) {
      setFormError('All fields are required.')
      return
    }
    if (!isAddress(to)) {
      setFormError('Invalid recipient address.')
      return
    }
    
    const tokenIdNum = Number(selectedTokenId)
    if (isNaN(tokenIdNum) || tokenIdNum <= 0) {
      setFormError('Please select a valid token.')
      return
    }
    
    const amountNum = Number(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setFormError('Amount must be a positive number.')
      return
    }
    
    // Validar que el amount no exceda el balance disponible
    if (selectedToken && selectedToken.balance && amountNum > Number(selectedToken.balance)) {
      setFormError(`Insufficient balance. Available: ${selectedToken.balance.toString()}`)
      return
    }

    transfer(to as `0x${string}`, BigInt(selectedTokenId), BigInt(amount))
  }
  
  const cardClass = useModernDesign 
    ? "border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-2xl" 
    : ""

  // Si el usuario es Consumer, mostrar mensaje informativo en lugar del formulario
  if (userInfo && userInfo.role === BigInt(UserRole.Consumer)) {
    return (
      <Card className={`mb-8 ${cardClass}`}>
        <CardHeader>
          <CardTitle>Create New Transfer</CardTitle>
          <CardDescription>Initiate a new token transfer to another user.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              <strong>Consumer Role:</strong> As a Consumer, you can only receive transfers. 
              You cannot initiate transfers to other users. This is by design in the supply chain workflow.
            </AlertDescription>
          </Alert>
          <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              <strong>Supply Chain Flow:</strong>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
              Producer → Factory → Retailer → <strong className="text-blue-600 dark:text-blue-400">Consumer (You)</strong>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 mt-2">
              You will appear in the transfers list when other users send tokens to you.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Si no puede transferir por otras razones, también bloqueamos
  if (!canTransfer && !isAdmin) {
    return (
      <Card className={`mb-8 ${cardClass}`}>
        <CardHeader>
          <CardTitle>Create New Transfer</CardTitle>
          <CardDescription>Initiate a new token transfer to another user.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Your role does not allow creating transfers. Only Producer, Factory, and Retailer roles can send transfers.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`mb-8 ${cardClass}`}>
      <CardHeader>
        <CardTitle>Create New Transfer</CardTitle>
        <CardDescription>Initiate a new token transfer to another user.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Selector de token (mostrar nombre, usar ID internamente) - PRIMERO */}
            <div className="space-y-2">
              <Label htmlFor="token">Token</Label>
              {isLoadingTokens ? (
                <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
              ) : availableTokens.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground border rounded-md">
                  No tokens available (balance &gt; 0 required)
                </div>
              ) : (
                <Select
                  value={selectedTokenId}
                  onValueChange={setSelectedTokenId}
                  disabled={isPending || isConfirming}
                >
                  <SelectTrigger id="token" className="w-full">
                    <SelectValue placeholder="Select token..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTokens.map((token) => (
                      <SelectItem key={token.tokenId.toString()} value={token.tokenId.toString()}>
                        {token.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            
            {/* Input de cantidad - SEGUNDO */}
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount
                {selectedToken && selectedToken.balance && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (Max: {selectedToken.balance.toString()})
                  </span>
                )}
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g., 100"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value
                  // Permitir vacío para borrar
                  if (value === '') {
                    setAmount('')
                    setAmountError(null)
                    return
                  }
                  // Solo permitir números positivos
                  const numValue = Number(value)
                  if (!isNaN(numValue) && numValue >= 0) {
                    setAmount(value)
                  }
                }}
                disabled={isPending || isConfirming || !selectedTokenId}
                min="1"
                max={selectedToken?.balance?.toString() || undefined}
                className={amountError ? 'border-red-500 focus-visible:ring-red-500' : ''}
              />
              {amountError && (
                <p className="text-sm text-red-600 dark:text-red-400">{amountError}</p>
              )}
            </div>
            
            {/* Selector de destinatario filtrado por rol - TERCERO */}
            <div className="space-y-2">
              <Label htmlFor="to">
                Recipient {targetRoleName ? `(${targetRoleName})` : ''}
              </Label>
              {isLoadingUsers || targetRole === undefined ? (
                <div className="h-9 w-full bg-slate-100 dark:bg-slate-800 rounded-md animate-pulse" />
              ) : usersError ? (
                <div className="p-2 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-md">
                  Error loading users: {usersError.message}
                </div>
              ) : availableUsers.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground border rounded-md">
                  No {targetRoleName.toLowerCase()} users available (must be approved)
                </div>
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
                        <span className="font-mono text-sm">{user.userAddress}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isPaused || isPending || isConfirming || !!amountError || !to || !selectedTokenId || !amount || Number(amount) <= 0}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 rounded-xl px-6 py-5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending || isConfirming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isConfirming ? 'Confirming...' : 'Sending...'}
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Create Transfer
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
              Error: {transferError.message.split(':')[0]}
            </AlertDescription>
          </Alert>
        )}

        {isSuccess && hash && (
          <Alert variant="success" className="mt-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>¡Transferencia creada exitosamente!</strong>
              <p className="mt-2 text-sm">
                Tu transferencia ha sido enviada y está pendiente de aprobación por parte del destinatario.
                {' '}
                <a 
                  href={`https://etherscan.io/tx/${hash}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  Ver detalles de la transacción
                </a>
              </p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
