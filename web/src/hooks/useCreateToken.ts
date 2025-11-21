'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI, TokenType } from '@/contracts/config'

/**
 * Hook para crear un nuevo token
 */
export function useCreateToken() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const createToken = (
    name: string,
    tokenType: TokenType,
    totalSupply: bigint,
    features: string,
    parentId: bigint,
    parentAmount: bigint
  ) => {
    // Convert TokenType enum to number (Solidity expects uint8)
    // TokenType enum values are already numbers (0 or 1), but we ensure type safety
    const tokenTypeValue = Number(tokenType) as 0 | 1
    
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'createToken',
      args: [name, tokenTypeValue, totalSupply, features, parentId, parentAmount],
    })
  }

  return {
    createToken,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}
