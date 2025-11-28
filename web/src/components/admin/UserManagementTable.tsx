'use client'

import { useState, useEffect, useMemo } from 'react'
import { useAccount } from 'wagmi'
import { useGetAllUsers, useChangeUserStatus, UserStatus, UserRole, type User } from '@/hooks/useAdminUsers'
import { useIsPaused } from '@/hooks/usePause'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Pause, Loader2 } from 'lucide-react'
import { DebugLabel, DEBUG_MODE } from '@/lib/debug'
import { formatTransactionError, getWalletName } from '@/lib/error-formatter'

export function UserManagementTable() {
  const { users, isLoading, refetch } = useGetAllUsers()
  const { changeStatus, isPending, isConfirming, isSuccess, error, hash } = useChangeUserStatus()
  const { data: isPaused } = useIsPaused()
  const { connector } = useAccount()
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [lastSuccessHash, setLastSuccessHash] = useState<string | null>(null)
  // Track which user and which action is being processed
  const [processingAction, setProcessingAction] = useState<{ userAddress: string; action: UserStatus } | null>(null)
  
  // Get the connected wallet name using the centralized function
  const walletName = getWalletName(connector)
  
  // Enable modern design if enabled
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'

  // Calculate statistics from current users
  const stats = useMemo(() => ({
    total: users.length,
    pending: users.filter(u => Number(u.status) === UserStatus.Pending).length,
    approved: users.filter(u => Number(u.status) === UserStatus.Approved).length,
    rejected: users.filter(u => Number(u.status) === UserStatus.Rejected).length,
    canceled: users.filter(u => Number(u.status) === UserStatus.Canceled).length,
  }), [users])

  // Refetch when transaction is successful (only once per transaction)
  useEffect(() => {
    if (isSuccess && hash && hash !== lastSuccessHash) {
      const timer = setTimeout(() => {
        console.log('✅ Transaction successful, reloading users...')
        refetch()
        setLastSuccessHash(hash)
        setProcessingAction(null) // Clear processed action
      }, 2000) // Wait 2s for blockchain confirmation
      return () => clearTimeout(timer)
    }
  }, [isSuccess, hash, lastSuccessHash, refetch])
  
  // Clear processingAction when transaction fails or is cancelled
  useEffect(() => {
    if (error && processingAction !== null) {
      setProcessingAction(null)
    }
  }, [error, processingAction])

  // Filter users by status
  const filteredUsers = filterStatus === 'all' 
    ? users 
    : users.filter(u => Number(u.status) === Number(filterStatus))

  // Helpers para UI
  const getRoleName = (role: bigint): string => {
    const roles: Record<number, string> = {
      [UserRole.Producer]: 'Producer',
      [UserRole.Factory]: 'Factory',
      [UserRole.Retailer]: 'Retailer',
      [UserRole.Consumer]: 'Consumer',
    }
    return roles[Number(role)] || 'Unknown'
  }

  const getRoleIcon = (role: bigint) => {
    const icons: Record<number, string> = {
      [UserRole.Producer]: '👨‍🌾',
      [UserRole.Factory]: '🏭',
      [UserRole.Retailer]: '🏪',
      [UserRole.Consumer]: '🛒',
    }
    return icons[Number(role)] || '👤'
  }

  const getStatusBadge = (status: bigint) => {
    const statusConfig = {
      [UserStatus.Pending]: { label: 'Pending', variant: 'secondary' as const, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' },
      [UserStatus.Approved]: { label: 'Approved', variant: 'default' as const, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
      [UserStatus.Rejected]: { label: 'Rejected', variant: 'destructive' as const, color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
      [UserStatus.Canceled]: { label: 'Canceled', variant: 'outline' as const, color: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300' },
    }
    const config = statusConfig[Number(status) as UserStatus]
    return config ? (
      <Badge variant={config.variant} className={config.color}>
        {config.label}
      </Badge>
    ) : (
      <Badge variant="outline">Unknown</Badge>
    )
  }

  // Available actions according to current status
  const getAvailableActions = (user: User) => {
    const status = Number(user.status)
    const actions: { label: string; value: UserStatus; color: string }[] = []

    switch (status) {
      case UserStatus.Pending:
        actions.push(
          { label: '✅ Approve', value: UserStatus.Approved, color: 'bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white' },
          { label: '❌ Reject', value: UserStatus.Rejected, color: 'bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white' }
        )
        break
      case UserStatus.Approved:
        actions.push(
          { label: '🚫 Cancel', value: UserStatus.Canceled, color: 'bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white' }
        )
        break
      case UserStatus.Rejected:
        // Rejected user must re-register, admin cannot change it
        break
      case UserStatus.Canceled:
        actions.push(
          { label: '🔄 Reactivate to Pending', value: UserStatus.Pending, color: 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white' }
        )
        break
    }

    return actions
  }

  const handleStatusChange = (userAddress: string, newStatus: UserStatus) => {
    setProcessingAction({ userAddress, action: newStatus })
    changeStatus(userAddress, newStatus)
  }

  if (isLoading) {
    if (useModernDesign) {
      return (
        <>
          <DebugLabel component="UserManagementTable" section="LoadingState" props={{ isLoading, useModernDesign: true }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/2 mb-4"></div>
                <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/3"></div>
              </div>
            ))}
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-8">
            <p className="text-center text-slate-600 dark:text-slate-400">Loading users...</p>
          </div>
        </>
      )
    }
    return (
      <>
        <DebugLabel component="UserManagementTable" section="LoadingState" props={{ isLoading, useModernDesign: false }} />
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">Loading users...</p>
          </CardContent>
        </Card>
      </>
    )
  }

  if (users.length === 0) {
    if (useModernDesign) {
      return (
        <>
          <DebugLabel component="UserManagementTable" section="EmptyState" props={{ usersCount: users.length, useModernDesign: true }} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
            <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Users</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Registered</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">0</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-8 text-center">
            <p className="text-slate-600 dark:text-slate-400">No users registered yet.</p>
          </div>
        </>
      )
    }
    return (
      <>
        <DebugLabel component="UserManagementTable" section="EmptyState" props={{ usersCount: users.length, useModernDesign: false }} />
        {/* Stats Cards - Empty State */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader>
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <CardDescription>Registered</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">No users registered yet.</p>
          </CardContent>
        </Card>
      </>
    )
  }

  // Diseño moderno para stats cards
  const StatsCards = useModernDesign ? (
    <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6" style={DEBUG_MODE ? { border: '3px solid rgba(0, 0, 255, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
      <DebugLabel component="UserManagementTable" section="StatsCards" props={{ stats, useModernDesign: true }} position="top-right" offset={4} />
      {/* Total Users */}
      <div className="group relative overflow-hidden rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative p-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Users</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Registered</p>
          <p className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">{stats.total}</p>
        </div>
      </div>

      {/* Pending */}
      <div className="group relative overflow-hidden rounded-2xl bg-yellow-50/80 dark:bg-yellow-900/30 backdrop-blur-xl border border-yellow-200/50 dark:border-yellow-800/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative p-6">
          <h3 className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-1">⏳ Pending</h3>
          <p className="text-xs text-yellow-600 dark:text-yellow-300/80 mb-2">Waiting for approval</p>
          <p className="text-4xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pending}</p>
        </div>
      </div>

      {/* Approved */}
      <div className="group relative overflow-hidden rounded-2xl bg-green-50/80 dark:bg-green-900/30 backdrop-blur-xl border border-green-200/50 dark:border-green-800/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative p-6">
          <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-1">✅ Approved</h3>
          <p className="text-xs text-green-600 dark:text-green-300/80 mb-2">Active in the system</p>
          <p className="text-4xl font-bold text-green-700 dark:text-green-400">{stats.approved}</p>
        </div>
      </div>

      {/* Rejected */}
      <div className="group relative overflow-hidden rounded-2xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur-xl border border-red-200/50 dark:border-red-800/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative p-6">
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">❌ Rejected</h3>
          <p className="text-xs text-red-600 dark:text-red-300/80 mb-2">Denied requests</p>
          <p className="text-4xl font-bold text-red-700 dark:text-red-400">{stats.rejected}</p>
        </div>
      </div>

      {/* Canceled */}
      <div className="group relative overflow-hidden rounded-2xl bg-slate-50/80 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="relative p-6">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">🚫 Canceled</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Suspended accounts</p>
          <p className="text-4xl font-bold text-slate-700 dark:text-slate-300">{stats.canceled}</p>
        </div>
      </div>
    </div>
  ) : (
    <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4" style={DEBUG_MODE ? { border: '3px solid rgba(0, 0, 255, 0.6)', borderRadius: '4px', padding: '8px' } : {}}>
      <DebugLabel component="UserManagementTable" section="StatsCards" props={{ stats, useModernDesign: false }} position="top-right" offset={30} />
      {/* Total Users */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          <CardDescription className="text-xs">Registrados</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-3xl font-bold">{stats.total}</p>
        </CardContent>
      </Card>

      {/* Pending */}
      <Card className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">⏳ Pending</CardTitle>
          <CardDescription className="text-xs text-yellow-600 dark:text-yellow-300/80">Waiting for approval</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pending}</p>
        </CardContent>
      </Card>

      {/* Approved */}
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">✅ Approved</CardTitle>
          <CardDescription className="text-xs text-green-600 dark:text-green-300/80">Active in the system</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.approved}</p>
        </CardContent>
      </Card>

      {/* Rejected */}
      <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">❌ Rejected</CardTitle>
          <CardDescription className="text-xs text-red-600 dark:text-red-300/80">Denied requests</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-3xl font-bold text-red-700 dark:text-red-400">{stats.rejected}</p>
        </CardContent>
      </Card>

      {/* Canceled */}
      <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">🚫 Canceled</CardTitle>
          <CardDescription className="text-xs text-gray-600 dark:text-gray-400">Suspended accounts</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{stats.canceled}</p>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <>
      {/* Stats Cards */}
      {StatsCards}

      {useModernDesign ? (
        <div className="group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl" style={DEBUG_MODE ? { border: '3px solid rgba(0, 255, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
          <DebugLabel component="UserManagementTable" section="MainTable" props={{ usersCount: users.length, filteredCount: filteredUsers.length, filterStatus, useModernDesign: true, isPaused: isPaused === true }} position="top-right" offset={4} />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-800 to-blue-700 dark:from-slate-100 dark:to-blue-300 bg-clip-text text-transparent">User Management</h2>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 rounded-xl border-2">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value={UserStatus.Pending.toString()}>⏳ Pending</SelectItem>
                  <SelectItem value={UserStatus.Approved.toString()}>✅ Approved</SelectItem>
                  <SelectItem value={UserStatus.Rejected.toString()}>❌ Rejected</SelectItem>
                  <SelectItem value={UserStatus.Canceled.toString()}>🚫 Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {/* Status messages */}
            {isPaused === true && (
              <Alert className="mb-4 rounded-xl bg-yellow-50/80 dark:bg-yellow-900/30 backdrop-blur border-yellow-200 dark:border-yellow-800">
                <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  <strong>⚠️ Contract Paused:</strong> You cannot change user status while the contract is paused. 
                  You can only view the information.
                </AlertDescription>
              </Alert>
            )}
            {(isPending || isConfirming) && (
              <Alert className="mb-4 rounded-xl bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur border-blue-200 dark:border-blue-800">
                <AlertDescription className="text-blue-700 dark:text-blue-300">
                  ⏳ {isPending ? 'Processing transaction... Confirm in MetaMask.' : 'Waiting for transaction confirmation...'}
                </AlertDescription>
              </Alert>
            )}

            {isSuccess && (
              <Alert className="mb-4 rounded-xl bg-green-50/80 dark:bg-green-900/30 backdrop-blur border-green-200 dark:border-green-800">
                <AlertDescription className="text-green-700 dark:text-green-300">
                  ✅ Status updated successfully. Updating list...
                </AlertDescription>
              </Alert>
            )}

            {error && (() => {
              const { friendlyMessage, technicalDetails } = formatTransactionError(
                error,
                {
                  action: 'changing the user status',
                  walletName: getWalletName(connector),
                }
              )
              
                      return (
                <Alert className="mb-4 rounded-xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur border-red-200 dark:border-red-800">
                  <AlertDescription className="text-red-700 dark:text-red-300 whitespace-pre-line">
                    {friendlyMessage}
                    {technicalDetails && process.env.NODE_ENV === 'development' && (
                      <details className="mt-2">
                        <summary className="text-xs text-red-500 cursor-pointer hover:text-red-700">
                          ▼ Technical details (dev only)
                        </summary>
                        <pre className="text-xs mt-1 p-2 bg-red-100 dark:bg-red-900/30 rounded overflow-auto max-h-32">
                          {technicalDetails}
                        </pre>
                      </details>
                    )}
                </AlertDescription>
              </Alert>
              )
            })()}

            {/* User table */}
            <div className="rounded-xl border-2 border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
              <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No users with the selected status.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const actions = getAvailableActions(user)
                  
                  return (
                    <TableRow key={user.id.toString()} className={`transition-all duration-200 ${useModernDesign ? 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50' : 'hover:bg-accent/50'} animate-in fade-in slide-in-from-left-2`}>
                      <TableCell className="font-medium">{user.id.toString()}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {user.userAddress.slice(0, 6)}...{user.userAddress.slice(-4)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{getRoleIcon(user.role)}</span>
                          <span>{getRoleName(user.role)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-right">
                        {actions.length === 0 ? (
                          <span className="text-sm text-slate-500 dark:text-slate-400">
                            {Number(user.status) === UserStatus.Rejected 
                              ? 'User must re-register' 
                              : 'No actions'}
                          </span>
                        ) : (
                          <div className="flex gap-2 justify-end">
                            {actions.map((action) => {
                              // Determinar si esta acción específica está siendo procesada
                              const isThisActionProcessing = (isPending || isConfirming) && 
                                                             processingAction?.userAddress === user.userAddress && 
                                                             processingAction?.action === action.value
                              // Deshabilitar TODOS los botones si hay alguna transacción pendiente o confirmando
                              const isAnyTransactionPending = isPending || isConfirming
                              
                              return (
                                <Button
                                  key={action.value}
                                  size="sm"
                                  className={`${action.color} ${useModernDesign ? 'rounded-xl' : ''}`}
                                  onClick={() => handleStatusChange(user.userAddress, action.value)}
                                  disabled={isAnyTransactionPending || isPaused === true}
                                  aria-label={`${action.label} user ${user.userAddress.slice(0, 6)}...${user.userAddress.slice(-4)}`}
                                  aria-disabled={isAnyTransactionPending || isPaused === true}
                                >
                                  {isThisActionProcessing ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    action.label
                                  )}
                                </Button>
                              )
                            })}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
            </div>

            {/* Flow info */}
            <div className={`mt-6 p-4 ${useModernDesign ? 'bg-blue-50/80 dark:bg-blue-900/30 backdrop-blur border border-blue-200/50 dark:border-blue-800/50 rounded-xl' : 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded'}`}>
              <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold mb-2">📋 Status Flow:</p>
              <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
                <li>• <strong>Pending</strong> → You can Approve or Reject</li>
                <li>• <strong>Approved</strong> → You can Cancel (suspend account)</li>
                <li>• <strong>Rejected</strong> → User must make a new request</li>
                <li>• <strong>Canceled</strong> → You can Reactivate to Pending</li>
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <Card style={DEBUG_MODE ? { border: '3px solid rgba(0, 255, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
          <DebugLabel component="UserManagementTable" section="MainTable" props={{ usersCount: users.length, filteredCount: filteredUsers.length, filterStatus, useModernDesign: false, isPaused: isPaused === true }} position="top-right" offset={4} />
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>User Management</CardTitle>
            
            {/* Filter by status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value={UserStatus.Pending.toString()}>⏳ Pending</SelectItem>
                <SelectItem value={UserStatus.Approved.toString()}>✅ Approved</SelectItem>
                <SelectItem value={UserStatus.Rejected.toString()}>❌ Rejected</SelectItem>
                <SelectItem value={UserStatus.Canceled.toString()}>🚫 Canceled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {/* Mensajes de estado */}
          {isPaused === true && (
            <Alert className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                <strong>⚠️ Contrato Pausado:</strong> No puedes cambiar el estado de los usuarios mientras el contrato esté pausado. 
                Solo puedes visualizar la información.
              </AlertDescription>
            </Alert>
          )}
          {(isPending || isConfirming) && (
            <Alert className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                ⏳ {isPending ? 'Processing transaction... Confirm in MetaMask.' : 'Waiting for transaction confirmation...'}
              </AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert className="mb-4 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <AlertDescription className="text-green-700 dark:text-green-300">
                ✅ Estado actualizado exitosamente. Actualizando lista...
              </AlertDescription>
            </Alert>
          )}

          {error && (() => {
            const { friendlyMessage, technicalDetails } = formatTransactionError(
              error,
              {
                action: 'changing the user status',
                walletName: getWalletName(connector),
              }
            )
            
            return (
            <Alert className="mb-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertDescription className="text-red-700 dark:text-red-300 whitespace-pre-line">
                  {friendlyMessage}
                  {technicalDetails && process.env.NODE_ENV === 'development' && (
                    <details className="mt-2">
                      <summary className="text-xs text-red-500 cursor-pointer hover:text-red-700">
                        ▼ Technical details (dev only)
                      </summary>
                      <pre className="text-xs mt-1 p-2 bg-red-100 dark:bg-red-900/30 rounded overflow-auto max-h-32">
                        {technicalDetails}
                      </pre>
                    </details>
                  )}
              </AlertDescription>
            </Alert>
            )
          })()}

          {/* Tabla de usuarios */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No users with the selected status.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => {
                    const actions = getAvailableActions(user)
                    
                    return (
                      <TableRow key={user.id.toString()} className="transition-all duration-200 hover:bg-accent/50 animate-in fade-in slide-in-from-left-2">
                        <TableCell className="font-medium">{user.id.toString()}</TableCell>
                        <TableCell className="font-mono text-sm">
                          {user.userAddress.slice(0, 6)}...{user.userAddress.slice(-4)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{getRoleIcon(user.role)}</span>
                            <span>{getRoleName(user.role)}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(user.status)}</TableCell>
                        <TableCell className="text-right">
                          {actions.length === 0 ? (
                            <span className="text-sm text-muted-foreground">
                              {Number(user.status) === UserStatus.Rejected 
                                ? 'Usuario debe re-registrarse' 
                                : 'Sin acciones'}
                            </span>
                          ) : (
                            <div className="flex gap-2 justify-end">
                              {actions.map((action) => {
                                // Determinar si esta acción específica está siendo procesada
                                const isThisActionProcessing = (isPending || isConfirming) && 
                                                               processingAction?.userAddress === user.userAddress && 
                                                               processingAction?.action === action.value
                                // Deshabilitar TODOS los botones si hay alguna transacción pendiente o confirmando
                                const isAnyTransactionPending = isPending || isConfirming
                                
                                return (
                                  <Button
                                    key={action.value}
                                    size="sm"
                                    className={action.color}
                                    onClick={() => handleStatusChange(user.userAddress, action.value)}
                                    disabled={isAnyTransactionPending || isPaused === true}
                                    aria-label={`${action.label} user ${user.userAddress.slice(0, 6)}...${user.userAddress.slice(-4)}`}
                                    aria-disabled={isAnyTransactionPending || isPaused === true}
                                  >
                                    {isThisActionProcessing ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      action.label
                                    )}
                                  </Button>
                                )
                              })}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Info del flujo */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-semibold mb-2">📋 Flujo de Estados:</p>
            <ul className="text-xs text-blue-600 dark:text-blue-400 space-y-1">
              <li>• <strong>Pending</strong> → You can Approve or Reject</li>
              <li>• <strong>Approved</strong> → You can Cancel (suspend account)</li>
              <li>• <strong>Rejected</strong> → User must make a new request</li>
              <li>• <strong>Canceled</strong> → You can Reactivate to Pending</li>
            </ul>
          </div>
        </CardContent>
      </Card>
      )}
    </>
  )
}
