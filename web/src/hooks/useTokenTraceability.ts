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
  amount?: bigint // Para transferencias: cantidad transferida
  totalSupply?: bigint // Para creaciones: cantidad total creada
  transferId?: bigint
  transferStatus?: TransferStatus // Estado de la transferencia (Accepted, Rejected, Pending)
  isSender?: boolean // true = quien transfiere, false = quien recibe
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
      totalSupply: rawMaterialToken.totalSupply,
      description: `Raw Material "${rawMaterialToken.name}" created by Producer`,
    })
    
    // Paso 2: Transferencia Producer → Factory
    // Buscar transferencias del Producer (quien creó el token)
    const producerToFactoryTransfers = allTransfers.filter(
      t => t.tokenId === rawMaterialToken.id && 
           t.from.toLowerCase() === rawMaterialToken.creator.toLowerCase()
    ).sort((a, b) => {
      // Ordenar por fecha, más reciente primero
      if (a.dateCreated > b.dateCreated) return -1
      if (a.dateCreated < b.dateCreated) return 1
      return 0
    })
    
    // Mostrar la transferencia más reciente
    if (producerToFactoryTransfers.length > 0) {
      const producerToFactoryTransfer = producerToFactoryTransfers[0]
      
      // Paso 2a: Producer transfiere (desde Producer)
      steps.push({
        step: 2,
        stage: 'transfer',
        tokenId: rawMaterialToken.id,
        tokenName: rawMaterialToken.name,
        tokenType: TokenType.RowMaterial,
        role: 'Producer',
        address: producerToFactoryTransfer.from, // Producer es quien transfiere
        timestamp: producerToFactoryTransfer.dateCreated,
        amount: producerToFactoryTransfer.amount,
        transferId: producerToFactoryTransfer.id,
        transferStatus: producerToFactoryTransfer.status,
        isSender: true, // Producer es quien envía
        description: `Producer transferred ${producerToFactoryTransfer.amount.toString()} units of Raw Material`,
      })
      
      // Paso 2b: Factory recibe (hacia Factory)
      steps.push({
        step: 3,
        stage: 'transfer',
        tokenId: rawMaterialToken.id,
        tokenName: rawMaterialToken.name,
        tokenType: TokenType.RowMaterial,
        role: 'Factory',
        address: producerToFactoryTransfer.to, // Factory es quien recibe
        timestamp: producerToFactoryTransfer.dateCreated,
        amount: producerToFactoryTransfer.amount,
        transferId: producerToFactoryTransfer.id,
        transferStatus: producerToFactoryTransfer.status,
        isSender: false, // Factory es quien recibe
        description: producerToFactoryTransfer.status === TransferStatus.Accepted
          ? `Factory received ${producerToFactoryTransfer.amount.toString()} units of Raw Material (Accepted)`
          : producerToFactoryTransfer.status === TransferStatus.Rejected
          ? `Factory rejected ${producerToFactoryTransfer.amount.toString()} units of Raw Material`
          : `Factory pending to accept ${producerToFactoryTransfer.amount.toString()} units of Raw Material`,
      })
    }
    
    // Si hay un Finished Product, agregar pasos adicionales
    if (finishedProductTokenId) {
      const finishedProductToken = allTokens.find(t => t.id === finishedProductTokenId)
      
      if (finishedProductToken) {
        // Paso 4: Creación del producto terminado por Factory
        steps.push({
          step: 4,
          stage: 'creation',
          tokenId: finishedProductToken.id,
          tokenName: finishedProductToken.name,
          tokenType: TokenType.FinishedProduct,
          role: 'Factory',
          address: finishedProductToken.creator,
          timestamp: finishedProductToken.createdAt,
          totalSupply: finishedProductToken.totalSupply,
          description: `Finished Product "${finishedProductToken.name}" created by Factory using Raw Material`,
        })
        
        // Paso 5: Transferencia Factory → Retailer
        const factoryToRetailerTransfers = allTransfers.filter(
          t => t.tokenId === finishedProductToken.id && 
               t.from.toLowerCase() === finishedProductToken.creator.toLowerCase()
        ).sort((a, b) => {
          if (a.dateCreated > b.dateCreated) return -1
          if (a.dateCreated < b.dateCreated) return 1
          return 0
        })
        
        if (factoryToRetailerTransfers.length > 0) {
          const factoryToRetailerTransfer = factoryToRetailerTransfers[0]
          
          // Paso 5a: Factory transfiere (desde Factory)
          steps.push({
            step: 5,
            stage: 'transfer',
            tokenId: finishedProductToken.id,
            tokenName: finishedProductToken.name,
            tokenType: TokenType.FinishedProduct,
            role: 'Factory',
            address: factoryToRetailerTransfer.from, // Factory es quien transfiere
            timestamp: factoryToRetailerTransfer.dateCreated,
            amount: factoryToRetailerTransfer.amount,
            transferId: factoryToRetailerTransfer.id,
            transferStatus: factoryToRetailerTransfer.status,
            isSender: true, // Factory es quien envía
            description: `Factory transferred ${factoryToRetailerTransfer.amount.toString()} units of Finished Product`,
          })
          
          // Paso 5b: Retailer recibe (hacia Retailer)
          steps.push({
            step: 6,
            stage: 'transfer',
            tokenId: finishedProductToken.id,
            tokenName: finishedProductToken.name,
            tokenType: TokenType.FinishedProduct,
            role: 'Retailer',
            address: factoryToRetailerTransfer.to, // Retailer es quien recibe
            timestamp: factoryToRetailerTransfer.dateCreated,
            amount: factoryToRetailerTransfer.amount,
            transferId: factoryToRetailerTransfer.id,
            transferStatus: factoryToRetailerTransfer.status,
            isSender: false, // Retailer es quien recibe
            description: factoryToRetailerTransfer.status === TransferStatus.Accepted
              ? `Retailer received ${factoryToRetailerTransfer.amount.toString()} units of Finished Product (Accepted)`
              : factoryToRetailerTransfer.status === TransferStatus.Rejected
              ? `Retailer rejected ${factoryToRetailerTransfer.amount.toString()} units of Finished Product`
              : `Retailer pending to accept ${factoryToRetailerTransfer.amount.toString()} units of Finished Product`,
          })
          
          // Paso 6: Transferencia Retailer → Consumer
          const retailerToConsumerTransfers = allTransfers.filter(
            t => t.tokenId === finishedProductToken.id && 
                 t.from.toLowerCase() === factoryToRetailerTransfer.to.toLowerCase()
          ).sort((a, b) => {
            if (a.dateCreated > b.dateCreated) return -1
            if (a.dateCreated < b.dateCreated) return 1
            return 0
          })
          
          if (retailerToConsumerTransfers.length > 0) {
            const retailerToConsumerTransfer = retailerToConsumerTransfers[0]
            
            // Paso 6a: Retailer transfiere (desde Retailer)
            steps.push({
              step: 7,
              stage: 'transfer',
              tokenId: finishedProductToken.id,
              tokenName: finishedProductToken.name,
              tokenType: TokenType.FinishedProduct,
              role: 'Retailer',
              address: retailerToConsumerTransfer.from, // Retailer es quien transfiere
              timestamp: retailerToConsumerTransfer.dateCreated,
              amount: retailerToConsumerTransfer.amount,
              transferId: retailerToConsumerTransfer.id,
              transferStatus: retailerToConsumerTransfer.status,
              isSender: true, // Retailer es quien envía
              description: `Retailer transferred ${retailerToConsumerTransfer.amount.toString()} units of Finished Product`,
            })
            
            // Paso 6b: Consumer recibe (hacia Consumer)
            steps.push({
              step: 8,
              stage: 'transfer',
              tokenId: finishedProductToken.id,
              tokenName: finishedProductToken.name,
              tokenType: TokenType.FinishedProduct,
              role: 'Consumer',
              address: retailerToConsumerTransfer.to, // Consumer es quien recibe
              timestamp: retailerToConsumerTransfer.dateCreated,
              amount: retailerToConsumerTransfer.amount,
              transferId: retailerToConsumerTransfer.id,
              transferStatus: retailerToConsumerTransfer.status,
              isSender: false, // Consumer es quien recibe
              description: retailerToConsumerTransfer.status === TransferStatus.Accepted
                ? `Consumer received ${retailerToConsumerTransfer.amount.toString()} units of Finished Product (Accepted)`
                : retailerToConsumerTransfer.status === TransferStatus.Rejected
                ? `Consumer rejected ${retailerToConsumerTransfer.amount.toString()} units of Finished Product`
                : `Consumer pending to accept ${retailerToConsumerTransfer.amount.toString()} units of Finished Product`,
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

