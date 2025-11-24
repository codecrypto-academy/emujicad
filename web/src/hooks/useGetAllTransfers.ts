'use client'

import { useReadContract, useReadContracts } from 'wagmi'
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
 * Hook para obtener todas las transferencias del sistema
 * 
 * Obtiene el total de transferencias y luego hace batch reads para obtener
 * los datos completos de cada transferencia.
 * 
 * @param enabled Si está habilitado para ejecutar las consultas
 * @returns Array de transferencias con datos completos, estado de carga y errores
 * 
 * @example
 * ```tsx
 * const { transfers, isLoading, error } = useGetAllTransfers(true)
 * ```
 */
export function useGetAllTransfers(enabled: boolean = true) {
  // Paso 1: Obtener el total de transferencias
  const { data: totalTransfers, isLoading: isLoadingTotal, error: totalError } = useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'getTotalTransfers',
    query: {
      enabled,
      refetchInterval: enabled ? 5000 : false,
    },
  })

  // Convertir total a número
  const total = useMemo(() => {
    if (!totalTransfers) return 0
    return Number(totalTransfers)
  }, [totalTransfers])

  // Paso 2: Crear array de IDs de transferencias (desde 1 hasta total)
  const transferIds = useMemo(() => {
    if (total === 0) return []
    return Array.from({ length: total }, (_, i) => BigInt(i + 1))
  }, [total])

  // Paso 3: Crear array de contratos para batch read de getTransfer
  const contracts = useMemo(() => {
    if (!transferIds || transferIds.length === 0) {
      return []
    }

    return transferIds.map(transferId => ({
      address: SUPPLY_CHAIN_ADDRESS,
      abi: SUPPLY_CHAIN_ABI,
      functionName: 'getTransfer' as const,
      args: [transferId],
    }))
  }, [transferIds])

  // Paso 4: Batch read de todas las transferencias
  const { data: transfersData, isLoading: isLoadingTransfers, error: transfersError } = useReadContracts({
    contracts: contracts as any,
    query: {
      enabled: enabled && contracts.length > 0,
      refetchInterval: enabled ? 5000 : false,
    },
  })

  // Paso 5: Procesar y validar los datos de transferencias
  const transfers = useMemo(() => {
    if (!transfersData || transfersData.length === 0) {
      return []
    }

    const processedTransfers: TransferData[] = []

    for (let i = 0; i < transfersData.length; i++) {
      const transferResult = transfersData[i]
      
      if (transferResult.error) {
        console.warn(`[useGetAllTransfers] Error al obtener transferencia ${transferIds[i]}:`, transferResult.error)
        continue
      }

      // Wagmi decodifica los structs como objetos con propiedades nombradas
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
          }
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
        }
      }
    }

    // Ordenar por fecha de creación (más recientes primero)
    return processedTransfers.sort((a, b) => {
      if (a.dateCreated > b.dateCreated) return -1
      if (a.dateCreated < b.dateCreated) return 1
      return 0
    })
  }, [transfersData, transferIds])

  const isLoading = isLoadingTotal || isLoadingTransfers
  const error: Error | null = totalError || transfersError || null

  return {
    transfers,
    isLoading,
    error,
    total: transfers.length,
  }
}

