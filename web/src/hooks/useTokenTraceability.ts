'use client'

import { useMemo } from 'react'
import { useGetToken } from './useGetUserTokens'
import { useGetAllTransfers } from './useGetAllTransfers'
import { useGetAllTokens } from './useGetUserTokens'
import { validateTokenDataTuple } from '@/lib/validation'
import { TransferStatus, TokenType, UserRole } from '@/contracts/config'

export interface TraceabilityStep {
  step: number
  stage: 'creation' | 'transfer'
  tokenId: bigint
  tokenName: string
  tokenType: TokenType
  role: 'Producer' | 'Factory' | 'Retailer' | 'Consumer'
  address: string
  timestamp: bigint
  amount?: bigint
  transferId?: bigint
  description: string
}

export interface TraceabilityChain {
  steps: TraceabilityStep[]
  rawMaterialTokenId?: bigint
  finishedProductTokenId?: bigint
  totalSteps: number
  startDate: bigint | null
  endDate: bigint | null
}

/**
 * Hook para construir la cadena completa de trazabilidad end-to-end
 * 
 * Rastrea desde la creación de la materia prima hasta el consumidor final,
 * mostrando todas las transferencias con timestamps y cantidades.
 * 
 * @param tokenId ID del token a rastrear (puede ser Raw Material o Finished Product)
 * @returns Cadena completa de trazabilidad con todos los pasos
 */
export function useTokenTraceability(tokenId: bigint | undefined) {
  // Obtener todas las transferencias del sistema
  const { transfers: allTransfers, isLoading: isLoadingTransfers } = useGetAllTransfers(true)
  
  // Obtener todos los tokens del sistema
  const { tokens: allTokens, isLoading: isLoadingTokens } = useGetAllTokens()
  
  // Obtener el token actual
  const { data: rawTokenData, isLoading: isLoadingToken } = useGetToken(tokenId)
  
  const tokenData = useMemo(() => {
    return rawTokenData
      ? (Array.isArray(rawTokenData)
          ? validateTokenDataTuple(rawTokenData) ?? undefined
          : undefined)
      : undefined
  }, [rawTokenData])
  
  // Construir la cadena de trazabilidad
  const traceability = useMemo((): TraceabilityChain | null => {
    if (!tokenId || !tokenData || !allTokens || !allTransfers) {
      return null
    }
    
    const steps: TraceabilityStep[] = []
    const tokenType = Number(tokenData.tokenType) as TokenType
    const isRawMaterial = tokenType === TokenType.RowMaterial
    
    let currentTokenId = tokenId
    let rawMaterialTokenId: bigint | undefined = undefined
    let finishedProductTokenId: bigint | undefined = undefined
    
    // Si es Finished Product, obtener el parent token (Raw Material)
    if (!isRawMaterial && tokenData.parentToken && tokenData.parentToken !== BigInt(0)) {
      rawMaterialTokenId = tokenData.parentToken
      finishedProductTokenId = tokenId
      currentTokenId = tokenData.parentToken
    } else if (isRawMaterial) {
      rawMaterialTokenId = tokenId
    }
    
    // Buscar el token de materia prima
    const rawMaterialToken = allTokens.find(t => t.id === currentTokenId)
    if (!rawMaterialToken) {
      return null
    }
    
    // Paso 1: Creación de la materia prima por Producer
    steps.push({
      step: 1,
      stage: 'creation',
      tokenId: rawMaterialToken.id,
      tokenName: rawMaterialToken.name,
      tokenType: TokenType.RowMaterial,
      role: 'Producer',
      address: rawMaterialToken.creator,
      timestamp: rawMaterialToken.createdAt,
      description: `Raw Material "${rawMaterialToken.name}" created by Producer`,
    })
    
    // Paso 2: Transferencia Producer → Factory
    const producerToFactoryTransfer = allTransfers.find(
      t => t.tokenId === rawMaterialToken.id && 
           t.status === TransferStatus.Accepted &&
           t.from.toLowerCase() === rawMaterialToken.creator.toLowerCase()
    )
    
    if (producerToFactoryTransfer) {
      steps.push({
        step: 2,
        stage: 'transfer',
        tokenId: rawMaterialToken.id,
        tokenName: rawMaterialToken.name,
        tokenType: TokenType.RowMaterial,
        role: 'Factory',
        address: producerToFactoryTransfer.to,
        timestamp: producerToFactoryTransfer.dateCreated,
        amount: producerToFactoryTransfer.amount,
        transferId: producerToFactoryTransfer.id,
        description: `Transferred ${producerToFactoryTransfer.amount.toString()} units to Factory`,
      })
    }
    
    // Si hay un Finished Product, agregar pasos adicionales
    if (finishedProductTokenId) {
      const finishedProductToken = allTokens.find(t => t.id === finishedProductTokenId)
      
      if (finishedProductToken) {
        // Paso 3: Creación del producto terminado por Factory
        steps.push({
          step: 3,
          stage: 'creation',
          tokenId: finishedProductToken.id,
          tokenName: finishedProductToken.name,
          tokenType: TokenType.FinishedProduct,
          role: 'Factory',
          address: finishedProductToken.creator,
          timestamp: finishedProductToken.createdAt,
          description: `Finished Product "${finishedProductToken.name}" created by Factory using Raw Material`,
        })
        
        // Paso 4: Transferencia Factory → Retailer
        const factoryToRetailerTransfer = allTransfers.find(
          t => t.tokenId === finishedProductToken.id && 
               t.status === TransferStatus.Accepted &&
               t.from.toLowerCase() === finishedProductToken.creator.toLowerCase()
        )
        
        if (factoryToRetailerTransfer) {
          steps.push({
            step: 4,
            stage: 'transfer',
            tokenId: finishedProductToken.id,
            tokenName: finishedProductToken.name,
            tokenType: TokenType.FinishedProduct,
            role: 'Retailer',
            address: factoryToRetailerTransfer.to,
            timestamp: factoryToRetailerTransfer.dateCreated,
            amount: factoryToRetailerTransfer.amount,
            transferId: factoryToRetailerTransfer.id,
            description: `Transferred ${factoryToRetailerTransfer.amount.toString()} units to Retailer`,
          })
          
          // Paso 5: Transferencia Retailer → Consumer
          const retailerToConsumerTransfer = allTransfers.find(
            t => t.tokenId === finishedProductToken.id && 
                 t.status === TransferStatus.Accepted &&
                 t.from.toLowerCase() === factoryToRetailerTransfer.to.toLowerCase()
          )
          
          if (retailerToConsumerTransfer) {
            steps.push({
              step: 5,
              stage: 'transfer',
              tokenId: finishedProductToken.id,
              tokenName: finishedProductToken.name,
              tokenType: TokenType.FinishedProduct,
              role: 'Consumer',
              address: retailerToConsumerTransfer.to,
              timestamp: retailerToConsumerTransfer.dateCreated,
              amount: retailerToConsumerTransfer.amount,
              transferId: retailerToConsumerTransfer.id,
              description: `Transferred ${retailerToConsumerTransfer.amount.toString()} units to Consumer`,
            })
          }
        }
      }
    }
    
    // Calcular estadísticas (solo fechas, sin sumar cantidades de tokens diferentes)
    const timestamps = steps.map(s => s.timestamp)
    const startDate = timestamps.length > 0 ? timestamps.reduce((min, t) => t < min ? t : min) : null
    const endDate = timestamps.length > 0 ? timestamps.reduce((max, t) => t > max ? t : max) : null
    
    return {
      steps,
      rawMaterialTokenId,
      finishedProductTokenId,
      totalSteps: steps.length,
      startDate,
      endDate,
    }
  }, [tokenId, tokenData, allTokens, allTransfers])
  
  const isLoading = isLoadingToken || isLoadingTokens || isLoadingTransfers
  
  return {
    traceability,
    isLoading,
  }
}

