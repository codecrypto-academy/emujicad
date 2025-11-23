'use client'

import React, { useState, useEffect } from 'react'
import { useTransfer } from '@/hooks/useTransfer'
import { useIsPaused } from '@/hooks/usePause'
import { useAuth } from '@/contexts/AuthContext'
import { UserRole } from '@/contracts/config'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Send, Pause, AlertCircle } from 'lucide-react'
import { isAddress } from 'viem'

export function CreateTransferForm() {
  const [to, setTo] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [amount, setAmount] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const { transfer, isPending, isConfirming, isSuccess, error: transferError, hash } = useTransfer()
  const { data: isPaused } = useIsPaused()
  const { userInfo, isAdmin } = useAuth()
  
  // ⚠️ VALIDACIÓN CRÍTICA: Solo Producer, Factory y Retailer pueden ENVIAR transferencias
  // Esto debe estar alineado con el contrato inteligente (modifier onlyTransfersAllowed)
  const canTransfer = userInfo && (
    userInfo.role === BigInt(UserRole.Producer) || 
    userInfo.role === BigInt(UserRole.Factory) || 
    userInfo.role === BigInt(UserRole.Retailer)
  )
  
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'

  useEffect(() => {
    if (isSuccess) {
      // Reset form on successful transaction
      setTo('')
      setTokenId('')
      setAmount('')
      setFormError(null)
    }
  }, [isSuccess])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (isPaused) {
      setFormError('Cannot create transfers while the contract is paused.')
      return
    }

    // Basic validation
    if (!to || !tokenId || !amount) {
      setFormError('All fields are required.')
      return
    }
    if (!isAddress(to)) {
      setFormError('Invalid recipient address.')
      return
    }
    if (isNaN(Number(tokenId)) || Number(tokenId) < 0) {
      setFormError('Token ID must be a non-negative number.')
      return
    }
    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      setFormError('Amount must be a positive number.')
      return
    }

    transfer(to as `0x${string}`, BigInt(tokenId), BigInt(amount))
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
            <div className="space-y-2">
              <Label htmlFor="to">Recipient Address</Label>
              <Input
                id="to"
                placeholder="0x..."
                value={to}
                onChange={(e) => setTo(e.target.value)}
                disabled={isPending || isConfirming}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tokenId">Token ID</Label>
              <Input
                id="tokenId"
                type="number"
                placeholder="e.g., 1"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                disabled={isPending || isConfirming}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="e.g., 100"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isPending || isConfirming}
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="submit" disabled={isPaused || isPending || isConfirming}>
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
              Transfer created successfully! Transaction Hash: 
              <a 
                href={`https://etherscan.io/tx/${hash}`} // Note: This is a placeholder link
                target="_blank" 
                rel="noopener noreferrer"
                className="underline ml-1"
              >
                {hash.slice(0, 10)}...{hash.slice(-8)}
              </a>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
