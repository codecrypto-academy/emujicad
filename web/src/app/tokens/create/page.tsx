'use client'

import { useState, useEffect, useMemo } from 'react'
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
  const availableParentTokens = useMemo(() => {
    if (tokenType !== TokenType.FinishedProduct) return []
    return tokens.filter(token => Number(token.tokenType) === TokenType.RowMaterial)
  }, [tokens, tokenType])

  // Get balance of selected parent token
  const selectedParentId = parentId ? BigInt(parseInt(parentId, 10)) : undefined
  const { data: parentBalance, isLoading: isLoadingParentBalance } = useGetTokenBalance(
    selectedParentId,
    address
  )

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
      }
      
      const amount = parseInt(parentAmount, 10)
      if (!parentAmount || isNaN(amount) || amount <= 0) {
        errors.parentAmount = 'Parent amount must be a positive number'
      } else if (parentBalance !== undefined && BigInt(amount) > parentBalance) {
        errors.parentAmount = `Insufficient balance. You have ${parentBalance.toString()} tokens available.`
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

  const isFormDisabled = isPending || isConfirming || isPaused === true
  const isLoading = isPending || isConfirming

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
                        value={parentAmount}
                        onChange={(e) => setParentAmount(e.target.value)}
                        placeholder="e.g., 100"
                        disabled={isFormDisabled || isLoadingParentBalance}
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
                      ) : parentBalance !== undefined ? (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Your available balance: <span className="font-semibold text-slate-700 dark:text-slate-300">{parentBalance.toString()}</span> tokens.
                          {parentAmount && parseInt(parentAmount, 10) > 0 && (
                            <span className="ml-2">
                              After creation: <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {parentBalance - BigInt(parseInt(parentAmount, 10) || 0) < BigInt(0) ? '0' : (parentBalance - BigInt(parseInt(parentAmount, 10) || 0)).toString()}
                              </span> tokens remaining.
                            </span>
                          )}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Specify how many raw material tokens will be consumed to create this finished product.
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
                  disabled={isFormDisabled}
                  className="flex-1"
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

