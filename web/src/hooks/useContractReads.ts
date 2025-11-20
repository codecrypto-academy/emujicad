'use client'

import { useReadContract } from 'wagmi'
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
