'use client'

import React from 'react'
import { useAccount } from 'wagmi'
import { useGetUserTokensWithData } from '@/hooks/useGetUserTokensWithData'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Package, AlertCircle } from 'lucide-react'

export function UserTokenList() {
  const { address } = useAccount()
  const { tokens, isLoading, error } = useGetUserTokensWithData(address)
  
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'
  const cardClass = useModernDesign 
    ? "border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-2xl" 
    : ""

  // ℹ️ TODOS los roles pueden ver sus tokens (Producer, Factory, Retailer, Consumer)
  // El Consumer puede ver sus tokens pero no puede crear transferencias

  if (error) {
    return (
      <Alert variant="destructive" className="mb-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading your tokens: {error.message}
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={`mb-8 ${cardClass}`}>
      <CardHeader>
        <CardTitle>Your Available Tokens</CardTitle>
        <CardDescription>
          These are the tokens you currently own. Roles with transfer permissions can use these Token IDs to create transfers.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : tokens && tokens.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Symbol</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tokens.map((token) => (
                  <TableRow key={token.tokenId.toString()}>
                    <TableCell className="font-mono">#{token.tokenId.toString()}</TableCell>
                    <TableCell>{token.name}</TableCell>
                    <TableCell className="font-mono">{token.symbol}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">You do not own any tokens yet.</p>
            <p className="text-sm text-muted-foreground mt-1">
              Tokens will appear here when you create them or receive transfers from other users.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
