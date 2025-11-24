'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config'

/**
 * Hook para gestionar la transferencia de ownership del contrato
 */
export function useOwnershipTransfer() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  /**
   * Inicia la transferencia de ownership a una nueva dirección
   * @param newOwner Dirección del nuevo owner candidato
   */
  const initiateOwnershipTransfer = (newOwner: `0x${string}`) => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'initiateOwnershipTransfer',
      args: [newOwner],
    })
  }

  /**
   * Acepta la transferencia de ownership (solo puede ser llamado por el pendingOwner)
   */
  const acceptOwnershipTransfer = () => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'acceptOwnershipTransfer',
      args: [],
    })
  }

  /**
   * Rechaza la transferencia de ownership (solo puede ser llamado por el pendingOwner)
   */
  const rejectOwnershipTransfer = () => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'rejectOwnershipTransfer',
      args: [],
    })
  }

  return {
    initiateOwnershipTransfer,
    acceptOwnershipTransfer,
    rejectOwnershipTransfer,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

