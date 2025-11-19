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
    parentId: bigint
  ) => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'createToken',
      args: [name, tokenType, totalSupply, features, parentId],
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
