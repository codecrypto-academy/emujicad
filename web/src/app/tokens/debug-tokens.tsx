'use client'

import { useReadContract, useReadContracts } from 'wagmi'
import { SUPPLY_CHAIN_ADDRESS, SUPPLY_CHAIN_ABI } from '@/contracts/config'
import { useEffect, useState } from 'react'

/**
 * Componente de debug para verificar tokens en el contrato
 * Muestra información detallada sobre qué tokens existen
 */
export function DebugTokens() {
  const [debugInfo, setDebugInfo] = useState<any>(null)

  // Obtener total de tokens
  const { data: totalTokens, isLoading: isLoadingTotal } = useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'getTotalTokens',
  })

  // Obtener nextTokenId para verificar
  const { data: nextTokenId } = useReadContract({
    address: SUPPLY_CHAIN_ADDRESS,
    abi: SUPPLY_CHAIN_ABI,
    functionName: 'nextTokenId',
  })

  // Crear array de contratos para leer todos los tokens
  const contracts = totalTokens !== undefined && totalTokens !== null && typeof totalTokens === 'bigint' && totalTokens > 0n
    ? Array.from({ length: Number(totalTokens) }, (_, i) => ({
        address: SUPPLY_CHAIN_ADDRESS,
        abi: SUPPLY_CHAIN_ABI,
        functionName: 'getToken' as const,
        args: [BigInt(i + 1)],
      }))
    : []

  // Leer todos los tokens
  const { data: tokensData, isLoading: isLoadingTokens } = useReadContracts({
    contracts: contracts as any,
    query: {
      enabled: contracts.length > 0,
    },
  })

  useEffect(() => {
    if (!isLoadingTotal && !isLoadingTokens && tokensData) {
      const info: any = {
        totalTokens: totalTokens ? Number(totalTokens) : 0,
        nextTokenId: nextTokenId ? Number(nextTokenId) : 0,
        tokens: [],
        errors: [],
      }

      tokensData.forEach((item, index) => {
        const tokenId = index + 1
        if (item.error) {
          info.errors.push({
            tokenId,
            error: item.error.message,
          })
        } else if (item.result) {
          const result = item.result as any[]
          if (Array.isArray(result) && result.length >= 8) {
            info.tokens.push({
              tokenId,
              id: result[0]?.toString(),
              name: result[2]?.toString() || 'N/A',
              tokenType: result[3]?.toString(),
              totalSupply: result[4]?.toString(),
              creator: result[1]?.toString(),
              parentId: result[6]?.toString(),
              dateCreated: result[7]?.toString(),
            })
          }
        }
      })

      setDebugInfo(info)
    }
  }, [totalTokens, nextTokenId, tokensData, isLoadingTotal, isLoadingTokens])

  if (isLoadingTotal || isLoadingTokens) {
    return <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded">Loading debug info...</div>
  }

  if (!debugInfo) {
    return <div className="p-4 bg-gray-50 dark:bg-gray-900/20 rounded">No debug info available</div>
  }

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <h3 className="font-bold mb-2">🔍 Debug: Tokens en el Contrato</h3>
      <div className="space-y-2 text-sm">
        <div>
          <strong>Total Tokens (getTotalTokens):</strong> {debugInfo.totalTokens}
        </div>
        <div>
          <strong>nextTokenId:</strong> {debugInfo.nextTokenId}
        </div>
        <div>
          <strong>Tokens encontrados:</strong> {debugInfo.tokens.length}
        </div>
        <div>
          <strong>Errores:</strong> {debugInfo.errors.length}
        </div>

        {debugInfo.tokens.length > 0 && (
          <div className="mt-4">
            <strong>Tokens:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {debugInfo.tokens.map((token: any) => (
                <li key={token.tokenId}>
                  ID: {token.tokenId} - <strong>{token.name}</strong> (Type: {token.tokenType}, Supply: {token.totalSupply})
                </li>
              ))}
            </ul>
          </div>
        )}

        {debugInfo.errors.length > 0 && (
          <div className="mt-4">
            <strong>Errores al leer tokens:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-red-600 dark:text-red-400">
              {debugInfo.errors.map((err: any) => (
                <li key={err.tokenId}>
                  Token ID {err.tokenId}: {err.error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

