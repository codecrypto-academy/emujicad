'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useUserStats } from '@/hooks/useAdminUsers'
import { DebugLabel } from '@/lib/debug'

export function UserStatsCards() {
  const { stats, isLoading } = useUserStats()

  if (isLoading) {
    return (
      <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4">
        <DebugLabel component="UserStatsCards" section="LoadingState" props={{ isLoading }} position="top-left" offset={4} />
        {[...Array(4)].map((_, i) => (
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
    <div className="relative grid grid-cols-1 md:grid-cols-4 gap-4">
      <DebugLabel component="UserStatsCards" section="StatsGrid" props={{ stats, isLoading }} position="top-left" offset={4} />
      {/* Pending */}
      <Card className="border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-900/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-400">⏳ Pending</CardTitle>
          <CardDescription className="dark:text-yellow-300/80">Awaiting approval</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{stats.pending}</p>
        </CardContent>
      </Card>

      {/* Approved */}
      <Card className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-green-700 dark:text-green-400">✅ Approved</CardTitle>
          <CardDescription className="dark:text-green-300/80">Active in the system</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-green-700 dark:text-green-400">{stats.approved}</p>
        </CardContent>
      </Card>

      {/* Rejected */}
      <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-red-700 dark:text-red-400">❌ Rejected</CardTitle>
          <CardDescription className="dark:text-red-300/80">Denied requests</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-red-700 dark:text-red-400">{stats.rejected}</p>
        </CardContent>
      </Card>

      {/* Canceled */}
      <Card className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">🚫 Canceled</CardTitle>
          <CardDescription className="dark:text-gray-400">Suspended accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold text-gray-700 dark:text-gray-300">{stats.canceled}</p>
        </CardContent>
      </Card>
    </div>
  )
}
