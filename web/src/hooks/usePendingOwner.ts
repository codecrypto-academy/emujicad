import { useReadContract } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config'

/**
 * Hook para obtener la dirección del pendingOwner del contrato
 * 
 * @returns {
 *   pendingOwner: string | undefined - Dirección del pendingOwner (address(0) si no hay)
 *   isLoading: boolean - Estado de carga
 *   error: Error | null - Error si falla
 * }
 */
export function usePendingOwner(enabled: boolean = true) {
  const { data: pendingOwner, isLoading, error } = useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'getPendingOwner',
    query: {
      enabled,
    },
  })

  return {
    pendingOwner: pendingOwner as string | undefined,
    isLoading,
    error,
  }
}

