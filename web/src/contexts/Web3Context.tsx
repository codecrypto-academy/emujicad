'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAccount, useDisconnect } from 'wagmi'

interface Web3ContextType {
  isInitialized: boolean
  lastConnectedAddress: string | null
}

const Web3Context = createContext<Web3ContextType>({
  isInitialized: false,
  lastConnectedAddress: null,
})

export function useWeb3Context() {
  return useContext(Web3Context)
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [isInitialized, setIsInitialized] = useState(false)
  const [lastConnectedAddress, setLastConnectedAddress] = useState<string | null>(null)

  // 1. Inicializar: Cargar último address de localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return

    const timer = setTimeout(() => {
      const stored = localStorage.getItem('lastConnectedAddress')
      if (stored) {
        setLastConnectedAddress(stored)
      }
      setIsInitialized(true)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  // 2. Persistencia: Guardar address cuando se conecta
  useEffect(() => {
    if (!isInitialized) return

    const timer = setTimeout(() => {
      if (isConnected && address) {
        localStorage.setItem('lastConnectedAddress', address)
        setLastConnectedAddress(address)
      } else {
        // Desconectado: limpiar localStorage
        localStorage.removeItem('lastConnectedAddress')
        setLastConnectedAddress(null)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [isConnected, address, isInitialized])

  // 3. Detección de cambio de cuenta: Desconectar si cambia
  useEffect(() => {
    if (!isInitialized || !isConnected) return

    const stored = localStorage.getItem('lastConnectedAddress')
    if (stored && address && stored.toLowerCase() !== address.toLowerCase()) {
      console.log('🔄 Account changed detected, disconnecting...')
      disconnect()
      localStorage.removeItem('lastConnectedAddress')
    }
  }, [address, isConnected, disconnect, isInitialized])

  // 4. Listener de eventos de MetaMask
  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      console.log('🔄 MetaMask accounts changed:', accounts)
      
      if (accounts.length === 0) {
        // Usuario desconectó desde MetaMask
        console.log('❌ No accounts, clearing localStorage')
        localStorage.removeItem('lastConnectedAddress')
        disconnect()
      } else if (address && accounts[0].toLowerCase() !== address.toLowerCase()) {
        // Cambió de cuenta en MetaMask
        console.log('🔄 Account switched, reconnecting...')
        localStorage.setItem('lastConnectedAddress', accounts[0])
        // La reconexión se maneja automáticamente por wagmi
      }
    }

    const handleChainChanged = () => {
      console.log('⛓️ Chain changed, reloading...')
      window.location.reload()
    }

    const handleDisconnect = () => {
      console.log('❌ Disconnected from MetaMask')
      localStorage.removeItem('lastConnectedAddress')
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)
    window.ethereum.on('chainChanged', handleChainChanged)
    window.ethereum.on('disconnect', handleDisconnect)

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
      window.ethereum?.removeListener('chainChanged', handleChainChanged)
      window.ethereum?.removeListener('disconnect', handleDisconnect)
    }
  }, [address, disconnect])

  return (
    <Web3Context.Provider value={{ isInitialized, lastConnectedAddress }}>
      {children}
    </Web3Context.Provider>
  )
}
