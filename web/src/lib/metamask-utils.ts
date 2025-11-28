import React from 'react'

/**
 * Utilidades para verificar el estado real de MetaMask
 * Esto es necesario porque wagmi puede reportar isConnected=true
 * incluso cuando MetaMask está bloqueado
 */

/**
 * Verifica si MetaMask está realmente desbloqueado y tiene cuentas disponibles
 * @returns Promise<boolean> - true si MetaMask está desbloqueado y tiene cuentas
 */
export async function isMetaMaskUnlocked(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return false
  }

  try {
    // Intentar obtener cuentas - esto fallará si MetaMask está bloqueado
    const accounts = await window.ethereum.request({ method: 'eth_accounts' })
    return Array.isArray(accounts) && accounts.length > 0
  } catch (error) {
    // Si hay error, MetaMask está bloqueado o no hay cuentas
    console.log('🔒 MetaMask is locked or no accounts available:', error)
    return false
  }
}

/**
 * Hook helper para verificar el estado real de MetaMask
 * Úsalo junto con useAccount() para verificar que la conexión sea real
 */
export function useRealConnectionState() {
  const [isReallyConnected, setIsReallyConnected] = React.useState(false)
  const [isChecking, setIsChecking] = React.useState(true)

  React.useEffect(() => {
    let mounted = true

    const checkConnection = async () => {
      setIsChecking(true)
      const unlocked = await isMetaMaskUnlocked()
      if (mounted) {
        setIsReallyConnected(unlocked)
        setIsChecking(false)
      }
    }

    checkConnection()

    // Verificar periódicamente (cada 2 segundos) para detectar cuando MetaMask se desbloquea/bloquea
    const interval = setInterval(checkConnection, 2000)

    // Escuchar eventos de MetaMask
    if (window.ethereum) {
      const handleAccountsChanged = () => {
        checkConnection()
      }
      window.ethereum.on('accountsChanged', handleAccountsChanged)

      return () => {
        mounted = false
        clearInterval(interval)
        window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      }
    }

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  return { isReallyConnected, isChecking }
}

