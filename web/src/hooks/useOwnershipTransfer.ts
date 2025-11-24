'use client'

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config'

/**
 * Hook para gestionar la transferencia de ownership del contrato
 * 
 * Este hook proporciona funciones para:
 * - Iniciar la transferencia de ownership (solo owner actual)
 * - Aceptar la transferencia de ownership (solo pendingOwner)
 * - Rechazar/cancelar la transferencia (owner actual o pendingOwner)
 * 
 * Cada función tiene su propio estado independiente para evitar conflictos.
 * 
 * @returns {
 *   // Funciones
 *   initiateOwnershipTransfer: (newOwner: `0x${string}`) => void
 *   acceptOwnershipTransfer: () => void
 *   rejectOwnershipTransfer: () => void
 *   
 *   // Estados para initiateOwnershipTransfer
 *   isPendingInitiate: boolean
 *   isConfirmingInitiate: boolean
 *   successInitiate: boolean
 *   errorInitiate: Error | null
 *   initiateHash: `0x${string}` | undefined
 *   
 *   // Estados para acceptOwnershipTransfer
 *   isPendingAccept: boolean
 *   isConfirmingAccept: boolean
 *   successAccept: boolean
 *   errorAccept: Error | null
 *   acceptHash: `0x${string}` | undefined
 *   
 *   // Estados para rejectOwnershipTransfer
 *   isPendingReject: boolean
 *   isConfirmingReject: boolean
 *   successReject: boolean
 *   errorReject: Error | null
 *   rejectHash: `0x${string}` | undefined
 * }
 * 
 * @example
 * ```tsx
 * function OwnershipTransfer() {
 *   const { 
 *     initiateOwnershipTransfer,
 *     acceptOwnershipTransfer,
 *     rejectOwnershipTransfer,
 *     isPendingInitiate,
 *     isConfirmingInitiate,
 *     successInitiate,
 *     errorInitiate
 *   } = useOwnershipTransfer()
 *   
 *   const handleInitiate = () => {
 *     initiateOwnershipTransfer('0x...')
 *   }
 *   
 *   return (
 *     <button 
 *       onClick={handleInitiate}
 *       disabled={isPendingInitiate || isConfirmingInitiate}
 *     >
 *       {isPendingInitiate ? 'Confirming...' : 'Initiate Transfer'}
 *     </button>
 *   )
 * }
 * ```
 */
export function useOwnershipTransfer() {
  // Estados separados para initiateOwnershipTransfer
  const { 
    data: initiateHash, 
    writeContract: writeInitiate, 
    isPending: isPendingInitiate, 
    error: errorInitiate 
  } = useWriteContract()

  const { 
    isLoading: isConfirmingInitiate, 
    isSuccess: successInitiate 
  } = useWaitForTransactionReceipt({ 
    hash: initiateHash 
  })

  // Estados separados para acceptOwnershipTransfer
  const { 
    data: acceptHash, 
    writeContract: writeAccept, 
    isPending: isPendingAccept, 
    error: errorAccept 
  } = useWriteContract()

  const { 
    isLoading: isConfirmingAccept, 
    isSuccess: successAccept 
  } = useWaitForTransactionReceipt({ 
    hash: acceptHash 
  })

  // Estados separados para rejectOwnershipTransfer
  const { 
    data: rejectHash, 
    writeContract: writeReject, 
    isPending: isPendingReject, 
    error: errorReject 
  } = useWriteContract()

  const { 
    isLoading: isConfirmingReject, 
    isSuccess: successReject 
  } = useWaitForTransactionReceipt({ 
    hash: rejectHash 
  })

  /**
   * Inicia la transferencia de ownership a una nueva dirección
   * Solo puede ser llamada por el owner actual
   * 
   * @param newOwner Dirección del nuevo owner candidato
   */
  const initiateOwnershipTransfer = (newOwner: `0x${string}`) => {
    writeInitiate({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'initiateOwnershipTransfer',
      args: [newOwner],
    })
  }

  /**
   * Acepta la transferencia de ownership
   * Solo puede ser llamada por el pendingOwner
   * Valida que el nuevo owner nunca haya solicitado un rol en el sistema
   */
  const acceptOwnershipTransfer = () => {
    writeAccept({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'acceptOwnershipTransfer',
      args: [],
    })
  }

  /**
   * Rechaza o cancela la transferencia de ownership
   * Puede ser llamada por:
   * - El owner actual (para cancelar una transferencia iniciada por error)
   * - El pendingOwner (para rechazar la transferencia)
   */
  const rejectOwnershipTransfer = () => {
    writeReject({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'rejectOwnershipTransfer',
      args: [],
    })
  }

  return {
    // Funciones
    initiateOwnershipTransfer,
    acceptOwnershipTransfer,
    rejectOwnershipTransfer,
    
    // Estados para initiateOwnershipTransfer
    isPendingInitiate,
    isConfirmingInitiate,
    successInitiate,
    errorInitiate,
    initiateHash,
    
    // Estados para acceptOwnershipTransfer
    isPendingAccept,
    isConfirmingAccept,
    successAccept,
    errorAccept,
    acceptHash,
    
    // Estados para rejectOwnershipTransfer
    isPendingReject,
    isConfirmingReject,
    successReject,
    errorReject,
    rejectHash,
  }
}

