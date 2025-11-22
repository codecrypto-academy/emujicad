'use client'

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config'

/**
 * Hook para leer el estado de pausa del contrato
 */
export function useIsPaused(enabled: boolean = true) {
  return useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'isPaused',
    query: {
      enabled,
      refetchInterval: enabled ? 5000 : false, // Refrescar cada 5 segundos solo si está habilitado
    },
  })
}

/**
 * Hook para pausar el contrato
 */
export function usePause() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const pause = () => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'pause',
    })
  }

  return {
    pause,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

/**
 * Hook para quitar la pausa del contrato
 */
export function useUnpause() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const unpause = () => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'unpause',
    })
  }

  return {
    unpause,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

