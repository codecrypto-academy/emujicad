'use client'

import { useAccount, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useUserInfo } from '@/hooks/useContractReads'
import { useContractOwner } from '@/hooks/useContractOwner'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserStatus } from '@/contracts/config'
import { useState, useEffect } from 'react'
import { ThemeToggle } from './ThemeToggle'

type UserInfo = {
  id: bigint
  userAddress: string
  role: bigint
  status: bigint
}

export function Header() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const pathname = usePathname()
  const { owner } = useContractOwner()
  const { data: rawUserInfo } = useUserInfo(address)
  const userInfo = rawUserInfo as UserInfo | undefined
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isAdmin = address && owner && address.toLowerCase() === owner.toLowerCase()

  // Helpers para roles
  const getRoleName = (role: bigint): string => {
    const roles: Record<number, string> = {
      0: 'Producer',
      1: 'Factory',
      2: 'Retailer',
      3: 'Consumer',
    }
    return roles[Number(role)] || 'Unknown'
  }

  const getRoleIcon = (role: bigint) => {
    const icons: Record<number, string> = {
      0: '👨‍🌾',
      1: '🏭',
      2: '🏪',
      3: '🛒',
    }
    return icons[Number(role)] || '👤'
  }

  if (!isConnected || !address) {
    return null
  }

  const isOnAdminPage = pathname === '/admin/users'

  return (
    <Card className="mb-6">
      <div className="p-6">
        <div className="flex flex-col gap-4">
          {/* Row 1: Title and Actions */}
          <div className="flex items-center">
            {/* Left: App Title - Fixed width */}
            <div className="flex items-center gap-3 w-80">
              <div className="text-2xl">📦</div>
              <div>
                <h1 className="text-xl font-bold">Supply Chain Tracker</h1>
                <p className="text-xs text-muted-foreground">Blockchain-based supply chain management</p>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1"></div>

            {/* Right: Actions - Fixed width */}
            <div className="flex items-center gap-2 justify-end">
              {/* Button container with fixed width to prevent layout shift */}
              <div className="w-36">
                {isAdmin && !isOnAdminPage && (
                  <Link href="/admin/users">
                    <Button variant="outline" size="sm" className="w-full">
                      👥 Manage Users
                    </Button>
                  </Link>
                )}
                {isOnAdminPage && (
                  <Link href="/">
                    <Button variant="outline" size="sm" className="w-full">
                      ← Home
                    </Button>
                  </Link>
                )}
              </div>

              {/* Theme Toggle - Only for Admin and Approved Users */}
              {(isAdmin || (userInfo && Number(userInfo.status) === UserStatus.Approved)) && (
                <ThemeToggle />
              )}

              {/* Disconnect Button - Fixed width */}
              <Button 
                variant="destructive" 
                size="sm"
                className="w-24"
                onClick={() => disconnect()}
              >
                Disconnect
              </Button>
            </div>
          </div>

          {/* Row 2: User Info */}
          <div className="flex flex-col gap-2">
            {/* User Address */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Dirección:</span>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                {address}
              </code>
            </div>

            {/* User Role & Status */}
            <div className="flex items-center gap-2 flex-wrap">
            {isAdmin ? (
              <Badge className="bg-purple-600 hover:bg-purple-700">
                <span className="mr-1">👑</span>
                Administrator
              </Badge>
            ) : userInfo && mounted ? (
              <>
                <Badge variant="outline">
                  <span className="mr-1">{getRoleIcon(userInfo.role)}</span>
                  {getRoleName(userInfo.role)}
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                  ID: {userInfo.id?.toString()}
                </Badge>
                {Number(userInfo.status) === UserStatus.Pending && (
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                    ⏳ Pending Approval
                  </Badge>
                )}
                {Number(userInfo.status) === UserStatus.Approved && (
                  <Badge variant="default" className="bg-green-600">
                    ✅ Approved
                  </Badge>
                )}
                {Number(userInfo.status) === UserStatus.Rejected && (
                  <Badge variant="destructive">
                    ❌ Rejected
                  </Badge>
                )}
                {Number(userInfo.status) === 3 && (
                  <Badge variant="outline" className="bg-gray-100">
                    🚫 Canceled
                  </Badge>
                )}
              </>
            ) : mounted ? (
              <Badge variant="outline" className="bg-gray-100">
                👤 Not Registered
              </Badge>
            ) : null}
            </div>

            {/* Action Buttons for Approved Users */}
            {!isAdmin && userInfo && mounted && Number(userInfo.status) === UserStatus.Approved && (
              <div className="flex items-center gap-2 mt-2">
                <Link href="/dashboard">
                  <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/tokens">
                  <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700">
                    My Tokens
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
