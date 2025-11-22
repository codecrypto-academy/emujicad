'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetToken, useGetTokenBalance } from '@/hooks/useGetUserTokens';
import { useAccount } from 'wagmi';
import { Package, Factory, User, Calendar } from 'lucide-react';
import { validateTokenDataTuple } from '@/lib/validation';
import type { TokenData } from '@/types';

interface TokenCardProps {
  tokenId?: bigint;
  showBalance?: boolean;
  onClick?: () => void;
}

export function TokenCard({ tokenId, showBalance = false, onClick }: TokenCardProps) {
  const { address } = useAccount();
  const { data: rawTokenData, isLoading: isLoadingToken } = useGetToken(tokenId);
  const { data: balance, isLoading: isLoadingBalance } = useGetTokenBalance(tokenId, address);

  // Validación robusta de tokenData - memoizar para evitar re-creación en cada render
  const tokenData = React.useMemo(() => {
    return rawTokenData
      ? (Array.isArray(rawTokenData)
          ? validateTokenDataTuple(rawTokenData) ?? undefined
          : undefined)
      : undefined;
  }, [rawTokenData]);

  // Memoizar tokenData para evitar re-renders durante refetch
  // Usar useRef para mantener el último valor válido sin causar re-renders
  const stableTokenDataRef = React.useRef<TokenData | undefined>(tokenData);
  const stableBalanceRef = React.useRef<bigint | undefined>(
    balance !== null && balance !== undefined && typeof balance === 'bigint' ? balance : undefined
  );

  // Actualizar refs solo cuando hay datos nuevos (comparar por ID para evitar loops)
  React.useEffect(() => {
    if (tokenData) {
      // Solo actualizar si el ID cambió o no hay datos previos
      if (!stableTokenDataRef.current || tokenData.id !== stableTokenDataRef.current.id) {
        stableTokenDataRef.current = tokenData;
      }
    }
  }, [tokenData?.id]); // Solo depender del ID, no del objeto completo

  React.useEffect(() => {
    if (balance !== undefined && balance !== null && typeof balance === 'bigint') {
      stableBalanceRef.current = balance;
    }
  }, [balance]);

  // Usar los refs para display, pero mantener estado para forzar re-render cuando sea necesario
  const displayTokenData = stableTokenDataRef.current || tokenData;
  const displayBalance = stableBalanceRef.current !== undefined ? stableBalanceRef.current : balance;

  // Solo mostrar loading en la primera carga, no durante refetch
  const isInitialLoading = (isLoadingToken && !displayTokenData) || (showBalance && isLoadingBalance && displayBalance === undefined) || tokenId === undefined;

  if (isInitialLoading) {
    return (
      <Card className="hover:shadow-lg transition-shadow duration-300 animate-pulse">
        <CardHeader>
          <Skeleton className="h-6 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      </Card>
    );
  }

  if (!displayTokenData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Token not found</p>
        </CardContent>
      </Card>
    );
  }

  const { id, name, tokenType, totalSupply, creator, parentToken, createdAt, features } = displayTokenData;
  const isRawMaterial = Number(tokenType) === 0;
  const formattedDate = new Date(Number(createdAt) * 1000).toLocaleDateString();
  const formattedCreator = creator.slice(0, 6) + '...' + creator.slice(-4);

  return (
    <Card
      className="hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out cursor-pointer animate-in fade-in slide-in-from-bottom-4"
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`Token ${name}, ID ${id.toString()}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isRawMaterial ? (
              <Package className="h-5 w-5 text-blue-500" />
            ) : (
              <Factory className="h-5 w-5 text-purple-500" />
            )}
            <span className="text-lg truncate">{name}</span>
          </div>
          <Badge variant="outline" className="ml-2">
            #{id.toString()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Type</span>
          <Badge variant={isRawMaterial ? 'default' : 'secondary'}>
            {isRawMaterial ? 'Raw Material' : 'Finished Product'}
          </Badge>
        </div>

        {showBalance && displayBalance !== undefined && displayBalance !== null && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">My Balance</span>
            <span className="font-semibold">{displayBalance.toString()}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Supply</span>
          <span className="font-medium">{totalSupply.toString()}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <User className="h-3 w-3" />
            Creator
          </span>
          <span className="font-mono text-xs">{formattedCreator}</span>
        </div>

               {parentToken !== BigInt(0) && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Parent Token</span>
            <Badge variant="outline">#{parentToken.toString()}</Badge>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            Created
          </span>
          <span className="text-xs">{formattedDate}</span>
        </div>

        {features && features.length > 0 && (
          <div className="pt-2 border-t">
            <span className="text-sm text-muted-foreground block mb-2">Features</span>
            <p className="text-xs line-clamp-2">{features}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
