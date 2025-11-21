'use client'

import { useState } from 'react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRequestRole } from '@/hooks/useRequestRole'
import { useIsPaused } from '@/hooks/usePause'
import { useAccount } from 'wagmi'
import { Pause, AlertTriangle } from 'lucide-react'

type RoleType = 'Producer' | 'Factory' | 'Retailer' | 'Consumer' | ''

interface RegisterFormProps {
  onRegistrationSuccess?: () => void
}

export function RegisterForm({ onRegistrationSuccess }: RegisterFormProps = {}) {
  const [selectedRole, setSelectedRole] = useState<RoleType>('')
  const { address } = useAccount()
  const { data: isPaused } = useIsPaused()
  const { requestRole, isPending: isTransactionPending, isConfirming, isSuccess, error, hash } = useRequestRole()
  
  // Refetch user info cuando el registro es exitoso
  React.useEffect(() => {
    if (isSuccess && onRegistrationSuccess) {
      // Refetch inmediatamente y luego de nuevo después de un delay
      // Esto asegura que la blockchain se haya actualizado
      onRegistrationSuccess()
      const timer1 = setTimeout(() => {
        onRegistrationSuccess()
      }, 1000) // 1 segundo
      const timer2 = setTimeout(() => {
        onRegistrationSuccess()
      }, 3000) // 3 segundos
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [isSuccess, onRegistrationSuccess])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selectedRole) return
    
    requestRole(selectedRole)
  }

  if (isSuccess) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-700">✅ Registration Submitted!</CardTitle>
          <CardDescription>
            Your request for <span className="font-semibold">{selectedRole}</span> role has been sent to the administrator
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-green-700 mb-3">
            Please wait for the administrator to review your request.
          </p>
          <p className="text-xs text-muted-foreground">
            💡 Reload the page to see your registration status
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>🆕 Register as User</CardTitle>
        <CardDescription>Choose your role in the supply chain</CardDescription>
      </CardHeader>
      <CardContent>
        {isPaused ? (
          <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
            <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              <strong>⚠️ Contrato Pausado:</strong> No puedes solicitar un rol mientras el contrato esté pausado. 
              Por favor, espera a que el administrador reanude el contrato.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" aria-label="User registration form">
            {/* Dirección del usuario */}
            <div className="space-y-2">
              <Label htmlFor="address">Your Address</Label>
              <div 
                className="p-2 bg-gray-100 rounded text-sm font-mono break-all"
                role="textbox"
                aria-label="Your wallet address"
                aria-readonly="true"
              >
                {address}
              </div>
            </div>

            {/* Selector de rol */}
            <div className="space-y-2">
              <Label htmlFor="role">Select Your Role</Label>
              <Select 
                value={selectedRole} 
                onValueChange={(value) => setSelectedRole(value as RoleType)}
                aria-required="true"
              >
                <SelectTrigger id="role" aria-label="Select your role in the supply chain">
                  <SelectValue placeholder="Choose a role..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Producer">👨‍🌾 Producer</SelectItem>
                  <SelectItem value="Factory">🏭 Factory</SelectItem>
                  <SelectItem value="Retailer">🏪 Retailer</SelectItem>
                  <SelectItem value="Consumer">🛒 Consumer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Descripción del rol seleccionado */}
            {selectedRole && (
              <div className="p-3 bg-blue-50 rounded text-sm">
                <p className="font-semibold mb-1">About {selectedRole}:</p>
                {selectedRole === 'Producer' && (
                  <p className="text-gray-700">
                    You can create raw material tokens and transfer them to Factories.
                  </p>
                )}
                {selectedRole === 'Factory' && (
                  <p className="text-gray-700">
                    You can receive raw materials from Producers, create finished products, and transfer them to Retailers.
                  </p>
                )}
                {selectedRole === 'Retailer' && (
                  <p className="text-gray-700">
                    You can receive products from Factories and distribute them to Consumers.
                  </p>
                )}
                {selectedRole === 'Consumer' && (
                  <p className="text-gray-700">
                    You can receive products from Retailers and view complete traceability.
                  </p>
                )}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-700 font-semibold mb-1">❌ Registration Failed</p>
                <p className="text-xs text-red-600">
                  {(() => {
                    const errorMsg = error.message || String(error) || ''
                    const errorStr = errorMsg.toLowerCase()
                    
                    // Usuario canceló en MetaMask
                    if (errorStr.includes('user rejected') || errorStr.includes('user denied') || errorStr.includes('rejected') || errorStr.includes('cancelled')) {
                      return 'Transaction cancelled by user in MetaMask'
                    }
                    
                    // Errores del contrato
                    if (errorStr.includes('invalidaddress')) {
                      return 'The contract owner cannot register as a user. Administrators have full access by default.'
                    }
                    
                    if (errorStr.includes('existinguserwithapprovedrole')) {
                      return 'This address is already registered and approved. You cannot request a new role.'
                    }
                    
                    if (errorStr.includes('userwithexistingrole')) {
                      return `You already have the role "${selectedRole}" assigned. You cannot request the same role again.`
                    }
                    
                    if (errorStr.includes('invalidrole')) {
                      return 'Invalid role selected. Please choose a valid role.'
                    }
                    
                    if (errorStr.includes('contractpaused')) {
                      return 'The contract is currently paused. Please wait for the administrator to resume it.'
                    }
                    
                    // Error genérico de ejecución revertida
                    if (errorStr.includes('execution reverted') || errorStr.includes('reverted')) {
                      return 'Transaction rejected by the contract. This may happen if you already have this role or if the contract is paused.'
                    }
                    
                    // Error de dropped/rejected de MetaMask
                    if (errorStr.includes('dropped') || errorStr.includes('rejected')) {
                      return 'Transaction was dropped or rejected. This may happen if you already have this role pending approval, if you are already approved, or if the contract is paused.'
                    }
                    
                    // Mostrar el mensaje completo para debugging
                    return errorMsg || 'An unexpected error occurred during registration'
                  })()}
                </p>
                {/* Mostrar detalles del error en desarrollo */}
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-2">
                    <summary className="text-xs text-red-500 cursor-pointer">Error details (dev only)</summary>
                    <pre className="text-xs mt-1 p-2 bg-red-100 rounded overflow-auto max-h-32">
                      {JSON.stringify(error, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Botón de envío */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={!selectedRole || isTransactionPending || isConfirming}
            >
              {isTransactionPending && !hash ? 'Waiting for signature...' : hash && isConfirming ? 'Confirming transaction...' : 'Submit Registration'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              After submitting, an administrator must approve your request before you can use the system.
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
