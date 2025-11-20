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
  const { connect, connectors } = useConnect()
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

  // 5. 🆕 SINCRONIZACIÓN MULTI-PESTAÑA: Detectar cambios de localStorage en otras pestañas
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = async (e: StorageEvent) => {
      // Solo reaccionar a cambios de lastConnectedAddress
      if (e.key !== 'lastConnectedAddress') return

      console.log('📡 Storage changed in another tab:', {
        key: e.key,
        oldValue: e.oldValue,
        newValue: e.newValue
      })

      // Nueva dirección conectada en otra pestaña → Reconectar silenciosamente
      if (e.newValue && !isConnected) {
        console.log('✅ New connection detected in another tab, reconnecting silently...')
        
        // Esperar a que MetaMask esté disponible (si no lo está aún)
        let attempts = 0
        const maxAttempts = 10
        
        const waitForMetaMask = async () => {
          while (!window.ethereum && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100))
            attempts++
          }
          return window.ethereum !== undefined
        }

        const hasMetaMask = await waitForMetaMask()
        
        if (hasMetaMask) {
          // Buscar el conector correcto (injected o metaMask)
          const injectedConnector = connectors.find(c => 
            c.id === 'injected' || c.name === 'MetaMask' || c.id === 'io.metamask'
          )
          
          if (injectedConnector) {
            try {
              console.log('🔌 Attempting silent reconnection with connector:', injectedConnector.name)
              await connect({ connector: injectedConnector })
              console.log('✅ Silent reconnection successful')
            } catch (error) {
              console.error('❌ Silent reconnection failed:', error)
              // Fallback: recargar página
              window.location.reload()
            }
          } else {
            console.warn('⚠️ No injected connector found, reloading page...')
            window.location.reload()
          }
        } else {
          console.warn('⚠️ MetaMask not detected after waiting, reloading page...')
          window.location.reload()
        }
      }
      
      // Desconexión en otra pestaña SOLO si había un valor anterior
      // (Evita desconectar cuando se abre una nueva pestaña sin MetaMask)
      if (!e.newValue && e.oldValue && isConnected) {
        console.log('❌ Disconnection detected in another tab, disconnecting here too...')
        disconnect()
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [isConnected, disconnect, connect, connectors])

  return (
    <Web3Context.Provider value={{ isInitialized, lastConnectedAddress }}>
      {children}
    </Web3Context.Provider>
  )
}
