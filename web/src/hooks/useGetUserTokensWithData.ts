import { useReadContracts, useAccount } from 'wagmi';
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config';
import { useGetUserTokens } from './useGetUserTokens';
import { validateTokenDataTuple } from '@/lib/validation';
import { validateBigIntArray } from '@/lib/validation';
import type { TokenData } from '@/types';
import { useMemo } from 'react';

/**
 * Hook to get all tokens owned by the user with their full data
 * Only returns tokens where the user has balance > 0
 * 
 * Uses batch reads (useReadContracts) for optimal performance.
 * First gets user token IDs, then fetches token data and balances in batch calls.
 * 
 * @returns Array of TokenData with loading and error states
 * 
 * @example
 * ```tsx
 * const { tokens, isLoading, error } = useGetUserTokensWithData()
 * ```
 */
export function useGetUserTokensWithData(userAddress?: `0x${string}`) {
  const { address: connectedAddress } = useAccount();
  const addressToUse = userAddress || connectedAddress;

  // Get all token IDs owned by the user
  const { data: userTokens, isLoading: isLoadingUserTokens, error: userTokensError, refetch: refetchUserTokenIds } = useGetUserTokens(addressToUse);
  
  const validTokenIds = useMemo(() => {
    return validateBigIntArray(userTokens) || [];
  }, [userTokens]);

  // Create contracts array for batch reading token data and balances
  const contracts = useMemo(() => {
    if (!validTokenIds || validTokenIds.length === 0 || !addressToUse) {
      return [];
    }

    const contractsArray: any[] = [];
    
    // For each token, we need:
    // 1. Token data (to get full token info)
    // 2. Token balance (to verify user has balance > 0)
    validTokenIds.forEach(tokenId => {
      // Get token data
      contractsArray.push({
        address: SUPPLY_CHAIN_ADDRESS,
        abi: SUPPLY_CHAIN_ABI,
        functionName: 'getToken' as const,
        args: [tokenId],
      });
      
      // Get token balance for user
      contractsArray.push({
        address: SUPPLY_CHAIN_ADDRESS,
        abi: SUPPLY_CHAIN_ABI,
        functionName: 'getTokenBalance' as const,
        args: [tokenId, addressToUse],
      });
    });

    return contractsArray;
  }, [validTokenIds, addressToUse]);

  // Batch read all token data and balances
  const { data: contractsData, isLoading: isLoadingContracts, error: contractsError, refetch: refetchContracts } = useReadContracts({
    contracts: contracts as any,
    query: {
      enabled: contracts.length > 0,
      refetchInterval: 5000,
    },
  });

  // Process and validate token data, filtering by balance > 0
  const tokens = useMemo(() => {
    if (!contractsData || contractsData.length === 0 || !validTokenIds || validTokenIds.length === 0) {
      return [];
    }

    const validatedTokens: (TokenData & { tokenId: bigint; balance: bigint })[] = [];
    const errors: Array<{ tokenId: number; error: string }> = [];

    // Process results: each token has 2 results (token data, balance)
    validTokenIds.forEach((tokenId, index) => {
      const tokenDataIndex = index * 2;
      const balanceIndex = index * 2 + 1;

      const tokenDataResult = contractsData[tokenDataIndex];
      const balanceResult = contractsData[balanceIndex];

      // Skip if there are errors
      if (tokenDataResult?.error || balanceResult?.error) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[useGetUserTokensWithData] Error reading token ${tokenId}:`, 
            tokenDataResult?.error || balanceResult?.error);
        }
        return;
      }

      // Validate token data
      if (!tokenDataResult?.result || !Array.isArray(tokenDataResult.result)) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[useGetUserTokensWithData] Token ${tokenId} result is not an array:`, tokenDataResult.result);
        }
        return;
      }

      const tokenData = validateTokenDataTuple(tokenDataResult.result);
      if (!tokenData) {
        if (process.env.NODE_ENV === 'development') {
          console.warn(`[useGetUserTokensWithData] Token ${tokenId} failed validation:`, tokenDataResult.result);
        }
        return;
      }

      // Get balance
      const balance = balanceResult?.result ? BigInt(balanceResult.result as string) : BigInt(0);
      
      // Only include tokens where user has balance > 0
      if (balance > BigInt(0)) {
        validatedTokens.push({
          ...tokenData,
          tokenId,
          balance, // Include balance in the token data
        });
      }
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`[useGetUserTokensWithData] Loaded ${validatedTokens.length} tokens with balance > 0, ${errors.length} errors`);
    }

    return validatedTokens;
  }, [contractsData, validTokenIds]);

  // Función para refetch que actualiza tanto los IDs como los datos de los tokens
  const refetch = async () => {
    await refetchUserTokenIds()
    if (contracts.length > 0) {
      await refetchContracts()
    }
  }

  return {
    tokens,
    isLoading: isLoadingUserTokens || isLoadingContracts,
    error: userTokensError || contractsError,
    totalTokens: tokens.length,
    refetch,
  };
}

