'use client'

import { ConnectWallet } from '@/components/ConnectWallet'
import { useAccount } from 'wagmi'
import { useTotalTokens, useTotalUsers, useTotalTransfers } from '@/hooks/useContractReads'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Home() {
  const { isConnected } = useAccount()
  const { data: totalTokens } = useTotalTokens()
  const { data: totalUsers } = useTotalUsers()
  const { data: totalTransfers } = useTotalTransfers()

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-16">
          <h1 className="text-3xl font-bold">Supply Chain Tracker</h1>
          <ConnectWallet />
        </div>

        {/* Stats cuando esté conectado */}
        {isConnected && (
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Tokens</CardTitle>
                <CardDescription>Total registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalTokens?.toString() || '0'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usuarios</CardTitle>
                <CardDescription>Total registrados</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalUsers?.toString() || '0'}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Transferencias</CardTitle>
                <CardDescription>Total realizadas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalTransfers?.toString() || '0'}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bienvenida */}
        <div className="flex flex-col items-center gap-6 text-center">
          <h2 className="max-w-xs text-2xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            {isConnected 
              ? '¡Bienvenido a la DApp!' 
              : 'Conecta tu wallet para comenzar'
            }
          </h2>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Sistema descentralizado de tracking para supply chain basado en blockchain.{" "}
            <a
              href="https://github.com"
              className="font-medium text-zinc-950 dark:text-zinc-50 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Ver repositorio
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
