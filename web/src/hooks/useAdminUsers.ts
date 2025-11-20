import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config'
import { useCallback, useEffect, useState } from 'react'

// RPC URL local de Anvil (hardcoded porque es desarrollo local)
const ANVIL_RPC_URL = 'http://127.0.0.1:8545'

// ============================================================================
// TYPES
// ============================================================================

export enum UserStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
  Canceled = 3,
}

export enum UserRole {
  Producer = 0,
  Factory = 1,
  Retailer = 2,
  Consumer = 3,
}

export interface User {
  id: bigint
  userAddress: string
  role: bigint
  status: bigint
}

// ============================================================================
// HOOK: useChangeUserStatus
// ============================================================================

/**
 * Hook para cambiar el estado de un usuario (solo owner)
 * 
 * Estados disponibles:
 * - Pending (0): Usuario pendiente de aprobación
 * - Approved (1): Usuario aprobado
 * - Rejected (2): Usuario rechazado
 * - Canceled (3): Usuario cancelado
 * 
 * Flujo de estados:
 * - Pending → Approved o Rejected
 * - Approved → Canceled
 * - Canceled → Pending (reactivación)
 * - Rejected → Usuario debe re-registrarse
 */
export function useChangeUserStatus() {
  const { data: hash, writeContract, isPending, error } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const changeStatus = useCallback((userAddress: string, newStatus: UserStatus) => {
    writeContract({
      address: SUPPLY_CHAIN_ADDRESS as `0x${string}`,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'changeStatusUser',
      args: [userAddress as `0x${string}`, newStatus],
    })
  }, [writeContract])

  return {
    changeStatus,
    isPending,
    isConfirming,
    isSuccess,
    error,
    hash,
  }
}

// ============================================================================
// HOOK: useGetAllUsers
// ============================================================================

/**
 * Hook para obtener todos los usuarios registrados en el sistema
 * 
 * Itera desde userId=1 hasta nextUserId-1 y obtiene la información de cada usuario
 * 
 * @returns Array de usuarios con sus datos completos
 */
export function useGetAllUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  // Obtener el total de usuarios (nextUserId - 1)
  const { data: nextUserId, isLoading: isLoadingTotal, refetch: refetchTotal } = useReadContract({
    address: SUPPLY_CHAIN_ADDRESS as `0x${string}`,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'nextUserId',
  })

  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!nextUserId || isLoadingTotal) return

      try {
        setIsLoading(true)
        setError(null)

        const totalUsers = Number(nextUserId) - 1 // nextUserId empieza en 1
        
        if (totalUsers === 0) {
          setUsers([])
          setIsLoading(false)
          return
        }

        const userPromises: Promise<User | null>[] = []

        // Usar RPC directo para obtener cada usuario
        for (let userId = 1; userId <= totalUsers; userId++) {
          const promise = (async () => {
            try {
              const response = await fetch(ANVIL_RPC_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  jsonrpc: '2.0',
                  method: 'eth_call',
                  params: [
                    {
                      to: SUPPLY_CHAIN_ADDRESS,
                      data: (() => {
                        // Selector: keccak256('getUserInfoById(uint256)').slice(0,4) = 0x31f01140
                        const selector = '0x31f01140'
                        const paddedId = userId.toString(16).padStart(64, '0')
                        return selector + paddedId
                      })()
                    },
                    'latest'
                  ],
                  id: userId,
                }),
              })

              const data = await response.json()
              
              if (!data.result || data.result === '0x' || data.error) {
                console.warn(`No data for userId ${userId}:`, data)
                return null
              }

              // Decodificar respuesta (estructura User: id, address, role, status)
              // Cada campo uint256/address ocupa 32 bytes (64 hex chars)
              const result = data.result.slice(2) // Quitar '0x'
              
              // Campo 1: id (uint256) - bytes 0-31
              const id = BigInt('0x' + result.slice(0, 64))
              
              // Campo 2: userAddress (address) - bytes 32-63 (últimos 20 bytes = 40 hex chars)
              const userAddress = '0x' + result.slice(64 + 24, 64 + 64)
              
              // Campo 3: role (uint8 pero padded a 32 bytes) - bytes 64-95
              const role = BigInt('0x' + result.slice(128, 192))
              
              // Campo 4: status (uint8 pero padded a 32 bytes) - bytes 96-127
              const status = BigInt('0x' + result.slice(192, 256))

              return { id, userAddress, role, status }
            } catch (err) {
              console.error(`Error fetching user ${userId}:`, err)
              return null
            }
          })()

          userPromises.push(promise)
        }

        const results = await Promise.all(userPromises)
        const validUsers = results.filter((user): user is User => user !== null)
        
        console.log(`✅ Loaded ${validUsers.length} users out of ${totalUsers}`, validUsers)
        setUsers(validUsers)
      } catch (err) {
        setError(err as Error)
        console.error('Error fetching users:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllUsers()
  }, [nextUserId, isLoadingTotal, refetchTrigger])

  return {
    users,
    isLoading: isLoading || isLoadingTotal,
    error,
    refetch: () => {
      refetchTotal()
      setRefetchTrigger(prev => prev + 1)
    }
  }
}

// ============================================================================
// HOOK: useUserStats
// ============================================================================

/**
 * Hook para obtener estadísticas de usuarios por estado
 * 
 * @returns Contadores de usuarios: total, pending, approved, rejected, canceled
 */
export function useUserStats() {
  const { users, isLoading } = useGetAllUsers()

  const stats = {
    total: users.length,
    pending: users.filter(u => Number(u.status) === UserStatus.Pending).length,
    approved: users.filter(u => Number(u.status) === UserStatus.Approved).length,
    rejected: users.filter(u => Number(u.status) === UserStatus.Rejected).length,
    canceled: users.filter(u => Number(u.status) === UserStatus.Canceled).length,
  }

  return { stats, isLoading }
}
