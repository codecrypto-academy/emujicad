'use client'

import { Header } from '@/components/Header'
import { TokenCard } from '@/components/TokenCard'
import { useGetAllTokens } from '@/hooks/useGetUserTokens'
import { useIsPaused } from '@/hooks/usePause'
import { useAuth } from '@/contexts/AuthContext'
import { useAccount } from 'wagmi'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Package, Search, Filter, AlertCircle, Loader2 } from 'lucide-react'
import { TokenType, UserRole, UserStatus } from '@/contracts/config'
import Link from 'next/link'

export default function TokensPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { isAuthenticated, isLoading: isLoadingAuth, userInfo } = useAuth()
  const { tokens, isLoading, error, totalTokens } = useGetAllTokens()
  const { data: isPaused } = useIsPaused()
  
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'raw' | 'finished'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const tokensPerPage = 12

  useEffect(() => {
    setMounted(true)
  }, [])

  // Filtrar tokens por tipo y búsqueda (DEBE estar antes de cualquier return condicional)
  const filteredTokens = useMemo(() => {
    if (!tokens) return []

    return tokens.filter((token) => {
      // Filtro por tipo
      if (filterType === 'raw' && Number(token.tokenType) !== TokenType.RowMaterial) {
        return false
      }
      if (filterType === 'finished' && Number(token.tokenType) !== TokenType.FinishedProduct) {
        return false
      }

      // Filtro por búsqueda (nombre)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        return token.name.toLowerCase().includes(query)
      }

      return true
    })
  }, [tokens, filterType, searchQuery])

  // Paginación (DEBE estar antes de cualquier return condicional)
  const totalPages = Math.ceil(filteredTokens.length / tokensPerPage)
  const startIndex = (currentPage - 1) * tokensPerPage
  const endIndex = startIndex + tokensPerPage
  const paginatedTokens = filteredTokens.slice(startIndex, endIndex)

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [filterType, searchQuery])

  // Redirigir si no está autenticado (después de todos los hooks)
  useEffect(() => {
    if (!mounted) return
    
    if (!isConnected) {
      router.replace('/')
      return
    }
    
    if (!isLoadingAuth && !isAuthenticated) {
      router.replace('/')
      return
    }
  }, [mounted, isConnected, isAuthenticated, isLoadingAuth, router])

  // Early return DESPUÉS de todos los hooks
  if (!mounted || !isConnected || (!isLoadingAuth && !isAuthenticated)) {
    return null
  }

  const handleTokenClick = (tokenId: bigint) => {
    router.push(`/tokens/${tokenId.toString()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Título */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
            <Package className="h-10 w-10 text-blue-600 dark:text-blue-400" />
            All Tokens
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Browse all tokens in the supply chain system
          </p>
        </div>

        {/* Filtros y Búsqueda */}
        <Card className="mb-8 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Búsqueda por nombre */}
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Search by name
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    type="text"
                    placeholder="Search tokens..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 dark:bg-slate-700 dark:text-slate-100"
                    aria-label="Search tokens by name"
                  />
                </div>
              </div>

              {/* Filtro por tipo */}
              <div className="space-y-2">
                <label htmlFor="filter-type" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Filter by type
                </label>
                <Select value={filterType} onValueChange={(value) => setFilterType(value as typeof filterType)}>
                  <SelectTrigger id="filter-type" className="dark:bg-slate-700 dark:text-slate-100" aria-label="Filter tokens by type">
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="raw">Raw Material</SelectItem>
                    <SelectItem value="finished">Finished Product</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Estadísticas de filtros */}
            <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
              Showing {filteredTokens.length} of {totalTokens} tokens
              {searchQuery && ` matching "${searchQuery}"`}
              {filterType !== 'all' && ` (${filterType === 'raw' ? 'Raw Material' : 'Finished Product'})`}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <Alert variant="destructive" className="mb-8 dark:bg-red-900/20 dark:border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="dark:text-red-400">
              Error loading tokens: {error.message || 'Unknown error occurred'}
            </AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredTokens.length === 0 && (
          <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            <CardContent className="pt-6 pb-6 text-center">
              <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                No tokens found
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your filters or search query'
                  : 'No tokens have been created yet'}
              </p>
              {/* Solo Producer y Factory aprobados pueden crear tokens (según el contrato) */}
              {userInfo && 
               (Number(userInfo.role) === UserRole.Producer || Number(userInfo.role) === UserRole.Factory) &&
               Number(userInfo.status) === UserStatus.Approved && (
                <Link href="/tokens/create">
                  <Button className="mt-2">
                    Create First Token
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}

        {/* Grid de Tokens */}
        {!isLoading && !error && filteredTokens.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {paginatedTokens.map((token) => (
                <TokenCard
                  key={token.id.toString()}
                  tokenId={token.tokenId}
                  showBalance={false}
                  onClick={() => handleTokenClick(token.tokenId)}
                />
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                  aria-label="Previous page"
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (currentPage <= 3) {
                      pageNum = i + 1
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = currentPage - 2 + i
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? 'default' : 'outline'}
                        onClick={() => setCurrentPage(pageNum)}
                        className="min-w-[40px] dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                        aria-label={`Go to page ${pageNum}`}
                        aria-current={currentPage === pageNum ? 'page' : undefined}
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                  aria-label="Next page"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

