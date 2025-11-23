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
  const { data: transferIds, isLoading: isLoadingIds, error: idsError } = useReadContract({
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
  const { data: transfersData, isLoading: isLoadingTransfers, error: transfersError } = useReadContracts({
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

      // El resultado de leer un struct es una tupla (array)
      const transferTuple = transferResult.result as readonly [bigint, string, string, bigint, bigint, bigint, number] | undefined

      // Validar que la tupla tiene el formato esperado
      if (transferTuple && Array.isArray(transferTuple) && transferTuple.length === 7) {
        processedTransfers.push({
          id: transferTuple[0],
          from: transferTuple[1],
          to: transferTuple[2],
          tokenId: transferTuple[3],
          amount: transferTuple[4],
          dateCreated: transferTuple[5],
          status: transferTuple[6] as TransferStatus,
        })
      } else {
        console.warn(`[useGetUserTransfers] Datos incompletos o con formato incorrecto para transferencia ${validTransferIds[i]}:`, transferResult.result)
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

  return {
    transfers,
    isLoading,
    error,
    totalTransfers: transfers.length,
  }
}

