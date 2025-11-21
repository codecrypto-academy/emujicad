import { useReadContract, useAccount } from 'wagmi';
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config';

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
