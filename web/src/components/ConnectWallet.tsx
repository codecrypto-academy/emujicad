'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'

export function ConnectWallet() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm">
          {address.slice(0, 6)}...{address.slice(-4)}
        </span>
        <Button onClick={() => disconnect()} variant="outline">
          Desconectar
        </Button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      {connectors.map((connector) => (
        <Button
          key={connector.id}
          onClick={() => connect({ connector })}
          variant="default"
        >
          Conectar {connector.name}
        </Button>
      ))}
    </div>
  )
}
