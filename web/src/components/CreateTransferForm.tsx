'use client'

import React, { useState, useEffect } from 'react'
import { useTransfer } from '@/hooks/useTransfer'
import { useIsPaused } from '@/hooks/usePause'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, XCircle, Send, Pause } from 'lucide-react'
import { isAddress } from 'viem'

export function CreateTransferForm() {
  const [to, setTo] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [amount, setAmount] = useState('')
  const [formError, setFormError] = useState<string | null>(null)

  const { transfer, isPending, isConfirming, isSuccess, error: transferError, hash } = useTransfer()
  const { data: isPaused } = useIsPaused()
  
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
