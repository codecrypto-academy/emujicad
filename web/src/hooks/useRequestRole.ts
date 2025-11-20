'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config'

/**
 * Hook para solicitar un rol de usuario
 * @param role - Rol del usuario: 'Producer', 'Factory', 'Retailer', o 'Consumer'
 */
export function useRequestRole() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
    confirmations: 1, // Solo esperar 1 confirmación en Anvil (instantáneo)
  })

  // Mapeo de nombres de roles a valores del enum (uint8)
  const roleToNumber = (role: string): number => {
    const roleMap: Record<string, number> = {
      'Producer': 0,
      'Factory': 1,
      'Retailer': 2,
      'Consumer': 3,
    }
    return roleMap[role] ?? 0
  }

  const requestRole = (role: string) => {
    const roleValue = roleToNumber(role)
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'requestUserRole',
      args: [roleValue],
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
