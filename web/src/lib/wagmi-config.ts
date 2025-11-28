import { http, createConfig } from 'wagmi'
import { localhost } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

// Configuración de la blockchain local Anvil
export const config = createConfig({
  chains: [localhost],
  connectors: [
    injected(), // MetaMask y otros wallets inyectados
  ],
  transports: {
    [localhost.id]: http('http://127.0.0.1:8545'), // URL de Anvil
  },
  multiInjectedProviderDiscovery: false, // Prevenir múltiples solicitudes de conexión
  ssr: false, // Deshabilitar SSR para evitar problemas de hidratación
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
