'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useAccount, useDisconnect, useConnect } from 'wagmi'

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
  const [wasConnected, setWasConnected] = useState(false)

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

  // 1.5. CRÍTICO: Deshabilitar auto-connect si no hay conexión guardada
  // Este efecto verifica si wagmi auto-conectó sin permiso del usuario
  const [hasCheckedAutoConnect, setHasCheckedAutoConnect] = useState(false)
  
  useEffect(() => {
    if (typeof window === 'undefined' || hasCheckedAutoConnect) return

    // Esperar un momento para que wagmi termine de inicializar y verificar
    const checkAutoConnect = setTimeout(() => {
      const stored = localStorage.getItem('lastConnectedAddress')
      
      // Si no hay conexión guardada Y está conectado, es un auto-connect no deseado
      // Desconectar inmediatamente para forzar que el usuario se conecte manualmente
      if (!stored && isConnected) {
        console.log('🚫 Auto-connect detected without stored connection, disconnecting...')
        disconnect()
        localStorage.removeItem('lastConnectedAddress')
      }
      
      setHasCheckedAutoConnect(true)
    }, 200) // Dar tiempo suficiente para que wagmi inicialice

    return () => clearTimeout(checkAutoConnect)
  }, [isConnected, disconnect, hasCheckedAutoConnect]) // Ejecutar cuando isConnected cambia, pero solo una vez

  // 2. Persistencia: Guardar address cuando se conecta
  useEffect(() => {
    if (!isInitialized) return

    const timer = setTimeout(() => {
      if (isConnected && address) {
        localStorage.setItem('lastConnectedAddress', address)
        setLastConnectedAddress(address)
        setWasConnected(true)  // Marcar que estuvo conectado
      } else if (!isConnected && wasConnected) {
        // Solo limpiar si ESTUVO conectado antes en ESTA pestaña
        // (Evita limpiar cuando es pestaña nueva cargando por primera vez)
        localStorage.removeItem('lastConnectedAddress')
        setLastConnectedAddress(null)
        setWasConnected(false)
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [isConnected, address, isInitialized, wasConnected])

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

  // 5. SINCRONIZACIÓN MULTI-PESTAÑA: Solo detectar desconexiones
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      // Solo reaccionar a cambios de lastConnectedAddress
      if (e.key !== 'lastConnectedAddress') return

      console.log('📡 Storage changed in another tab:', {
        key: e.key,
        oldValue: e.oldValue,
        newValue: e.newValue
      })

      // Desconexión en otra pestaña SOLO si había un valor anterior
      if (!e.newValue && e.oldValue && isConnected) {
        console.log('❌ Disconnection detected in another tab, disconnecting here too...')
        disconnect()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [isConnected, disconnect])

  return (
    <Web3Context.Provider value={{ isInitialized, lastConnectedAddress }}>
      {children}
    </Web3Context.Provider>
  )
}
