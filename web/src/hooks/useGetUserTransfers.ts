'use client'

import { useReadContract, useReadContracts, useAccount } from 'wagmi'
import { useMemo } from 'react'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI, TransferStatus } from '@/contracts/config'
import { validateBigIntArray } from '@/lib/validation'

/**
 * Tipo para datos de una transferencia
 */
export interface TransferData {
  id: bigint
  from: string
  to: string
  tokenId: bigint
  amount: bigint
  dateCreated: bigint
  status: TransferStatus
}

/**
 * Hook para obtener todas las transferencias de un usuario
 * 
 * Obtiene los IDs de transferencias del usuario (como remitente o destinatario)
 * y luego hace batch reads para obtener los datos completos de cada transferencia.
 * 
 * @param userAddress Dirección del usuario (opcional, usa la wallet conectada si no se proporciona)
 * @returns Array de transferencias con datos completos, estado de carga y errores
 * 
 * @example
 * ```tsx
 * const { transfers, isLoading, error } = useGetUserTransfers()
 * ```
 */
export function useGetUserTransfers(userAddress?: `0x${string}`) {
  const { address: connectedAddress } = useAccount()
  const addressToUse = userAddress || connectedAddress

  // Paso 1: Obtener los IDs de transferencias del usuario
  const { data: transferIds, isLoading: isLoadingIds, error: idsError, refetch: refetchIds } = useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'getUserTransfers',
    args: addressToUse ? [addressToUse] : undefined,
    query: {
      enabled: !!addressToUse,
      refetchInterval: 5000, // Refetch cada 5 segundos
    },
  })

  // Validar y convertir los IDs a array de bigint
  const validTransferIds = useMemo(() => {
    return validateBigIntArray(transferIds) || []
  }, [transferIds])

  // Paso 2: Crear array de contratos para batch read de getTransfer
  const contracts = useMemo(() => {
    if (!validTransferIds || validTransferIds.length === 0) {
      return []
    }

    return validTransferIds.map(transferId => ({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'getTransfer' as const,
      args: [transferId],
    }))
  }, [validTransferIds])

  // Paso 3: Batch read de todas las transferencias
  const { data: transfersData, isLoading: isLoadingTransfers, error: transfersError, refetch: refetchTransfers } = useReadContracts({
    contracts: contracts as any,
    query: {
      enabled: contracts.length > 0,
      refetchInterval: 5000, // Refetch cada 5 segundos
    },
  })

  // Paso 4: Procesar y validar los datos de transferencias
  const transfers = useMemo(() => {
    if (!transfersData || transfersData.length === 0) {
      return []
    }

    const processedTransfers: TransferData[] = []

    for (let i = 0; i < transfersData.length; i++) {
      const transferResult = transfersData[i]
      
      if (transferResult.error) {
        console.warn(`[useGetUserTransfers] Error al obtener transferencia ${validTransferIds[i]}:`, transferResult.error)
        continue
      }

      // Wagmi decodifica los structs como objetos con propiedades nombradas, no como arrays
      const transferData = transferResult.result as {
        id?: bigint
        from?: string
        to?: string
        tokenId?: bigint
        dateCreated?: bigint
        amount?: bigint
        status?: number | bigint
      } | undefined

      // También puede venir como array en algunos casos
      const transferArray = Array.isArray(transferResult.result) 
        ? transferResult.result as readonly [bigint, string, string, bigint, bigint, bigint, number]
        : null

      // Intentar decodificar como objeto primero (formato más común en wagmi)
      if (transferData && typeof transferData === 'object' && !Array.isArray(transferData)) {
        const id = transferData.id
        const from = transferData.from
        const to = transferData.to
        const tokenId = transferData.tokenId
        const dateCreated = transferData.dateCreated
        const amount = transferData.amount
        const statusValue = transferData.status !== undefined ? Number(transferData.status) : undefined

        if (id !== undefined && from !== undefined && to !== undefined && 
            tokenId !== undefined && dateCreated !== undefined && 
            amount !== undefined && statusValue !== undefined) {
          
          // Validar que el status esté en el rango válido (0-3)
          if (statusValue >= 0 && statusValue <= 3) {
            const status = statusValue as TransferStatus
            
            processedTransfers.push({
              id,
              from,
              to,
              tokenId,
              dateCreated,
              amount,
              status,
            })
            
            console.log(`[useGetUserTransfers] ✅ Transfer ${validTransferIds[i]} decoded (object):`, {
              id: id.toString(),
              from,
              to,
              tokenId: tokenId.toString(),
              amount: amount.toString(),
              dateCreated: dateCreated.toString(),
              status: statusValue,
              statusName: ['Pending', 'Accepted', 'Rejected', 'Cancelled'][statusValue] || 'Unknown'
            })
          } else {
            console.warn(`[useGetUserTransfers] ⚠️ Status inválido para transferencia ${validTransferIds[i]}:`, statusValue)
          }
        } else {
          console.warn(`[useGetUserTransfers] ⚠️ Datos incompletos (objeto) para transferencia ${validTransferIds[i]}:`, transferData)
        }
      }
      // Si no es objeto, intentar como array (formato tupla)
      else if (transferArray && Array.isArray(transferArray) && transferArray.length === 7) {
        const statusValue = Number(transferArray[6])
        const status = statusValue as TransferStatus
        
        // Validar que el status esté en el rango válido (0-3)
        if (statusValue >= 0 && statusValue <= 3) {
          // Orden según struct Transfer: id, from, to, tokenId, dateCreated, amount, status
          processedTransfers.push({
            id: transferArray[0],
            from: transferArray[1],
            to: transferArray[2],
            tokenId: transferArray[3],
            dateCreated: transferArray[4],
            amount: transferArray[5],
            status,
          })
          
          console.log(`[useGetUserTransfers] ✅ Transfer ${validTransferIds[i]} decoded (array):`, {
            id: transferArray[0].toString(),
            from: transferArray[1],
            to: transferArray[2],
            tokenId: transferArray[3].toString(),
            amount: transferArray[5].toString(),
            dateCreated: transferArray[4].toString(),
            status: statusValue,
            statusName: ['Pending', 'Accepted', 'Rejected', 'Cancelled'][statusValue] || 'Unknown'
          })
        } else {
          console.warn(`[useGetUserTransfers] ⚠️ Status inválido para transferencia ${validTransferIds[i]}:`, statusValue)
        }
      } else {
        console.warn(`[useGetUserTransfers] ⚠️ Formato desconocido para transferencia ${validTransferIds[i]}:`, {
          result: transferResult.result,
          type: typeof transferResult.result,
          isArray: Array.isArray(transferResult.result),
          keys: transferResult.result && typeof transferResult.result === 'object' ? Object.keys(transferResult.result) : 'N/A'
        })
      }
    }

    // Ordenar por fecha de creación (más recientes primero)
    return processedTransfers.sort((a, b) => {
      if (a.dateCreated > b.dateCreated) return -1
      if (a.dateCreated < b.dateCreated) return 1
      return 0
    })
  }, [transfersData, validTransferIds])

  const isLoading = isLoadingIds || isLoadingTransfers
  const error: Error | null = idsError || transfersError || null

  // Función para forzar refetch de todas las transferencias
  const refetch = async () => {
    console.log('[useGetUserTransfers] 🔄 Forcing refetch...')
    try {
      const idsResult = await refetchIds()
      console.log('[useGetUserTransfers] ✅ Refetched IDs:', idsResult)
      // Esperar un poco para que los nuevos IDs estén disponibles antes de refetch de transfers
      setTimeout(async () => {
        const transfersResult = await refetchTransfers()
        console.log('[useGetUserTransfers] ✅ Refetched transfers:', transfersResult)
      }, 1000) // Aumentar a 1 segundo para dar más tiempo
    } catch (error) {
      console.error('[useGetUserTransfers] ❌ Error during refetch:', error)
    }
  }

  return {
    transfers,
    isLoading,
    error,
    totalTransfers: transfers.length,
    refetch,
  }
}

