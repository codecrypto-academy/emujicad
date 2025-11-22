'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAccount } from 'wagmi'
import { Header } from '@/components/Header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useCreateToken } from '@/hooks/useCreateToken'
import { useGetAllTokens, useGetTokenBalance } from '@/hooks/useGetUserTokens'
import { useIsPaused } from '@/hooks/usePause'
import { useAuth } from '@/contexts/AuthContext'
import { TokenType, UserRole, UserStatus } from '@/contracts/config'
import { ArrowLeft, Loader2, AlertTriangle, Pause, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default function CreateTokenPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { address, isConnected } = useAccount()
  const { isAuthenticated, userInfo, isLoading: isLoadingAuth } = useAuth()
  const { data: isPaused } = useIsPaused()
  const { tokens, isLoading: isLoadingTokens } = useGetAllTokens()
  const { createToken, isPending, isConfirming, isSuccess, error, hash } = useCreateToken()
  
  // Activar diseño moderno si está habilitado
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'

  // Form state
  const [name, setName] = useState('')
  const [totalSupply, setTotalSupply] = useState('')
  const [features, setFeatures] = useState('{}')
  const [parentId, setParentId] = useState<string>('')
  const [parentAmount, setParentAmount] = useState<string>('')
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  // Get token type from URL parameter
  const tokenTypeParam = searchParams.get('type')
  const tokenType = useMemo(() => {
    if (tokenTypeParam === 'raw') return TokenType.RowMaterial
    if (tokenTypeParam === 'product') return TokenType.FinishedProduct
    // Default based on user role if no param
    if (userInfo && Number(userInfo.role) === UserRole.Producer) return TokenType.RowMaterial
    if (userInfo && Number(userInfo.role) === UserRole.Factory) return TokenType.FinishedProduct
    return TokenType.RowMaterial
  }, [tokenTypeParam, userInfo])

  // Filter tokens for parent selection (only RowMaterial tokens for FinishedProduct)
  // Also filter out tokens where user has no balance (for better UX)
  const availableParentTokens = useMemo(() => {
    if (tokenType !== TokenType.FinishedProduct) return []
    return tokens.filter(token => Number(token.tokenType) === TokenType.RowMaterial)
  }, [tokens, tokenType])

  // Get balances for all available parent tokens to show in dropdown
  const parentTokensWithBalance = useMemo(() => {
    if (tokenType !== TokenType.FinishedProduct || !address) return []
    
    return availableParentTokens.map(token => ({
      ...token,
      // Note: We could fetch balances here, but it's expensive. 
      // Instead, we'll show balance after selection and disable if 0
    }))
  }, [availableParentTokens, tokenType, address])

  // Get balance of selected parent token
  const selectedParentId = parentId ? BigInt(parseInt(parentId, 10)) : undefined
  const { data: parentBalanceRaw, isLoading: isLoadingParentBalance } = useGetTokenBalance(
    selectedParentId,
    address
  )
  
  // Normalize parentBalance: ensure it's bigint | undefined (never null)
  const parentBalance: bigint | undefined = 
    parentBalanceRaw !== null && parentBalanceRaw !== undefined && typeof parentBalanceRaw === 'bigint'
      ? parentBalanceRaw
      : undefined

  // Mounted state to avoid hydration issues
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!mounted || isLoadingAuth) return
    
    if (!isConnected) {
      router.replace('/')
      return
    }
    
    if (!isAuthenticated || !userInfo) {
      router.replace('/')
      return
    }

    const userRole = Number(userInfo.role)
    const userStatus = Number(userInfo.status)
    
    // Only Producer and Factory with Approved status can create tokens
    if (
      (userRole !== UserRole.Producer && userRole !== UserRole.Factory) ||
      userStatus !== UserStatus.Approved
    ) {
      router.replace('/dashboard')
      return
    }

    // Validate token type matches user role
    if (userRole === UserRole.Producer && tokenType !== TokenType.RowMaterial) {
      router.replace('/tokens/create?type=raw')
      return
    }
    if (userRole === UserRole.Factory && tokenType !== TokenType.FinishedProduct) {
      router.replace('/tokens/create?type=product')
      return
    }
  }, [mounted, isConnected, isAuthenticated, isLoadingAuth, userInfo, tokenType, router])

  // Redirect on success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push('/tokens')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, router])

  // Real-time validation for parent balance
  useEffect(() => {
    if (tokenType === TokenType.FinishedProduct && parentId && parentAmount) {
      const errors: Record<string, string> = { ...formErrors }
      const amount = parseInt(parentAmount, 10)
      
      if (!isNaN(amount) && amount > 0) {
        if (parentBalance !== undefined && parentBalance !== null && typeof parentBalance === 'bigint') {
          if (BigInt(amount) > parentBalance) {
            errors.parentAmount = `Insufficient balance. You have ${parentBalance.toString()} tokens available.`
          } else {
            // Clear error if balance is sufficient
            delete errors.parentAmount
          }
        } else if (!isLoadingParentBalance) {
          // If balance is undefined and not loading, token might not exist
          errors.parentAmount = 'Unable to verify balance. Please check the parent token selection.'
        }
      }
      
      setFormErrors(errors)
    }
  }, [parentId, parentAmount, parentBalance, isLoadingParentBalance, tokenType])

  // Validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!name.trim()) {
      errors.name = 'Token name is required'
    } else if (name.trim().length < 2) {
      errors.name = 'Token name must be at least 2 characters'
    }

    const supply = parseInt(totalSupply, 10)
    if (!totalSupply || isNaN(supply) || supply <= 0) {
      errors.totalSupply = 'Total supply must be a positive number'
    }

    // Validate features is valid JSON
    if (features.trim()) {
      try {
        JSON.parse(features)
      } catch {
        errors.features = 'Features must be valid JSON'
      }
    }

    // For FinishedProduct, parentId and parentAmount are required
    if (tokenType === TokenType.FinishedProduct) {
      if (!parentId || parentId === '0') {
        errors.parentId = 'Parent token is required for finished products'
      } else if (parentBalance !== undefined && parentBalance === BigInt(0)) {
        errors.parentId = 'You have no balance for the selected token. Please select a different token or receive tokens first.'
      }
      
      const amount = parseInt(parentAmount, 10)
      if (!parentAmount || isNaN(amount) || amount <= 0) {
        if (parentBalance !== undefined && typeof parentBalance === 'bigint' && parentBalance === BigInt(0)) {
          errors.parentAmount = 'You have no balance for this token. You need to receive tokens first!'
        } else {
          errors.parentAmount = 'Parent amount must be a positive number'
        }
      } else if (parentBalance !== undefined && parentBalance !== null && typeof parentBalance === 'bigint') {
        if (parentBalance === BigInt(0)) {
          errors.parentAmount = 'You have no balance for this token. You need to receive tokens first!'
        } else if (BigInt(amount) > parentBalance) {
          errors.parentAmount = `Insufficient balance. You have ${parentBalance !== null && typeof parentBalance === 'bigint' ? parentBalance.toString() : '0'} tokens available. Maximum allowed: ${parentBalance !== null && typeof parentBalance === 'bigint' ? parentBalance.toString() : '0'}`
        }
      } else if (!isLoadingParentBalance) {
        // If balance is undefined and not loading, there might be an issue
        errors.parentAmount = 'Unable to verify balance. Please check the parent token selection.'
      }
    } else {
      // For RowMaterial, parentAmount must be 0
      if (parentAmount && parseInt(parentAmount, 10) !== 0) {
        errors.parentAmount = 'Raw materials do not consume parent tokens'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()

    if (!validateForm()) return
    if (isPaused === true) return

    const supply = BigInt(parseInt(totalSupply, 10))
    const parent = tokenType === TokenType.RowMaterial ? BigInt(0) : BigInt(parseInt(parentId, 10))
    const amount = tokenType === TokenType.RowMaterial ? BigInt(0) : BigInt(parseInt(parentAmount, 10))
    const featuresJson = features.trim() || '{}'

    createToken(name.trim(), tokenType, supply, featuresJson, parent, amount)
  }

  // Don't render until mounted
  if (!mounted || isLoadingAuth) {
    return null
  }

  // Don't render if not authorized (redirect in progress)
  if (!isConnected || !isAuthenticated || !userInfo) {
    return null
  }

  const userRole = Number(userInfo.role)
  const userStatus = Number(userInfo.status)
  
  if (
    (userRole !== UserRole.Producer && userRole !== UserRole.Factory) ||
    userStatus !== UserStatus.Approved
  ) {
    return null
  }

  // Check if submit button should be enabled
  // For FinishedProduct: button is enabled ONLY when:
  //   - Parent token is selected
  //   - Amount is entered and valid (greater than 0 and <= balance)
  //   - Balance is available and greater than 0
  // For RowMaterial: button is enabled when basic fields are filled (name, totalSupply)
  const canSubmit = tokenType === TokenType.FinishedProduct
    ? (
        parentId && 
        parentId !== '0' &&
        parentAmount &&
        !isNaN(parseInt(parentAmount, 10)) &&
        parentBalance !== undefined &&
        parentBalance !== null &&
        typeof parentBalance === 'bigint' &&
        parentBalance > BigInt(0) &&
        BigInt(parseInt(parentAmount, 10)) > BigInt(0) &&
        BigInt(parseInt(parentAmount, 10)) <= parentBalance
      )
    : (
        // For RowMaterial: basic validation (name and totalSupply)
        name.trim().length >= 2 &&
        totalSupply &&
        !isNaN(parseInt(totalSupply, 10)) &&
        parseInt(totalSupply, 10) > 0
      )

  // Form fields are disabled only during transaction or if paused
  // NOT disabled by balance (user should be able to select and see options)
  const isFormDisabled = isPending || isConfirming || isPaused === true
  const isLoading = isPending || isConfirming
  
  // Submit button is disabled if form is disabled OR cannot submit (invalid parent/amount)
  const isSubmitDisabled = isFormDisabled || !canSubmit

  // Diseño moderno 2025
  if (useModernDesign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <Header />

        <main className="container mx-auto px-4 py-12 max-w-2xl">
          <div className="mb-6">
            <Link href="/tokens">
              <Button variant="ghost" className="mb-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Tokens
              </Button>
            </Link>
          </div>

          <div className="group relative overflow-hidden rounded-3xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative p-8">
              <div className="mb-6">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 via-blue-700 to-purple-700 dark:from-slate-100 dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent mb-2">
                  {tokenType === TokenType.RowMaterial ? 'Create Raw Material Token' : 'Create Finished Product Token'}
                </h1>
                <p className="text-slate-600 dark:text-slate-400">
                  {tokenType === TokenType.RowMaterial
                    ? 'Create a new raw material token. This will be the base material for finished products.'
                    : 'Create a finished product token. Select a raw material token as the parent.'}
                </p>
              </div>

              {/* Alerts Modernos */}
              {isPaused === true && (
                <Alert className="mb-6 rounded-xl bg-yellow-50/80 dark:bg-yellow-900/30 backdrop-blur border-yellow-200 dark:border-yellow-800">
                  <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                  <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                    <strong>⚠️ Contrato Pausado:</strong> No puedes crear tokens mientras el contrato esté pausado.
                  </AlertDescription>
                </Alert>
              )}

              {isSuccess && (
                <Alert className="mb-6 rounded-xl bg-green-50/80 dark:bg-green-900/30 backdrop-blur border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    <strong>✅ Token creado exitosamente!</strong> Redirigiendo a la página de tokens...
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert className="mb-6 rounded-xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur border-red-200 dark:border-red-800">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    <strong>❌ Error:</strong> {error.message || 'Failed to create token. Please try again.'}
                  </AlertDescription>
                </Alert>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Token Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-medium">
                    Token Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Organic Cotton, Premium Wood"
                    disabled={isFormDisabled}
                    className={`rounded-xl border-2 transition-all ${formErrors.name ? 'border-red-500 focus:border-red-600' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400'}`}
                  />
                  {formErrors.name && (
                    <p className="text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>

                {/* Total Supply */}
                <div className="space-y-2">
                  <Label htmlFor="totalSupply" className="text-slate-700 dark:text-slate-300 font-medium">
                    Total Supply <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="totalSupply"
                    type="number"
                    min="1"
                    value={totalSupply}
                    onChange={(e) => setTotalSupply(e.target.value)}
                    placeholder="e.g., 1000"
                    disabled={isFormDisabled}
                    className={`rounded-xl border-2 transition-all ${formErrors.totalSupply ? 'border-red-500 focus:border-red-600' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400'}`}
                  />
                  {formErrors.totalSupply && (
                    <p className="text-sm text-red-500">{formErrors.totalSupply}</p>
                  )}
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    The total amount of tokens to create. Must be greater than 0.
                  </p>
                </div>

                {/* Parent Token (only for FinishedProduct) */}
                {tokenType === TokenType.FinishedProduct && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="parentId" className="text-slate-700 dark:text-slate-300 font-medium">
                        Parent Token (Raw Material) <span className="text-red-500">*</span>
                      </Label>
                      {isLoadingTokens ? (
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Loading available tokens...</span>
                        </div>
                      ) : availableParentTokens.length === 0 ? (
                        <div className="p-4 rounded-xl bg-yellow-50/80 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800">
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            No raw material tokens available. You need to create a raw material token first.
                          </p>
                        </div>
                      ) : (
                        <>
                          <Select
                            value={parentId}
                            onValueChange={(value) => {
                              setParentId(value)
                              setParentAmount('')
                            }}
                            disabled={isFormDisabled}
                          >
                            <SelectTrigger className={`rounded-xl border-2 transition-all ${formErrors.parentId ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'}`}>
                              <SelectValue placeholder="Select a raw material token" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                              {availableParentTokens.map((token) => (
                                <SelectItem key={token.tokenId.toString()} value={token.tokenId.toString()}>
                                  {token.name} (ID: {token.tokenId.toString()})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formErrors.parentId && (
                            <p className="text-sm text-red-500">{formErrors.parentId}</p>
                          )}
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            Select the raw material token that will be used to create this finished product.
                          </p>
                        </>
                      )}
                    </div>

                    {/* Parent Amount */}
                    {parentId && parentId !== '0' && (
                      <div className="space-y-2">
                        <Label htmlFor="parentAmount" className="text-slate-700 dark:text-slate-300 font-medium">
                          Amount of Raw Material to Consume <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="parentAmount"
                          type="number"
                          min="1"
                          max={parentBalance !== undefined && parentBalance !== null && typeof parentBalance === 'bigint' ? Number(parentBalance) : undefined}
                          value={parentAmount}
                          onChange={(e) => {
                            const value = e.target.value
                            if (parentBalance !== undefined && parentBalance !== null && typeof parentBalance === 'bigint' && parentBalance === BigInt(0)) return
                            if (parentBalance !== undefined && parentBalance !== null && typeof parentBalance === 'bigint' && value) {
                              const numValue = parseInt(value, 10)
                              if (!isNaN(numValue) && numValue > Number(parentBalance)) {
                                setParentAmount(parentBalance !== null && typeof parentBalance === 'bigint' ? parentBalance.toString() : '0')
                                return
                              }
                            }
                            setParentAmount(value)
                          }}
                          placeholder="e.g., 100"
                          disabled={isFormDisabled || isLoadingParentBalance || (parentBalance !== undefined && typeof parentBalance === 'bigint' && parentBalance === BigInt(0))}
                          className={`rounded-xl border-2 transition-all ${formErrors.parentAmount ? 'border-red-500 focus:border-red-600' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400'}`}
                        />
                        {formErrors.parentAmount && (
                          <p className="text-sm text-red-500">{formErrors.parentAmount}</p>
                        )}
                        {isLoadingParentBalance ? (
                          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span className="text-sm">Loading balance...</span>
                          </div>
                        ) : parentBalance !== undefined && parentBalance !== null && typeof parentBalance === 'bigint' ? (
                          <div className="space-y-1 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50">
                            <p className={`text-sm ${parentBalance === BigInt(0) ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                              Your available balance: <span className={`font-semibold ${parentBalance === BigInt(0) ? 'text-red-700 dark:text-red-300' : 'text-slate-700 dark:text-slate-300'}`}>{parentBalance !== null && typeof parentBalance === 'bigint' ? parentBalance.toString() : '0'}</span> tokens.
                              {parentBalance === BigInt(0) && (
                                <span className="ml-2 text-red-600 dark:text-red-400">⚠️ You need to receive tokens first!</span>
                              )}
                            </p>
                            {parentAmount && parseInt(parentAmount, 10) > 0 && parentBalance !== undefined && parentBalance !== null && typeof parentBalance === 'bigint' && parentBalance > BigInt(0) && (
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                After creation: <span className="font-semibold text-slate-700 dark:text-slate-300">
                                  {parentBalance !== undefined && parentBalance !== null && typeof parentBalance === 'bigint' 
                                  ? (parentBalance - BigInt(parseInt(parentAmount, 10) || 0) < BigInt(0) ? '0' : (parentBalance - BigInt(parseInt(parentAmount, 10) || 0)).toString())
                                  : '0'}
                                </span> tokens remaining.
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-yellow-600 dark:text-yellow-400 p-3 rounded-xl bg-yellow-50/80 dark:bg-yellow-900/30">
                            ⚠️ Unable to verify balance. Please check the parent token selection.
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {/* Features */}
                <div className="space-y-2">
                  <Label htmlFor="features" className="text-slate-700 dark:text-slate-300 font-medium">
                    Features (JSON) <span className="text-slate-400">(optional)</span>
                  </Label>
                  <Textarea
                    id="features"
                    value={features}
                    onChange={(e) => setFeatures(e.target.value)}
                    placeholder='{"color": "blue", "size": "large", "quality": "premium"}'
                    disabled={isFormDisabled}
                    rows={4}
                    className={`rounded-xl border-2 transition-all font-mono text-sm ${formErrors.features ? 'border-red-500 focus:border-red-600' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400'}`}
                  />
                  {formErrors.features && (
                    <p className="text-sm text-red-500">{formErrors.features}</p>
                  )}
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Additional token features in JSON format. Leave empty or use {'{}'} for no features.
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isSubmitDisabled}
                    className={`flex-1 rounded-xl transition-all shadow-lg ${
                      isSubmitDisabled && !isLoading
                        ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-xl'
                    }`}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isConfirming ? 'Confirming...' : 'Creating...'}
                      </>
                    ) : (
                      'Create Token'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                    className="rounded-xl"
                  >
                    Cancel
                  </Button>
                </div>

                {hash && (
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Transaction Hash: <span className="font-mono text-xs">{hash}</span>
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Diseño original
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href="/tokens">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tokens
            </Button>
          </Link>
        </div>

        <Card className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              {tokenType === TokenType.RowMaterial ? 'Create Raw Material Token' : 'Create Finished Product Token'}
            </CardTitle>
            <CardDescription>
              {tokenType === TokenType.RowMaterial
                ? 'Create a new raw material token. This will be the base material for finished products.'
                : 'Create a finished product token. Select a raw material token as the parent.'}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Paused Alert */}
            {isPaused === true && (
              <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                  <strong>⚠️ Contrato Pausado:</strong> No puedes crear tokens mientras el contrato esté pausado.
                </AlertDescription>
              </Alert>
            )}

            {/* Success Alert */}
            {isSuccess && (
              <Alert className="mb-6 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-700 dark:text-green-300">
                  <strong>✅ Token creado exitosamente!</strong> Redirigiendo a la página de tokens...
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert className="mb-6 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  <strong>❌ Error:</strong>{' '}
                  {error.message || 'Failed to create token. Please try again.'}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Token Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Token Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Organic Cotton, Premium Wood"
                  disabled={isFormDisabled}
                  className={formErrors.name ? 'border-red-500' : ''}
                />
                {formErrors.name && (
                  <p className="text-sm text-red-500">{formErrors.name}</p>
                )}
              </div>

              {/* Total Supply */}
              <div className="space-y-2">
                <Label htmlFor="totalSupply">
                  Total Supply <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="totalSupply"
                  type="number"
                  min="1"
                  value={totalSupply}
                  onChange={(e) => setTotalSupply(e.target.value)}
                  placeholder="e.g., 1000"
                  disabled={isFormDisabled}
                  className={formErrors.totalSupply ? 'border-red-500' : ''}
                />
                {formErrors.totalSupply && (
                  <p className="text-sm text-red-500">{formErrors.totalSupply}</p>
                )}
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  The total amount of tokens to create. Must be greater than 0.
                </p>
              </div>

              {/* Parent Token (only for FinishedProduct) */}
              {tokenType === TokenType.FinishedProduct && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="parentId">
                      Parent Token (Raw Material) <span className="text-red-500">*</span>
                    </Label>
                    {isLoadingTokens ? (
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-sm">Loading available tokens...</span>
                      </div>
                    ) : availableParentTokens.length === 0 ? (
                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          No raw material tokens available. You need to create a raw material token first.
                        </p>
                      </div>
                    ) : (
                      <>
                        <Select
                          value={parentId}
                          onValueChange={(value) => {
                            setParentId(value)
                            setParentAmount('') // Reset amount when parent changes
                          }}
                          disabled={isFormDisabled}
                        >
                          <SelectTrigger className={formErrors.parentId ? 'border-red-500' : ''}>
                            <SelectValue placeholder="Select a raw material token" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableParentTokens.map((token) => (
                              <SelectItem key={token.tokenId.toString()} value={token.tokenId.toString()}>
                                {token.name} (ID: {token.tokenId.toString()})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formErrors.parentId && (
                          <p className="text-sm text-red-500">{formErrors.parentId}</p>
                        )}
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Select the raw material token that will be used to create this finished product.
                        </p>
                      </>
                    )}
                  </div>

                  {/* Parent Amount (only for FinishedProduct) */}
                  {parentId && parentId !== '0' && (
                    <div className="space-y-2">
                      <Label htmlFor="parentAmount">
                        Amount of Raw Material to Consume <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="parentAmount"
                        type="number"
                        min="1"
                        max={parentBalance !== undefined ? Number(parentBalance) : undefined}
                        value={parentAmount}
                        onChange={(e) => {
                          const value = e.target.value
                          // Si no hay balance, no permitir escribir
                          if (parentBalance !== undefined && parentBalance !== null && typeof parentBalance === 'bigint' && parentBalance === BigInt(0)) {
                            return
                          }
                          // Si hay balance, validar que no exceda el máximo
                          if (parentBalance !== undefined && parentBalance !== null && typeof parentBalance === 'bigint' && value) {
                            const numValue = parseInt(value, 10)
                            if (!isNaN(numValue) && numValue > Number(parentBalance)) {
                              // Limitar al máximo disponible
                              setParentAmount(parentBalance.toString())
                              return
                            }
                          }
                          setParentAmount(value)
                        }}
                        placeholder="e.g., 100"
                        disabled={isFormDisabled || isLoadingParentBalance || (parentBalance !== undefined && parentBalance === BigInt(0))}
                        className={formErrors.parentAmount ? 'border-red-500' : ''}
                      />
                      {formErrors.parentAmount && (
                        <p className="text-sm text-red-500">{formErrors.parentAmount}</p>
                      )}
                      {isLoadingParentBalance ? (
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-sm">Loading balance...</span>
                        </div>
                      ) : parentBalance !== undefined && typeof parentBalance === 'bigint' ? (
                        <div className="space-y-1">
                          <p className={`text-sm ${parentBalance === BigInt(0) ? 'text-red-600 dark:text-red-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                            Your available balance: <span className={`font-semibold ${parentBalance === BigInt(0) ? 'text-red-700 dark:text-red-300' : 'text-slate-700 dark:text-slate-300'}`}>{parentBalance.toString()}</span> tokens.
                            {parentBalance === BigInt(0) && (
                              <span className="ml-2 text-red-600 dark:text-red-400">⚠️ You need to receive tokens first!</span>
                            )}
                          </p>
                          {parentAmount && parseInt(parentAmount, 10) > 0 && parentBalance > BigInt(0) && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              After creation: <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {parentBalance !== undefined && parentBalance !== null && typeof parentBalance === 'bigint' 
                                  ? (parentBalance - BigInt(parseInt(parentAmount, 10) || 0) < BigInt(0) ? '0' : (parentBalance - BigInt(parseInt(parentAmount, 10) || 0)).toString())
                                  : '0'}
                              </span> tokens remaining.
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-yellow-600 dark:text-yellow-400">
                          ⚠️ Unable to verify balance. Please check the parent token selection.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Features (JSON) */}
              <div className="space-y-2">
                <Label htmlFor="features">
                  Features (JSON) <span className="text-slate-400">(optional)</span>
                </Label>
                <Textarea
                  id="features"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  placeholder='{"color": "blue", "size": "large", "quality": "premium"}'
                  disabled={isFormDisabled}
                  rows={4}
                  className={formErrors.features ? 'border-red-500 font-mono text-sm' : 'font-mono text-sm'}
                />
                {formErrors.features && (
                  <p className="text-sm text-red-500">{formErrors.features}</p>
                )}
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Additional token features in JSON format. Leave empty or use {'{}'} for no features.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitDisabled}
                  className={`flex-1 ${
                    isSubmitDisabled && !isLoading
                      ? 'bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-60'
                      : 'bg-black dark:bg-white text-white dark:text-black hover:bg-slate-800 dark:hover:bg-slate-200'
                  }`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isConfirming ? 'Confirming...' : 'Creating...'}
                    </>
                  ) : (
                    'Create Token'
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>

              {/* Transaction Hash */}
              {hash && (
                <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Transaction Hash: <span className="font-mono text-xs">{hash}</span>
                  </p>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

