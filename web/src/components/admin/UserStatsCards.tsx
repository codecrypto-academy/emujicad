'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useUserStats } from '@/hooks/useAdminUsers'

export function UserStatsCards() {
  const { stats, isLoading } = useUserStats()

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <CardTitle className="h-4 bg-gray-200 rounded w-1/2"></CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      {/* Total Users */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
          <CardDescription>Registrados</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{stats.total}</p>
        </CardContent>
      </Card>

      {/* Pending */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-yellow-700">⏳ Pendientes</CardTitle>
          <CardDescription>Esperando aprobación</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
        </CardContent>
      </Card>

      {/* Approved */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-green-700">✅ Aprobados</CardTitle>
          <CardDescription>Activos en el sistema</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-700">{stats.approved}</p>
        </CardContent>
      </Card>

      {/* Rejected */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-red-700">❌ Rechazados</CardTitle>
          <CardDescription>Solicitudes denegadas</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
        </CardContent>
      </Card>

      {/* Canceled */}
      <Card className="border-gray-200 bg-gray-50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700">🚫 Cancelados</CardTitle>
          <CardDescription>Cuentas suspendidas</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-gray-700">{stats.canceled}</p>
        </CardContent>
      </Card>
    </div>
  )
}
