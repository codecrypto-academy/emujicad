'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { Pause } from 'lucide-react'

export function UserManagementTable() {
  const { users, isLoading, refetch } = useGetAllUsers()
  const { changeStatus, isPending, isSuccess, error, hash } = useChangeUserStatus()
  const { data: isPaused } = useIsPaused()
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [lastSuccessHash, setLastSuccessHash] = useState<string | null>(null)

  // Calcular estadísticas desde los usuarios actuales
  const stats = useMemo(() => ({
    total: users.length,
    pending: users.filter(u => Number(u.status) === UserStatus.Pending).length,
    approved: users.filter(u => Number(u.status) === UserStatus.Approved).length,
    rejected: users.filter(u => Number(u.status) === UserStatus.Rejected).length,
    canceled: users.filter(u => Number(u.status) === UserStatus.Canceled).length,
  }), [users])

  // Refetch cuando la transacción sea exitosa (solo una vez por transacción)
  useEffect(() => {
    if (isSuccess && hash && hash !== lastSuccessHash) {
      const timer = setTimeout(() => {
        console.log('✅ Transacción exitosa, recargando usuarios...')
        refetch()
        setLastSuccessHash(hash)
      }, 2000) // Esperar 2s para que se confirme en blockchain
      return () => clearTimeout(timer)
    }
  }, [isSuccess, hash, lastSuccessHash, refetch])

  // Filtrar usuarios por estado
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

  // Acciones disponibles según el estado actual
  const getAvailableActions = (user: User) => {
    const status = Number(user.status)
    const actions: { label: string; value: UserStatus; color: string }[] = []

    switch (status) {
      case UserStatus.Pending:
        actions.push(
          { label: '✅ Aprobar', value: UserStatus.Approved, color: 'bg-green-600 dark:bg-green-700 hover:bg-green-700 dark:hover:bg-green-600 text-white' },
          { label: '❌ Rechazar', value: UserStatus.Rejected, color: 'bg-red-600 dark:bg-red-700 hover:bg-red-700 dark:hover:bg-red-600 text-white' }
        )
        break
      case UserStatus.Approved:
        actions.push(
          { label: '🚫 Cancelar', value: UserStatus.Canceled, color: 'bg-gray-600 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white' }
        )
        break
      case UserStatus.Rejected:
        // Usuario rechazado debe re-registrarse, admin no puede cambiarlo
        break
      case UserStatus.Canceled:
        actions.push(
          { label: '🔄 Reactivar a Pending', value: UserStatus.Pending, color: 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-600 text-white' }
        )
        break
    }

    return actions
  }

  const handleStatusChange = (userAddress: string, newStatus: UserStatus) => {
    changeStatus(userAddress, newStatus)
  }

  if (isLoading) {
    return (
      <>
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
            <CardTitle>Gestión de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">Cargando usuarios...</p>
          </CardContent>
        </Card>
      </>
    )
  }

  if (users.length === 0) {
    return (
      <>
        {/* Stats Cards - Empty State */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
              <CardDescription>Registrados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">0</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground">No hay usuarios registrados aún.</p>
          </CardContent>
        </Card>
      </>
    )
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
            <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">⏳ Pendientes</CardTitle>
            <CardDescription className="text-xs text-yellow-600 dark:text-yellow-300/80">Esperando aprobación</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pending}</p>
          </CardContent>
        </Card>

        {/* Approved */}
        <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">✅ Aprobados</CardTitle>
            <CardDescription className="text-xs text-green-600 dark:text-green-300/80">Activos en el sistema</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.approved}</p>
          </CardContent>
        </Card>

        {/* Rejected */}
        <Card className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">❌ Rechazados</CardTitle>
            <CardDescription className="text-xs text-red-600 dark:text-red-300/80">Solicitudes denegadas</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold text-red-700 dark:text-red-400">{stats.rejected}</p>
          </CardContent>
        </Card>

        {/* Canceled */}
        <Card className="bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">🚫 Cancelados</CardTitle>
            <CardDescription className="text-xs text-gray-600 dark:text-gray-400">Cuentas suspendidas</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{stats.canceled}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Gestión de Usuarios</CardTitle>
          
          {/* Filtro por estado */}
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value={UserStatus.Pending.toString()}>⏳ Pendientes</SelectItem>
              <SelectItem value={UserStatus.Approved.toString()}>✅ Aprobados</SelectItem>
              <SelectItem value={UserStatus.Rejected.toString()}>❌ Rechazados</SelectItem>
              <SelectItem value={UserStatus.Canceled.toString()}>🚫 Cancelados</SelectItem>
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
        {isPending && (
          <Alert className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              ⏳ Procesando transacción... Confirma en MetaMask.
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

        {error && (
          <Alert className="mb-4 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
            <AlertDescription className="text-red-700 dark:text-red-300">
              ❌ Error: {error.message}
            </AlertDescription>
          </Alert>
        )}

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
                    No hay usuarios con el estado seleccionado.
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
                            {actions.map((action) => (
                              <Button
                                key={action.value}
                                size="sm"
                                className={action.color}
                                onClick={() => handleStatusChange(user.userAddress, action.value)}
                                disabled={isPending || isPaused === true}
                                aria-label={`${action.label} user ${user.userAddress.slice(0, 6)}...${user.userAddress.slice(-4)}`}
                                aria-disabled={isPending || isPaused === true}
                              >
                                {action.label}
                              </Button>
                            ))}
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
            <li>• <strong>Pending</strong> → Puedes Aprobar o Rechazar</li>
            <li>• <strong>Approved</strong> → Puedes Cancelar (suspender cuenta)</li>
            <li>• <strong>Rejected</strong> → Usuario debe hacer nueva solicitud</li>
            <li>• <strong>Canceled</strong> → Puedes Reactivar a Pending</li>
          </ul>
        </div>
      </CardContent>
    </Card>
    </>
  )
}
