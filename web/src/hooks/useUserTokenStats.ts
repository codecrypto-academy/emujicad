import { useMemo } from 'react';
import { useGetUserTokensWithData } from './useGetUserTokensWithData';
import { TokenType } from '@/contracts/config';

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
  // Get all tokens owned by the user with their data and balances
  const { tokens, isLoading, error } = useGetUserTokensWithData(userAddress);

  // Aggregate stats by token type
  const stats = useMemo(() => {
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

    // If no tokens, return empty stats
    if (!tokens || tokens.length === 0) {
      return {
        rowMaterial,
        finishedProduct,
        isLoading,
        error,
      };
    }

    // Aggregate tokens by type
    tokens.forEach((token) => {
      const tokenType = Number(token.tokenType);
      const balance = token.balance || BigInt(0);

      if (tokenType === TokenType.RowMaterial) {
        rowMaterial.totalBalance += balance;
        rowMaterial.tokenCount += 1;
        rowMaterial.tokenIds.push(token.tokenId);
      } else if (tokenType === TokenType.FinishedProduct) {
        finishedProduct.totalBalance += balance;
        finishedProduct.tokenCount += 1;
        finishedProduct.tokenIds.push(token.tokenId);
      }
    });

    return {
      rowMaterial,
      finishedProduct,
      isLoading,
      error,
    };
  }, [tokens, isLoading, error]);

  return stats;
}

