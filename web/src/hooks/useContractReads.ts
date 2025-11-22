'use client'

import { useReadContract, useReadContracts } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config'

/**
 * Hook para obtener el ID de usuario desde una dirección
 */
export function useUserIdByAddress(userAddress?: `0x${string}`) {
  return useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'addressToUserId',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  })
}

/**
 * Hook para obtener información de un usuario por su ID
 */
export function useUserInfoById(userId?: bigint | number) {
  const validUserId = userId && Number(userId) > 0
  
  return useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'getUserInfoById',
    args: validUserId ? [BigInt(userId)] : undefined,
    query: {
      enabled: !!validUserId,
    },
  })
}

/**
 * Hook para obtener información de un usuario por su dirección
 */
export function useUserInfo(userAddress?: `0x${string}`) {
  return useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'getUserInfo',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  })
}

/**
 * Hook para verificar si una dirección es admin
 */
export function useIsAdmin(userAddress?: `0x${string}`) {
  return useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'isAdmin',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!userAddress,
    },
  })
}

/**
 * Hook para obtener el total de tokens
 */
export function useTotalTokens() {
  return useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'getTotalTokens',
  })
}

/**
 * Hook para obtener el total de usuarios
 */
export function useTotalUsers() {
  return useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'getTotalUsers',
  })
}

/**
 * Hook para obtener el total de transferencias
 */
export function useTotalTransfers() {
  return useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'getTotalTransfers',
  })
}

/**
 * Hook optimizado para obtener todas las estadísticas del dashboard en una sola llamada batch
 * 
 * Esto reduce el número de llamadas RPC de 3 a 1, mejorando significativamente el performance.
 * 
 * @returns Objeto con totalTokens, totalUsers, totalTransfers y estados de carga/error
 * 
 * @example
 * ```tsx
 * const { totalTokens, totalUsers, totalTransfers, isLoading, error } = useDashboardStats()
 * ```
 */
export function useDashboardStats(enabled: boolean = true) {
  const { data, isLoading, error } = useReadContracts({
    contracts: [
      {
        address: SUPPLY_CHAIN_ADDRESS,
        abi: SUPPLY_CHAIN_ABI,
        functionName: 'getTotalTokens',
      },
      {
        address: SUPPLY_CHAIN_ADDRESS,
        abi: SUPPLY_CHAIN_ABI,
        functionName: 'getTotalUsers',
      },
      {
        address: SUPPLY_CHAIN_ADDRESS,
        abi: SUPPLY_CHAIN_ABI,
        functionName: 'getTotalTransfers',
      },
    ],
    query: {
      enabled,
      refetchInterval: enabled ? 5000 : false, // Refetch cada 5 segundos solo si está habilitado
    },
  })

  // Extraer datos de forma segura
  const totalTokens = data?.[0]?.result as bigint | undefined
  const totalUsers = data?.[1]?.result as bigint | undefined
  const totalTransfers = data?.[2]?.result as bigint | undefined

  // Determinar si hay errores individuales
  const errors = data?.map((item, index) => {
    if (item.error) {
      return {
        index,
        functionName: ['getTotalTokens', 'getTotalUsers', 'getTotalTransfers'][index],
        error: item.error,
      }
    }
    return null
  }).filter(Boolean)

  const hasErrors = errors && errors.length > 0

  return {
    totalTokens,
    totalUsers,
    totalTransfers,
    isLoading,
    error: error || (hasErrors ? errors : null),
    // Errores individuales para manejo granular
    errors: {
      totalTokens: data?.[0]?.error || null,
      totalUsers: data?.[1]?.error || null,
      totalTransfers: data?.[2]?.error || null,
    },
  }
}
