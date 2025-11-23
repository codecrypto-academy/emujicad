'use client'

import React, { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AddressDisplayProps {
  address: string
  className?: string
  showCopyButton?: boolean
}

export function AddressDisplay({ address, className = '', showCopyButton = true }: AddressDisplayProps) {
  const [copied, setCopied] = useState(false)

  if (!address) return <span className={className}>N/A</span>

  const formatAddress = (addr: string): string => {
    if (!addr) return 'N/A'
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  return (
    <div 
      className={`flex items-center gap-2 ${className}`}
      onClick={(e) => e.stopPropagation()} // Prevenir que el clic se propague a elementos padre
    >
      <span
        className="font-mono text-sm select-none whitespace-nowrap"
        title={address}
      >
        {formatAddress(address)}
      </span>
      {showCopyButton && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 flex-shrink-0"
          onClick={handleCopy}
          title={`Copy full address: ${address}`}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      )}
    </div>
  )
}

