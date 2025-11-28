'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/lib/wagmi-config'
import { Web3Provider } from '@/contexts/Web3Context'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthRedirect } from '@/components/AuthRedirect'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useEffect } from 'react'
import { initStorageCleanup } from '@/lib/storage-cleanup'

// Crear QueryClient fuera del componente para evitar recreaciones
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  },
})

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Inicializar sistema de limpieza automática de localStorage
  useEffect(() => {
    const cleanup = initStorageCleanup()
    return cleanup
  }, [])

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <AuthProvider>
              <Web3Provider>
                <AuthRedirect />
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </Web3Provider>
            </AuthProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
