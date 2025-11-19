'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config'

/**
 * Hook para gestionar transferencias de tokens
 */
export function useTransfer() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const transfer = (to: `0x${string}`, tokenId: bigint, amount: bigint) => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'transfer',
      args: [to, tokenId, amount],
    })
  }

  const acceptTransfer = (transferId: bigint) => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'acceptTransfer',
      args: [transferId],
    })
  }

  const rejectTransfer = (transferId: bigint) => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'rejectTransfer',
      args: [transferId],
    })
  }

  const cancelTransfer = (transferId: bigint) => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'cancelTransfer',
      args: [transferId],
    })
  }

  return {
    transfer,
    acceptTransfer,
    rejectTransfer,
    cancelTransfer,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}
