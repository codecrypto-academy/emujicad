'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const [mounted, setMounted] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  // Evitar hydration mismatch - usar useEffect sin setState directo
  useEffect(() => {
    // Usar timeout para evitar "cascading renders"
    const timer = setTimeout(() => setMounted(true), 0)
    return () => clearTimeout(timer)
  }, [])

  // Detectar MetaMask después de montar el componente
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return

    // Verificar si MetaMask ya está disponible
    const checkMetaMask = () => {
      const isInstalled = window.ethereum?.isMetaMask === true
      setIsMetaMaskInstalled(isInstalled)
    }

    // Verificar inmediatamente
    checkMetaMask()

    // Verificar de nuevo después de 100ms (por si MetaMask tarda en inyectarse)
    const timer = setTimeout(checkMetaMask, 100)

    // Escuchar evento de MetaMask (por si se instala después)
    window.addEventListener('ethereum#initialized', checkMetaMask)

    return () => {
      clearTimeout(timer)
      window.removeEventListener('ethereum#initialized', checkMetaMask)
    }
  }, [mounted])

  // Detectar wallets disponibles y eliminar duplicados
  // Si hay 'injected' Y 'MetaMask', solo mostrar 'injected' (es MetaMask)
  const availableConnectors = mounted ? (() => {
    const hasInjected = connectors.some(c => c.id === 'injected')
    const hasMetaMask = connectors.some(c => c.name === 'MetaMask')
    
    // Si hay ambos, filtrar 'MetaMask' y dejar solo 'injected'
    if (hasInjected && hasMetaMask) {
      return connectors.filter(c => c.name !== 'MetaMask')
    }
    return connectors
  })() : []
  
  const hasWallets = availableConnectors.length > 0

  // Top 5 wallets recomendadas - excluir las ya instaladas
  const allRecommendedWallets = [
    { name: 'MetaMask', url: 'https://metamask.io/download/', icon: '🦊' },
    { name: 'Coinbase Wallet', url: 'https://www.coinbase.com/wallet', icon: '💙' },
    { name: 'Trust Wallet', url: 'https://trustwallet.com/', icon: '🛡️' },
    { name: 'Rainbow', url: 'https://rainbow.me/', icon: '🌈' },
    { name: 'Rabby', url: 'https://rabby.io/', icon: '🐰' },
  ]

  // Filtrar wallets que NO estén instaladas
  // Si MetaMask está instalado, excluirlo de recomendados
  const recommendedWallets = allRecommendedWallets.filter(wallet => {
    // Si es MetaMask y está instalado, no mostrarlo
    if (wallet.name === 'MetaMask' && (isMetaMaskInstalled || availableConnectors.length > 0)) {
      return false
    }
    // Para otras wallets, verificar si están instaladas
    const installedWalletNames = availableConnectors.map(c => c.name.toLowerCase())
    return !installedWalletNames.some(installed => 
      wallet.name.toLowerCase().includes(installed) || installed.includes(wallet.name.toLowerCase())
    )
  })

  const handleConnect = async (connector: typeof connectors[0]) => {
    if (isConnecting || isPending) return
    
    setIsConnecting(true)
    setShowDialog(false)
    
    try {
      await connect({ connector })
    } catch (error) {
      console.error('Connection error:', error)
      setIsConnecting(false)
    }
  }

  // Cerrar el diálogo y resetear isConnecting cuando se conecta exitosamente
  useEffect(() => {
    if (isConnected) {
      setShowDialog(false)
      setIsConnecting(false)
    }
  }, [isConnected])

  if (!mounted) {
    return (
      <div className="flex gap-2">
        <Button variant="default" disabled>
          Conectar Wallet
        </Button>
      </div>
    )
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm font-mono">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <Button 
          onClick={() => {
            // Guardar la preferencia del tema actual para este usuario antes de desconectar
            if (address) {
              const currentTheme = document.documentElement.classList.contains('dark') ? 'dark' : 'light'
              const userThemeKey = `theme_${address.toLowerCase()}`
              localStorage.setItem(userThemeKey, currentTheme)
            }
            // Forzar modo claro al desconectar (pero mantener la preferencia guardada)
            document.documentElement.classList.remove('dark')
            disconnect()
          }} 
          variant="outline"
        >
          Desconectar
        </Button>
      </div>
    )
  }

  // Si hay wallets detectadas, mostrar diálogo de selección
  if (hasWallets) {
    return (
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogTrigger asChild>
          <Button variant="default">
            Conectar Wallet
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conectar tu Wallet</DialogTitle>
            <DialogDescription>
              Selecciona una wallet para conectarte a la aplicación
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 py-4">
            {/* Mostrar wallets detectadas */}
            {availableConnectors.map((connector) => {
              // Determinar el nombre a mostrar
              let displayName = connector.name
              let icon = '👛'
              
              // Si es injected y MetaMask está instalado, mostrarlo como MetaMask
              if (connector.id === 'injected' && isMetaMaskInstalled) {
                displayName = 'MetaMask'
                icon = '🦊'
              } else if (connector.name === 'MetaMask' || connector.name.includes('MetaMask')) {
                icon = '🦊'
              } else if (connector.name.includes('Coinbase')) {
                icon = '💙'
              } else if (connector.name.includes('WalletConnect')) {
                icon = '🔗'
              }
              
              return (
                <Button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  variant="outline"
                  className="w-full justify-start h-auto py-3 px-4"
                  disabled={isConnecting || isPending}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{icon}</div>
                    <div className="text-left">
                      <div className="font-semibold">{displayName}</div>
                      <div className="text-xs text-muted-foreground">Usar wallet instalada</div>
                    </div>
                  </div>
                </Button>
              )
            })}

            {/* Separador */}
            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  ¿No tienes wallet o quieres instalar otra?
                </span>
              </div>
            </div>

            {/* Recomendaciones - Top 5 wallets */}
            <div className="text-sm text-muted-foreground text-center mb-2">
              Top 5 wallets más populares:
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {recommendedWallets.map((wallet) => (
                <Button
                  key={wallet.name}
                  variant="ghost"
                  className="w-full justify-start h-auto py-2 px-3"
                  onClick={() => window.open(wallet.url, '_blank')}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{wallet.icon}</span>
                    <span className="text-sm">{wallet.name}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Fallback: No hay wallets detectadas
  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button variant="default">
          Instalar Wallet
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>📱 Necesitas una Wallet</DialogTitle>
          <DialogDescription>
            Para usar esta aplicación, necesitas instalar una wallet de criptomonedas
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 py-4">
          <p className="text-sm text-muted-foreground">
            Recomendamos estas wallets populares y seguras:
          </p>
          
          {recommendedWallets.map((wallet) => (
            <Button
              key={wallet.name}
              variant="outline"
              className="w-full justify-start h-auto py-3 px-4"
              onClick={() => window.open(wallet.url, '_blank')}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{wallet.icon}</div>
                <div className="text-left">
                  <div className="font-semibold">{wallet.name}</div>
                  <div className="text-xs text-muted-foreground">Click para instalar</div>
                </div>
              </div>
            </Button>
          ))}

          <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Consejo:</strong> Después de instalar, recarga esta página para conectarte
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
