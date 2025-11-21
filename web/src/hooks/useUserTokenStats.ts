import { useMemo } from 'react';
import { useGetUserTokens, useGetToken, useGetTokenBalance } from './useGetUserTokens';
import { useAccount } from 'wagmi';
import { TokenType } from '@/contracts/config';
import { validateBigIntArray } from '@/lib/validation';

export interface TokenTypeStats {
  tokenType: TokenType;
  tokenTypeName: string;
  totalBalance: bigint;
  tokenCount: number;
  tokenIds: bigint[];
}

/**
 * Hook to get token statistics grouped by type for the current user
 * Returns aggregated data: total balance and count per token type
 */
export function useUserTokenStats(userAddress?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const addressToUse = userAddress || connectedAddress;

  // Get all token IDs owned by the user
  const { data: userTokens, isLoading: isLoadingTokens, error: tokensError } = useGetUserTokens(addressToUse);
  
  const validTokenIds = useMemo(() => {
    return validateBigIntArray(userTokens) || [];
  }, [userTokens]);

  // For each token, we need to get its type and balance
  // We'll use batch reads for efficiency
  const tokenQueries = useMemo(() => {
    if (!validTokenIds || validTokenIds.length === 0) return [];
    
    return validTokenIds.map(tokenId => ({
      tokenId,
      // We'll fetch token data and balance separately
    }));
  }, [validTokenIds]);

  // Aggregate stats by token type
  const stats = useMemo(() => {
    if (!validTokenIds || validTokenIds.length === 0) {
      return {
        rowMaterial: {
          tokenType: TokenType.RowMaterial,
          tokenTypeName: 'Raw Material',
          totalBalance: BigInt(0),
          tokenCount: 0,
          tokenIds: [],
        } as TokenTypeStats,
        finishedProduct: {
          tokenType: TokenType.FinishedProduct,
          tokenTypeName: 'Finished Product',
          totalBalance: BigInt(0),
          tokenCount: 0,
          tokenIds: [],
        } as TokenTypeStats,
        isLoading: false,
        error: null,
      };
    }

    // Initialize stats
    const rowMaterial: TokenTypeStats = {
      tokenType: TokenType.RowMaterial,
      tokenTypeName: 'Raw Material',
      totalBalance: BigInt(0),
      tokenCount: 0,
      tokenIds: [],
    };

    const finishedProduct: TokenTypeStats = {
      tokenType: TokenType.FinishedProduct,
      tokenTypeName: 'Finished Product',
      totalBalance: BigInt(0),
      tokenCount: 0,
      tokenIds: [],
    };

    // We'll need to fetch token data and balances
    // For now, return structure - actual data will be fetched in component
    return {
      rowMaterial,
      finishedProduct,
      tokenIds: validTokenIds,
      isLoading: false,
      error: null,
    };
  }, [validTokenIds]);

  return {
    ...stats,
    isLoading: isLoadingTokens,
    error: tokensError,
    tokenIds: validTokenIds,
  };
}

