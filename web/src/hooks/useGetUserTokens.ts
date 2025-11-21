import { useReadContract, useReadContracts, useAccount } from 'wagmi';
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config';
import { useTotalTokens } from './useContractReads';
import { validateTokenDataTuple } from '@/lib/validation';
import type { TokenData } from '@/types';
import { useMemo } from 'react';

/**
 * Hook to get all token IDs owned by a user
 */
export function useGetUserTokens(userAddress?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const addressToUse = userAddress || connectedAddress;

  return useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'getUserTokens',
    args: addressToUse ? [addressToUse] : undefined,
    query: {
      enabled: !!addressToUse,
      refetchInterval: 5000,
    },
  });
}

/**
 * Hook to get detailed information about a specific token
 */
export function useGetToken(tokenId?: bigint) {
  return useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'getToken',
    args: tokenId !== undefined ? [tokenId] : undefined,
    query: {
      enabled: tokenId !== undefined,
      refetchInterval: 5000,
    },
  });
}

/**
 * Hook to get the balance of a specific token for a user
 */
export function useGetTokenBalance(tokenId?: bigint, userAddress?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const addressToUse = userAddress || connectedAddress;

  return useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'balanceOf',
    args: addressToUse && tokenId !== undefined ? [addressToUse, tokenId] : undefined,
    query: {
      enabled: !!addressToUse && tokenId !== undefined,
      refetchInterval: 5000,
    },
  });
}

/**
 * Hook to get all tokens in the system
 * 
 * Uses batch reads (useReadContracts) for optimal performance.
 * First gets totalTokens, then fetches all tokens in a single batch call.
 * 
 * @returns Array of TokenData with loading and error states
 * 
 * @example
 * ```tsx
 * const { tokens, isLoading, error } = useGetAllTokens()
 * ```
 */
export function useGetAllTokens() {
  // First, get the total number of tokens
  const { data: totalTokens, isLoading: isLoadingTotal, error: totalError } = useTotalTokens();

  // Create contracts array for batch reading
  const contracts = useMemo(() => {
    if (!totalTokens || totalTokens === BigInt(0)) {
      return [];
    }

    const count = Number(totalTokens);
    return Array.from({ length: count }, (_, i) => ({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'getToken' as const,
      args: [BigInt(i + 1)], // Token IDs start at 1
    }));
  }, [totalTokens]);

  // Batch read all tokens
  const { data: tokensData, isLoading: isLoadingTokens, error: tokensError } = useReadContracts({
    contracts: contracts as any, // Type assertion needed due to dynamic array generation
    query: {
      enabled: contracts.length > 0,
      refetchInterval: 5000,
    },
  });

  // Process and validate token data
  const tokens = useMemo(() => {
    if (!tokensData || tokensData.length === 0) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[useGetAllTokens] No tokensData available');
      }
      return [];
    }

    const validatedTokens: (TokenData & { tokenId: bigint })[] = [];
    const errors: Array<{ tokenId: number; error: string }> = [];

    tokensData.forEach((item, index) => {
      const tokenId = BigInt(index + 1);
      
      if (item.error) {
        // Log errors in development
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[useGetAllTokens] Error reading token ${tokenId}:`, item.error);
          errors.push({ tokenId: index + 1, error: item.error.message || 'Unknown error' });
        }
        // Skip tokens that don't exist (might have been deleted or invalid ID)
        return;
      }

      // Validate that result is an array before passing to validateTokenDataTuple
      const result = item.result
      if (!result || !Array.isArray(result)) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[useGetAllTokens] Token ${tokenId} result is not an array:`, result);
        }
        return;
      }
      
      const validated = validateTokenDataTuple(result);

      if (validated) {
        validatedTokens.push({
          ...validated,
          tokenId,
        });
        // Solo loggear errores, no cada token cargado exitosamente (reduce ruido)
        // if (process.env.NODE_ENV === 'development') {
        //   console.log(`[useGetAllTokens] Successfully loaded token ${tokenId}:`, validated.name);
        // }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[useGetAllTokens] Token ${tokenId} failed validation:`, result);
        }
      }
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[useGetAllTokens] Loaded ${validatedTokens.length} tokens, ${errors.length} errors`);
      if (errors.length > 0) {
        console.warn('[useGetAllTokens] Errors:', errors);
      }
    }

    return validatedTokens;
  }, [tokensData]);

  return {
    tokens,
    isLoading: isLoadingTotal || isLoadingTokens,
    error: totalError || tokensError,
    totalTokens: totalTokens ? Number(totalTokens) : 0,
  };
}
