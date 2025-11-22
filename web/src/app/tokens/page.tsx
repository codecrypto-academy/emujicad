'use client'

import { Header } from '@/components/Header'
import { TokenCard } from '@/components/TokenCard'
import { TokenCardModern } from '@/components/TokenCardModern'
import { useGetUserTokensWithData } from '@/hooks/useGetUserTokensWithData'
import { useIsPaused } from '@/hooks/usePause'
import { useAuth } from '@/contexts/AuthContext'
import { useContractOwner } from '@/hooks/useContractOwner'
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
  const { isAuthenticated, isLoading: isLoadingAuth, userInfo, isAdmin: isAdminFromAuth } = useAuth()
  
  // CRÍTICO: TODOS los hooks deben estar ANTES de cualquier return condicional
  // Esto previene el error "Rendered more hooks than during the previous render"
  // ORDEN FIJO: useState, hooks de datos, useEffect, useMemo
  
  // 1. TODOS los useState juntos (DEBEN estar todos juntos al principio)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  // Inicializar filtro con valor por defecto (sin depender de variables que pueden cambiar)
  const [filterType, setFilterType] = useState<'all' | 'raw' | 'finished'>('all')
  const tokensPerPage = 12
  
  // Activar diseño moderno si está habilitado
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'
  
  // 2. Hooks de datos - se ejecutan siempre, pero se deshabilitan si no está autenticado
  // Usar isAuthenticated para habilitar/deshabilitar consultas
  const shouldFetchData = isConnected && !isLoadingAuth && isAuthenticated
  
  const { owner, isLoading: isLoadingOwner } = useContractOwner(shouldFetchData)
  const { tokens, isLoading, error, totalTokens } = useGetUserTokensWithData(
    shouldFetchData ? address : undefined
  )
  const { data: isPaused } = useIsPaused(shouldFetchData)
  
  // Verificación directa de admin (más rápida que esperar por AuthContext)
  const isAdminDirect = address && owner && address.toLowerCase() === owner.toLowerCase()
  const isAdmin = isAdminDirect || isAdminFromAuth
  const isLoadingAdminCheck = isLoadingOwner || isLoadingAuth
  
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
  
  // 3. TODOS los useEffect juntos (DEBEN estar todos juntos, antes de cualquier return)
  useEffect(() => {
    setMounted(true)
  }, [])

  // CRÍTICO: Redirigir INMEDIATAMENTE si no está conectado o no está autenticado
  // NO esperar a que termine de cargar - redirigir tan pronto como sepamos que no está autorizado
  useEffect(() => {
    if (!mounted) return
    
    // Si no está conectado, redirigir inmediatamente
    if (!isConnected) {
      router.replace('/')
      return
    }
    
    // Si ya terminó de cargar y no está autenticado, redirigir INMEDIATAMENTE
    // No esperar más - si isLoadingAuth es false y isAuthenticated es false, redirigir
    if (!isLoadingAuth && !isAuthenticated) {
      router.replace('/')
      return
    }
  }, [mounted, isConnected, isAuthenticated, isLoadingAuth, router])
  
  // Redirigir si es Administrador (después de verificar autenticación)
  useEffect(() => {
    if (!mounted || isLoadingAdminCheck) return
    
    // Administrador (owner del contrato) no maneja tokens, redirigir al dashboard
    if (isAdmin) {
      router.replace('/dashboard')
      return
    }
  }, [mounted, isLoadingAdminCheck, isAdmin, router])
  
  // Inicializar filtro según el rol (usar useEffect en lugar de función inicializadora)
  useEffect(() => {
    if (isProducer) {
      setFilterType('raw')
    } else if (isRetailer || isConsumer) {
      setFilterType('finished')
    } else if (isFactory) {
      setFilterType('all')
    }
  }, [isProducer, isFactory, isRetailer, isConsumer])
  
  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [filterType, searchQuery])
  
  // Debug: verificar que la variable se lea (solo en desarrollo)
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[TokensPage] NEXT_PUBLIC_MODERN_DESIGN:', process.env.NEXT_PUBLIC_MODERN_DESIGN)
      console.log('[TokensPage] useModernDesign:', useModernDesign)
    }
  }, [useModernDesign])

  // 4. TODOS los useMemo juntos (DEBEN estar ANTES de cualquier return condicional)
  // Función para normalizar strings (remover acentos y convertir a minúsculas)
  const normalizeString = (str: string): string => {
    return str
      .toLowerCase()
      .normalize('NFD') // Descompone caracteres con acentos
      .replace(/[\u0300-\u036f]/g, '') // Remueve diacríticos (acentos)
      .trim()
  }

  // Filtrar tokens por tipo y búsqueda
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

  // Paginación
  const totalPages = Math.ceil(filteredTokens.length / tokensPerPage)
  const startIndex = (currentPage - 1) * tokensPerPage
  const endIndex = startIndex + tokensPerPage
  const paginatedTokens = filteredTokens.slice(startIndex, endIndex)

  // CRÍTICO: Early return DESPUÉS de TODOS los hooks (useState, hooks de datos, useEffect, useMemo)
  // Esto previene cualquier renderizado innecesario
  if (!mounted || !isConnected) {
    return null
  }
  
  // CRÍTICO: Si ya terminó de cargar y no está autenticado, redirigir INMEDIATAMENTE
  // No esperar más - mostrar null mientras se redirige
  if (!isLoadingAuth && !isAuthenticated) {
    return null // Redirección en progreso
  }
  
  // Si aún está cargando, mostrar null (no hacer consultas todavía)
  if (isLoadingAuth) {
    return null
  }

  // Si es Administrador, NO renderizar nada (redirección en progreso)
  if (isAdmin) {
    return null
  }

  const handleTokenClick = (tokenId: bigint) => {
    router.push(`/tokens/${tokenId.toString()}`)
  }

  // Diseño moderno 2025
  if (useModernDesign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <Header />
        
        <div className="container mx-auto px-4 py-12 max-w-7xl">
          {/* Título moderno con animación */}
          <div className="mb-12 flex items-start justify-between animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="space-y-3">
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent mb-2 flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20 backdrop-blur-sm border border-blue-200/50 dark:border-blue-500/30">
                  <Package className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                </div>
                My Tokens
              </h1>
              <p className="text-slate-600 dark:text-slate-400 text-lg font-light">
                Manage your digital assets in the supply chain
              </p>
            </div>
            {userInfo && 
             (Number(userInfo.role) === UserRole.Producer || Number(userInfo.role) === UserRole.Factory) &&
             Number(userInfo.status) === UserStatus.Approved && (
              <Link 
                href={Number(userInfo.role) === UserRole.Producer ? "/tokens/create?type=raw" : "/tokens/create?type=product"}
                prefetch={true}
              >
                <Button 
                  type="button"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 rounded-xl px-6 py-6 text-base font-medium"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Token
                </Button>
              </Link>
            )}
          </div>

          {/* Filtros modernos con glassmorphism */}
          <Card className="mb-10 border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-800 dark:text-slate-100 text-xl">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                  <Filter className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`grid grid-cols-1 ${shouldShowTypeFilter ? 'md:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
                {/* Búsqueda moderna */}
                <div className="space-y-3">
                  <label htmlFor="search" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Search by name
                  </label>
                  <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search tokens..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-12 pr-12 h-14 bg-slate-50/50 dark:bg-slate-900/50 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-300 text-base"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 text-xl font-bold leading-none transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Filtro por tipo - Solo Factory */}
                {shouldShowTypeFilter && (
                  <div className="space-y-3">
                    <label htmlFor="filter-type" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Filter by type
                    </label>
                    <Select value={filterType} onValueChange={(value) => setFilterType(value as typeof filterType)}>
                      <SelectTrigger 
                        id="filter-type" 
                        className="h-14 bg-slate-50/50 dark:bg-slate-900/50 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-2xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:focus:ring-blue-400/20 transition-all duration-300 text-base"
                      >
                        <SelectValue placeholder="All types" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="raw">Raw Material</SelectItem>
                        <SelectItem value="finished">Finished Product</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              {/* Estadísticas modernas */}
              <div className="mt-6 flex items-center justify-between pt-6 border-t border-slate-200/50 dark:border-slate-700/50">
                <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  <span className="text-slate-900 dark:text-slate-100 font-bold text-base">{filteredTokens.length}</span> of <span className="text-slate-900 dark:text-slate-100 font-bold">{totalTokens}</span> token{totalTokens !== 1 ? 's' : ''}
                  {searchQuery && (
                    <span className="ml-2 text-blue-600 dark:text-blue-400">matching "{searchQuery}"</span>
                  )}
                  {shouldShowTypeFilter && filterType !== 'all' && (
                    <span className="ml-2 text-purple-600 dark:text-purple-400">({filterType === 'raw' ? 'Raw Material' : 'Finished Product'})</span>
                  )}
                </div>
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
                    className="rounded-xl border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
                  >
                    Clear Filters
                  </Button>
                )}
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
                    className="rounded-xl border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
                  >
                    Clear Search
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Loading State Moderno */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-lg rounded-3xl overflow-hidden animate-pulse">
                  <CardHeader className="pb-3">
                    <Skeleton className="h-6 w-3/4 rounded-xl" />
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Skeleton className="h-4 w-full rounded-lg" />
                    <Skeleton className="h-4 w-2/3 rounded-lg" />
                    <Skeleton className="h-4 w-1/2 rounded-lg" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Error State Moderno */}
          {error && !isLoading && (
            <Card className="mb-8 border-0 bg-red-50/70 dark:bg-red-900/20 backdrop-blur-xl shadow-xl rounded-3xl border-red-200/50 dark:border-red-800/50">
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-300">Error loading tokens</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{error.message || 'Unknown error occurred'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Empty State Moderno */}
          {!isLoading && !error && filteredTokens.length === 0 && (
            <Card className="border-0 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="pt-16 pb-16 text-center">
                <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-400/20 dark:to-purple-400/20 mb-6">
                  <Package className="h-12 w-12 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-3">
                  No tokens found
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
                  {searchQuery || (shouldShowTypeFilter && filterType !== 'all') ? (
                    'No tokens match your search criteria. Try adjusting your filters.'
                  ) : (
                    "You don't own any tokens yet. Create or receive tokens to see them here."
                  )}
                </p>
                {userInfo && 
                 (Number(userInfo.role) === UserRole.Producer || Number(userInfo.role) === UserRole.Factory) &&
                 Number(userInfo.status) === UserStatus.Approved && (
                  <Link href={Number(userInfo.role) === UserRole.Producer ? "/tokens/create?type=raw" : "/tokens/create?type=product"}>
                    <Button className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-300 rounded-xl px-8 py-6 text-base font-medium">
                      {totalTokens === 0 ? 'Create First Token' : 'Create New Token'}
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>
          )}

          {/* Grid de Tokens Moderno */}
          {!isLoading && !error && filteredTokens.length > 0 && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-10">
                {paginatedTokens.map((token, index) => (
                  <div
                    key={token.id.toString()}
                    className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TokenCardModern
                      tokenId={token.tokenId}
                      showBalance={true}
                      onClick={() => handleTokenClick(token.tokenId)}
                    />
                  </div>
                ))}
              </div>

              {/* Paginación Moderna */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-12">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="rounded-xl border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 disabled:opacity-50"
                  >
                    Previous
                  </Button>
                  
                  <div className="flex items-center gap-2">
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
                          className={`min-w-[44px] rounded-xl border-2 transition-all duration-300 ${
                            currentPage === pageNum
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
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
                    className="rounded-xl border-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300 disabled:opacity-50"
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

  // Diseño original
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

