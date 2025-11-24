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
  tree?: TransferTree // Árbol de transferencias
  rawMaterialTokenId?: bigint
  finishedProductTokenId?: bigint
  totalSteps: number
  startDate: bigint | null
  endDate: bigint | null
}

// Estructura de árbol para visualización
export interface TransferTreeNode {
  address: string
  role: 'Producer' | 'Factory' | 'Retailer' | 'Consumer'
  tokenId: bigint
  tokenName: string
  tokenType: TokenType
  timestamp: bigint
  amount?: bigint // Cantidad recibida o transferida
  totalSupply?: bigint // Para creación
  transferId?: bigint
  transferStatus?: TransferStatus
  isCreation?: boolean // true si es creación del token
  children: TransferTreeNode[] // Transferencias salientes
  parent?: TransferTreeNode // Nodo padre (quien transfirió a este)
}

export interface TransferTree {
  root: TransferTreeNode // Nodo raíz (creador del token)
  allNodes: Map<string, TransferTreeNode[]> // Mapa de address -> nodos (puede haber múltiples nodos con misma address)
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
    
    // Obtener TODAS las transferencias del Raw Material, ordenadas por fecha
    const rawMaterialTransfers = allTransfers
      .filter(t => t.tokenId === rawMaterialToken.id)
      .sort((a, b) => {
        const dateA = Number(a.dateCreated)
        const dateB = Number(b.dateCreated)
        if (dateA !== dateB) return dateA - dateB // Orden ascendente (más antiguas primero)
        return Number(a.id) - Number(b.id) // Desempate por ID
      })
    
    // Variable para Finished Product transfers (se inicializa más abajo)
    let finishedProductTransfers: typeof allTransfers = []
    
    // Agregar TODAS las transferencias del Raw Material
    rawMaterialTransfers.forEach((transfer, index) => {
      // Determinar el rol del sender basado en la dirección
      const senderRole = transfer.from.toLowerCase() === rawMaterialToken.creator.toLowerCase() 
        ? 'Producer' 
        : 'Factory'
      
      // Determinar el rol del receiver
      const receiverRole = senderRole === 'Producer' ? 'Factory' : 'Producer'
      
      // Paso: Sender transfiere
      steps.push({
        step: steps.length + 1,
        stage: 'transfer',
        tokenId: rawMaterialToken.id,
        tokenName: rawMaterialToken.name,
        tokenType: TokenType.RowMaterial,
        role: senderRole,
        address: transfer.from,
        timestamp: transfer.dateCreated,
        amount: transfer.amount,
        transferId: transfer.id,
        transferStatus: transfer.status,
        isSender: true,
        description: `${senderRole} transferred ${transfer.amount.toString()} units of Raw Material`,
      })
      
      // Paso: Receiver recibe
      steps.push({
        step: steps.length + 1,
        stage: 'transfer',
        tokenId: rawMaterialToken.id,
        tokenName: rawMaterialToken.name,
        tokenType: TokenType.RowMaterial,
        role: receiverRole,
        address: transfer.to,
        timestamp: transfer.dateCreated,
        amount: transfer.amount,
        transferId: transfer.id,
        transferStatus: transfer.status,
        isSender: false,
        description: transfer.status === TransferStatus.Accepted
          ? `${receiverRole} received ${transfer.amount.toString()} units of Raw Material (Accepted)`
          : transfer.status === TransferStatus.Rejected
          ? `${receiverRole} rejected ${transfer.amount.toString()} units of Raw Material`
          : `${receiverRole} pending to accept ${transfer.amount.toString()} units of Raw Material`,
      })
    })
    
    // Si hay un Finished Product, agregar pasos adicionales
    if (finishedProductTokenId) {
      const finishedProductToken = allTokens.find(t => t.id === finishedProductTokenId)
      
      if (finishedProductToken) {
        // Paso: Creación del producto terminado por Factory
        steps.push({
          step: steps.length + 1,
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
        
        // Obtener TODAS las transferencias del Finished Product, ordenadas por fecha
        finishedProductTransfers = allTransfers
          .filter(t => t.tokenId === finishedProductToken.id)
          .sort((a, b) => {
            const dateA = Number(a.dateCreated)
            const dateB = Number(b.dateCreated)
            if (dateA !== dateB) return dateA - dateB // Orden ascendente (más antiguas primero)
            return Number(a.id) - Number(b.id) // Desempate por ID
          })
        
        // Agregar TODAS las transferencias del Finished Product
        finishedProductTransfers.forEach((transfer) => {
          // Determinar el rol del sender basado en la dirección
          const senderRole = transfer.from.toLowerCase() === finishedProductToken.creator.toLowerCase()
            ? 'Factory'
            : allTokens.find(t => t.creator.toLowerCase() === transfer.from.toLowerCase())
              ? 'Factory'
              : 'Retailer'
          
          // Determinar el rol del receiver
          // Si el sender es Factory, el receiver es Retailer
          // Si el sender es Retailer, el receiver es Consumer
          const receiverRole = senderRole === 'Factory' ? 'Retailer' : 'Consumer'
          
          // Paso: Sender transfiere
          steps.push({
            step: steps.length + 1,
            stage: 'transfer',
            tokenId: finishedProductToken.id,
            tokenName: finishedProductToken.name,
            tokenType: TokenType.FinishedProduct,
            role: senderRole,
            address: transfer.from,
            timestamp: transfer.dateCreated,
            amount: transfer.amount,
            transferId: transfer.id,
            transferStatus: transfer.status,
            isSender: true,
            description: `${senderRole} transferred ${transfer.amount.toString()} units of Finished Product`,
          })
          
          // Paso: Receiver recibe
          steps.push({
            step: steps.length + 1,
            stage: 'transfer',
            tokenId: finishedProductToken.id,
            tokenName: finishedProductToken.name,
            tokenType: TokenType.FinishedProduct,
            role: receiverRole,
            address: transfer.to,
            timestamp: transfer.dateCreated,
            amount: transfer.amount,
            transferId: transfer.id,
            transferStatus: transfer.status,
            isSender: false,
            description: transfer.status === TransferStatus.Accepted
              ? `${receiverRole} received ${transfer.amount.toString()} units of Finished Product (Accepted)`
              : transfer.status === TransferStatus.Rejected
              ? `${receiverRole} rejected ${transfer.amount.toString()} units of Finished Product`
              : `${receiverRole} pending to accept ${transfer.amount.toString()} units of Finished Product`,
          })
        })
      }
    }
    
    // Ordenar todos los steps por timestamp (más antiguos primero)
    steps.sort((a, b) => {
      const timestampA = Number(a.timestamp)
      const timestampB = Number(b.timestamp)
      if (timestampA !== timestampB) return timestampA - timestampB
      // Si timestamps son iguales, mantener el orden relativo
      return a.step - b.step
    })
    
    // Renumerar los steps después del ordenamiento
    steps.forEach((step, index) => {
      step.step = index + 1
    })
    
    // Calcular estadísticas (solo fechas, sin sumar cantidades de tokens diferentes)
    const timestamps = steps.map(s => s.timestamp)
    const startDate = timestamps.length > 0 ? timestamps.reduce((min, t) => t < min ? t : min) : null
    const endDate = timestamps.length > 0 ? timestamps.reduce((max, t) => t > max ? t : max) : null
    
    // Construir árbol de transferencias
    const buildTransferTree = (): TransferTree | undefined => {
      // Obtener todas las transferencias del token (Raw Material y Finished Product)
      const allTokenTransfers = [
        ...rawMaterialTransfers,
        ...finishedProductTransfers
      ]
      
      // Crear nodo raíz (creador del token)
      const rootAddress = rawMaterialToken.creator.toLowerCase()
      const rootNode: TransferTreeNode = {
        address: rawMaterialToken.creator,
        role: 'Producer',
        tokenId: rawMaterialToken.id,
        tokenName: rawMaterialToken.name,
        tokenType: TokenType.RowMaterial,
        timestamp: rawMaterialToken.createdAt,
        totalSupply: rawMaterialToken.totalSupply,
        isCreation: true,
        children: [],
      }
      
      // Mapa para encontrar nodos por dirección
      const nodeMap = new Map<string, TransferTreeNode[]>()
      nodeMap.set(rootAddress, [rootNode])
      
      // Variable para almacenar el nodo de creación del Finished Product
      let finishedProductCreationNode: TransferTreeNode | null = null
      
      // Función para agregar el nodo de creación del Finished Product después de que Factory acepte
      const addFinishedProductCreationNode = () => {
        if (!finishedProductTokenId || finishedProductCreationNode) return
        
        const finishedProductToken = allTokens.find(t => t.id === finishedProductTokenId)
        if (!finishedProductToken) return
        
        // Buscar el nodo de recepción ACCEPTED de Factory para Raw Material
        const findAcceptedFactoryReceiptNode = (node: TransferTreeNode): TransferTreeNode | null => {
          // Buscar en los hijos del nodo actual
          for (const child of node.children) {
            // Si es un nodo de recepción de Factory con Raw Material y está ACCEPTED
            if (
              child.role === 'Factory' && 
              child.tokenId === rawMaterialToken.id &&
              child.transferStatus === TransferStatus.Accepted &&
              child.parent && // Es un nodo de recepción (tiene padre)
              child.parent.transferId === child.transferId // Confirma que es recepción
            ) {
              return child
            }
            // Buscar recursivamente
            const deeper = findAcceptedFactoryReceiptNode(child)
            if (deeper) return deeper
          }
          return null
        }
        
        const acceptedFactoryNode = findAcceptedFactoryReceiptNode(rootNode)
        if (!acceptedFactoryNode) return // No hay transferencia aceptada, no se puede crear Finished Product
        
        // Crear el nodo de creación del Finished Product
        finishedProductCreationNode = {
          address: finishedProductToken.creator,
          role: 'Factory',
          tokenId: finishedProductToken.id,
          tokenName: finishedProductToken.name,
          tokenType: TokenType.FinishedProduct,
          timestamp: finishedProductToken.createdAt,
          totalSupply: finishedProductToken.totalSupply,
          isCreation: true,
          children: [],
          parent: acceptedFactoryNode,
        }
        
        // Agregar al mapa
        const factoryAddress = finishedProductToken.creator.toLowerCase()
        const factoryNodes = nodeMap.get(factoryAddress) || []
        factoryNodes.push(finishedProductCreationNode)
        nodeMap.set(factoryAddress, factoryNodes)
        
        // Agregar como hijo del nodo de recepción ACCEPTED de Factory
        acceptedFactoryNode.children.push(finishedProductCreationNode)
      }
      
      // Función helper para obtener o crear nodo
      const getOrCreateNode = (
        address: string,
        role: 'Producer' | 'Factory' | 'Retailer' | 'Consumer',
        tokenId: bigint,
        tokenName: string,
        tokenType: TokenType,
        timestamp: bigint,
        amount: bigint,
        transferId: bigint,
        transferStatus: TransferStatus,
        parent: TransferTreeNode
      ): TransferTreeNode => {
        const addressKey = address.toLowerCase()
        const existingNodes = nodeMap.get(addressKey) || []
        
        // Buscar si ya existe un nodo con estos parámetros
        let node = existingNodes.find(n => 
          n.tokenId === tokenId && 
          n.transferId === transferId &&
          n.parent === parent
        )
        
        if (!node) {
          node = {
            address,
            role,
            tokenId,
            tokenName,
            tokenType,
            timestamp,
            amount,
            transferId,
            transferStatus,
            isCreation: false,
            children: [],
            parent,
          }
          existingNodes.push(node)
          nodeMap.set(addressKey, existingNodes)
        }
        
        return node
      }
      
      // Función helper para encontrar el nodo padre correcto
      const findParentNode = (fromAddress: string, tokenId: bigint): TransferTreeNode => {
        // Si es una transferencia de Finished Product y el sender es el Factory que lo creó
        if (finishedProductTokenId && tokenId === finishedProductTokenId && finishedProductCreationNode) {
          const finishedProductToken = allTokens.find(t => t.id === finishedProductTokenId)
          if (finishedProductToken && fromAddress === finishedProductToken.creator.toLowerCase()) {
            // El padre debe ser el nodo de creación del Finished Product
            return finishedProductCreationNode
          }
        }
        
        // Buscar el nodo del sender en el árbol
        const findNodeByAddressAndToken = (node: TransferTreeNode, address: string, tId: bigint): TransferTreeNode | null => {
          if (node.address.toLowerCase() === address && node.tokenId === tId) return node
          for (const child of node.children) {
            const found = findNodeByAddressAndToken(child, address, tId)
            if (found) return found
          }
          return null
        }
        
        const foundParent = findNodeByAddressAndToken(rootNode, fromAddress, tokenId)
        if (foundParent) return foundParent
        
        // Si no se encuentra, buscar en el mapa
        const parentNodes = nodeMap.get(fromAddress) || []
        if (parentNodes.length > 0) {
          // Buscar el nodo más reciente con el mismo tokenId
          const matchingNodes = parentNodes.filter(n => n.tokenId === tokenId)
          if (matchingNodes.length > 0) {
            return matchingNodes[matchingNodes.length - 1]
          }
          return parentNodes[parentNodes.length - 1]
        }
        
        return rootNode
      }
      
      // Primero procesar solo las transferencias de Raw Material
      const rawMaterialOnlyTransfers = allTokenTransfers.filter(t => t.tokenId === rawMaterialToken.id)
      rawMaterialOnlyTransfers.forEach(transfer => {
        const fromAddress = transfer.from.toLowerCase()
        const toAddress = transfer.to.toLowerCase()
        
        // Determinar roles
        const senderRole = fromAddress === rootAddress ? 'Producer' : 'Factory'
        const receiverRole = senderRole === 'Producer' ? 'Factory' : 'Retailer'
        
        const tokenName = rawMaterialToken.name
        const tokenType = TokenType.RowMaterial
        
        // Encontrar el nodo padre (quien tiene el token antes de transferir)
        let parentNode = findParentNode(fromAddress, transfer.tokenId)
        
        // Crear nodo de ENVÍO (sender transfiere)
        const senderNode = getOrCreateNode(
          transfer.from,
          senderRole,
          transfer.tokenId,
          tokenName,
          tokenType,
          transfer.dateCreated,
          transfer.amount,
          transfer.id,
          transfer.status,
          parentNode
        )
        senderNode.isCreation = false // Es una transferencia, no creación
        
        // Agregar nodo de envío como hijo del padre si no existe
        if (!parentNode.children.find(c => c === senderNode)) {
          parentNode.children.push(senderNode)
        }
        
        // Actualizar el mapa con el nodo de envío
        const senderAddressKey = fromAddress
        const senderNodes = nodeMap.get(senderAddressKey) || []
        if (!senderNodes.find(n => n === senderNode)) {
          senderNodes.push(senderNode)
          nodeMap.set(senderAddressKey, senderNodes)
        }
        
        // Crear nodo de RECEPCIÓN (receiver recibe)
        const receiverNode = getOrCreateNode(
          transfer.to,
          receiverRole,
          transfer.tokenId,
          tokenName,
          tokenType,
          transfer.dateCreated,
          transfer.amount,
          transfer.id,
          transfer.status,
          senderNode // El padre es el nodo de envío
        )
        receiverNode.isCreation = false // Es una recepción, no creación
        
        // Agregar nodo de recepción como hijo del nodo de envío
        if (!senderNode.children.find(c => c === receiverNode)) {
          senderNode.children.push(receiverNode)
        }
        
        // Actualizar el mapa con el nodo de recepción
        const receiverAddressKey = toAddress
        const receiverNodes = nodeMap.get(receiverAddressKey) || []
        if (!receiverNodes.find(n => n === receiverNode)) {
          receiverNodes.push(receiverNode)
          nodeMap.set(receiverAddressKey, receiverNodes)
        }
        
        // Si Factory aceptó Raw Material, agregar nodo de creación del Finished Product
        if (
          transfer.tokenId === rawMaterialToken.id &&
          transfer.status === TransferStatus.Accepted &&
          receiverRole === 'Factory'
        ) {
          addFinishedProductCreationNode()
        }
      })
      
      // Ahora procesar las transferencias de Finished Product
      const finishedProductOnlyTransfers = allTokenTransfers.filter(t => 
        finishedProductTokenId && t.tokenId === finishedProductTokenId
      )
      finishedProductOnlyTransfers.forEach(transfer => {
        const fromAddress = transfer.from.toLowerCase()
        const toAddress = transfer.to.toLowerCase()
        
        // Determinar roles
        const senderRole = finishedProductTokenId && transfer.tokenId === finishedProductTokenId
          ? (fromAddress === (allTokens.find(t => t.id === finishedProductTokenId)?.creator.toLowerCase() || '') ? 'Factory' : 'Retailer')
          : 'Factory'
        
        const receiverRole = senderRole === 'Factory'
          ? 'Retailer'
          : 'Consumer'
        
        const finishedProductToken = finishedProductTokenId ? allTokens.find(t => t.id === finishedProductTokenId) : null
        const tokenName = finishedProductToken?.name || ''
        const tokenType = TokenType.FinishedProduct
        
        // Encontrar el nodo padre correcto
        let parentNode: TransferTreeNode
        
        // Si el sender es el Factory que creó el Finished Product
        if (finishedProductTokenId && transfer.tokenId === finishedProductTokenId && finishedProductCreationNode) {
          const finishedProductToken = allTokens.find(t => t.id === finishedProductTokenId)
          if (finishedProductToken && fromAddress === finishedProductToken.creator.toLowerCase()) {
            // El padre debe ser el nodo de creación del Finished Product
            parentNode = finishedProductCreationNode
          } else {
            // Buscar el nodo del sender en el árbol
            parentNode = findParentNode(fromAddress, transfer.tokenId)
          }
        } else {
          parentNode = findParentNode(fromAddress, transfer.tokenId)
        }
        
        // Crear nodo de ENVÍO (sender transfiere)
        const senderNode = getOrCreateNode(
          transfer.from,
          senderRole,
          transfer.tokenId,
          tokenName,
          tokenType,
          transfer.dateCreated,
          transfer.amount,
          transfer.id,
          transfer.status,
          parentNode
        )
        senderNode.isCreation = false // Es una transferencia, no creación
        
        // Agregar nodo de envío como hijo del padre si no existe
        if (!parentNode.children.find(c => c === senderNode)) {
          parentNode.children.push(senderNode)
        }
        
        // Actualizar el mapa con el nodo de envío
        const senderAddressKey = fromAddress
        const senderNodes = nodeMap.get(senderAddressKey) || []
        if (!senderNodes.find(n => n === senderNode)) {
          senderNodes.push(senderNode)
          nodeMap.set(senderAddressKey, senderNodes)
        }
        
        // Crear nodo de RECEPCIÓN (receiver recibe)
        const receiverNode = getOrCreateNode(
          transfer.to,
          receiverRole,
          transfer.tokenId,
          tokenName,
          tokenType,
          transfer.dateCreated,
          transfer.amount,
          transfer.id,
          transfer.status,
          senderNode // El padre es el nodo de envío
        )
        receiverNode.isCreation = false // Es una recepción, no creación
        
        // Agregar nodo de recepción como hijo del nodo de envío
        if (!senderNode.children.find(c => c === receiverNode)) {
          senderNode.children.push(receiverNode)
        }
        
        // Actualizar el mapa con el nodo de recepción
        const receiverAddressKey = toAddress
        const receiverNodes = nodeMap.get(receiverAddressKey) || []
        if (!receiverNodes.find(n => n === receiverNode)) {
          receiverNodes.push(receiverNode)
          nodeMap.set(receiverAddressKey, receiverNodes)
        }
      })
      
      return {
        root: rootNode,
        allNodes: nodeMap,
      }
    }
    
    const tree = buildTransferTree()
    
    return {
      steps,
      tree,
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

