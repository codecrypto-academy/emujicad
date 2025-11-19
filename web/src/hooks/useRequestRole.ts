'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI, UserRole } from '@/contracts/config'

/**
 * Hook para solicitar un rol de usuario
 */
export function useRequestRole() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const requestRole = (role: UserRole) => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'requestUserRole',
      args: [role],
    })
  }

  return {
    requestRole,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}
