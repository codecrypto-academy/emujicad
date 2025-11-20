'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { config } from '@/lib/wagmi-config'
import { Web3Provider } from '@/contexts/Web3Context'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useState } from 'react'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// El metadata debe estar en un componente de servidor, lo movemos después
// export const metadata: Metadata = {
//   title: "Supply Chain Tracker",
//   description: "DApp para tracking de supply chain con blockchain",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <WagmiProvider config={config}>
          <QueryClientProvider client={queryClient}>
            <Web3Provider>
              {children}
            </Web3Provider>
          </QueryClientProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
