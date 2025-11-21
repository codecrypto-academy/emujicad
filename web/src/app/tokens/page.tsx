'use client'

import { Header } from '@/components/Header'
import { TokenCard } from '@/components/TokenCard'
import { useGetUserTokensWithData } from '@/hooks/useGetUserTokensWithData'
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
import { Package, Search, Filter, AlertCircle, Loader2, Plus } from 'lucide-react'
import { TokenType, UserRole, UserStatus } from '@/contracts/config'
import Link from 'next/link'
import { DebugTokens } from './debug-tokens'

export default function TokensPage() {
  const router = useRouter()
  const { address, isConnected } = useAccount()
  const { isAuthenticated, isLoading: isLoadingAuth, userInfo } = useAuth()
  const { tokens, isLoading, error, totalTokens } = useGetUserTokensWithData(address)
  const { data: isPaused } = useIsPaused()
  
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Determinar el rol del usuario y configurar filtros según el rol
  const userRole = userInfo ? Number(userInfo.role) : null
  const isProducer = userRole === UserRole.Producer
  const isFactory = userRole === UserRole.Factory
  const isRetailer = userRole === UserRole.Retailer
  const isConsumer = userRole === UserRole.Consumer
  
  // Producer: solo puede tener materia prima, no necesita filtro
  // Factory: puede tener ambos tipos, necesita filtro
  // Retailer/Consumer: solo productos terminados, no necesitan filtro
  const shouldShowTypeFilter = isFactory
  
  // Inicializar filtro según el rol
  const [filterType, setFilterType] = useState<'all' | 'raw' | 'finished'>(() => {
    if (isProducer) return 'raw' // Producer solo ve materia prima
    if (isRetailer || isConsumer) return 'finished' // Retailer/Consumer solo ven productos terminados
    return 'all' // Factory ve todos por defecto
  })
  
  const [currentPage, setCurrentPage] = useState(1)
  const tokensPerPage = 12

  useEffect(() => {
    setMounted(true)
  }, [])

  // Función para normalizar strings (remover acentos y convertir a minúsculas)
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize('NFD') // Descompone caracteres con acentos
      .replace(/[\u0300-\u036f]/g, '') // Remueve diacríticos (acentos)
      .trim()
  }

  // Filtrar tokens por tipo y búsqueda (DEBE estar antes de cualquier return condicional)
  const filteredTokens = useMemo(() => {
    if (!tokens || tokens.length === 0) return []

    return tokens.filter((token) => {
      // Filtro por tipo según rol
      // Producer: solo materia prima (ya está filtrado por el estado inicial, pero por seguridad)
      if (isProducer && Number(token.tokenType) !== TokenType.RowMaterial) {
        return false
      }
      // Retailer/Consumer: solo productos terminados
      if ((isRetailer || isConsumer) && Number(token.tokenType) !== TokenType.FinishedProduct) {
        return false
      }
      // Factory: aplicar filtro seleccionado
      if (isFactory) {
        if (filterType === 'raw' && Number(token.tokenType) !== TokenType.RowMaterial) {
          return false
        }
        if (filterType === 'finished' && Number(token.tokenType) !== TokenType.FinishedProduct) {
          return false
        }
      }

      // Filtro por búsqueda (nombre) - aplica solo si hay query
      if (searchQuery.trim()) {
        const query = normalizeString(searchQuery)
        const tokenName = normalizeString(token.name || '')
        // Búsqueda más flexible: incluye coincidencias parciales y maneja acentos
        if (!tokenName.includes(query)) {
          return false
        }
      }

      return true
    })
  }, [tokens, filterType, searchQuery, isProducer, isFactory, isRetailer, isConsumer])

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
        {/* Debug Info - Solo si está explícitamente habilitado */}
        {process.env.NEXT_PUBLIC_DEBUG_TOKENS === 'true' && (
          <div className="mb-6">
            <DebugTokens />
          </div>
        )}

        {/* Título */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Package className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              My Tokens
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              View and manage your tokens in the supply chain
            </p>
          </div>
          {/* Botón para crear token - Solo para Producer y Factory aprobados */}
          {userInfo && 
           (Number(userInfo.role) === UserRole.Producer || Number(userInfo.role) === UserRole.Factory) &&
           Number(userInfo.status) === UserStatus.Approved && (
            <Link 
              href={Number(userInfo.role) === UserRole.Producer ? "/tokens/create?type=raw" : "/tokens/create?type=product"}
              prefetch={true}
            >
              <Button 
                type="button"
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Token
              </Button>
            </Link>
          )}
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
            <div className={`grid grid-cols-1 ${shouldShowTypeFilter ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-4`}>
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
                    placeholder="Type to search tokens by name (no Enter needed)..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                    }}
                    onKeyDown={(e) => {
                      // Permitir Enter para limpiar si está vacío, pero no es necesario para buscar
                      if (e.key === 'Enter') {
                        e.preventDefault()
                      }
                    }}
                    className="pl-10 pr-10 dark:bg-slate-700 dark:text-slate-100"
                    aria-label="Search tokens by name (searches as you type)"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl font-bold leading-none"
                      aria-label="Clear search"
                      title="Clear search"
                    >
                      ×
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      🔍 Searching for: &quot;<strong>{searchQuery}</strong>&quot;
                    </p>
                    {!isLoading && filteredTokens.length > 0 && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✓ {filteredTokens.length} found
                      </span>
                    )}
                    {!isLoading && filteredTokens.length === 0 && totalTokens > 0 && (
                      <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                        ⚠ No matches
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Filtro por tipo - Solo visible para Factory */}
              {shouldShowTypeFilter && (
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
              )}
            </div>

            {/* Estadísticas de filtros */}
            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Showing {filteredTokens.length} of {totalTokens} token{totalTokens !== 1 ? 's' : ''} you own
                {searchQuery && ` matching "${searchQuery}"`}
                {shouldShowTypeFilter && filterType !== 'all' && ` (${filterType === 'raw' ? 'Raw Material' : 'Finished Product'})`}
                {!shouldShowTypeFilter && isProducer && ' (Raw Material)'}
                {!shouldShowTypeFilter && (isRetailer || isConsumer) && ' (Finished Product)'}
              </div>
              {/* Botón Clear Filters - Solo para Factory cuando hay filtros activos */}
              {shouldShowTypeFilter && (searchQuery || filterType !== 'all') && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSearchQuery('')
                    setFilterType('all')
                  }}
                  className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                >
                  Clear Filters
                </Button>
              )}
              {/* Botón Clear Filters - Solo búsqueda para otros roles */}
              {!shouldShowTypeFilter && searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setSearchQuery('')
                  }}
                  className="dark:bg-slate-700 dark:text-slate-100 dark:border-slate-600"
                >
                  Clear Search
                </Button>
              )}
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
                {searchQuery || filterType !== 'all' ? (
                  <>
                    No tokens match your search criteria.
                    {totalTokens > 0 && (
                      <span className="block mt-2 text-sm">
                        You own {totalTokens} token{totalTokens !== 1 ? 's' : ''}, but none match &quot;{searchQuery}&quot; 
                        {filterType !== 'all' && ` with type "${filterType === 'raw' ? 'Raw Material' : 'Finished Product'}"`}.
                      </span>
                    )}
                    {totalTokens > 0 && tokens.length > 0 && (
                      <details className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                        <summary className="cursor-pointer hover:text-slate-700 dark:hover:text-slate-300">
                          Your token names: {tokens.map(t => t.name).join(', ')}
                        </summary>
                      </details>
                    )}
                    <span className="block mt-2 text-sm font-medium">
                      Try adjusting your filters or search query.
                    </span>
                  </>
                ) : (
                  'You don\'t own any tokens yet. Create or receive tokens to see them here.'
                )}
              </p>
              {/* Solo Producer y Factory aprobados pueden crear tokens (según el contrato) */}
              {userInfo && 
               (Number(userInfo.role) === UserRole.Producer || Number(userInfo.role) === UserRole.Factory) &&
               Number(userInfo.status) === UserStatus.Approved && (
                <Link href={Number(userInfo.role) === UserRole.Producer ? "/tokens/create?type=raw" : "/tokens/create?type=product"}>
                  <Button className="mt-2">
                    {totalTokens === 0 ? 'Create First Token' : 'Create New Token'}
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
                  showBalance={true}
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

