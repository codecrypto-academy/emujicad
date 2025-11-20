import { useReadContract } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config'

/**
 * Hook para obtener la dirección del owner/admin del contrato
 * Lee dinámicamente desde el contrato (no hardcodeado)
 * 
 * @returns {
 *   owner: string | undefined - Dirección del owner
 *   isLoading: boolean - Estado de carga
 *   error: Error | null - Error si falla
 * }
 * 
 * @example
 * ```tsx
 * function AdminPanel() {
 *   const { owner, isLoading } = useContractOwner()
 *   const { address } = useAccount()
 *   
 *   const isAdmin = address && owner && address.toLowerCase() === owner.toLowerCase()
 *   
 *   if (isAdmin) {
 *     return <div>Welcome Admin!</div>
 *   }
 * }
 * ```
 */
export function useContractOwner() {
  const { data: owner, isLoading, error } = useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'owner',
  })

  return {
    owner: owner as string | undefined,
    isLoading,
    error,
  }
}
