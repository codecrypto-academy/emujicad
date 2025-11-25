'use client'

import { useState } from 'react'
import * as React from 'react'
import { Button } from '@/components/ui/button'
import { DebugLabel } from '@/lib/debug'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRequestRole } from '@/hooks/useRequestRole'
import { useIsPaused } from '@/hooks/usePause'
import { useAccount } from 'wagmi'
import { Pause, AlertTriangle, Ban } from 'lucide-react'
import { UserStatus } from '@/contracts/config'
import type { UserInfo } from '@/types'

type RoleType = 'Producer' | 'Factory' | 'Retailer' | 'Consumer' | ''

interface RegisterFormProps {
  onRegistrationSuccess?: () => void
  userInfo?: UserInfo | null
  onShowSuccessChange?: (show: boolean) => void
  onRoleSubmitted?: (role: string) => void
}

export function RegisterForm({ onRegistrationSuccess, userInfo, onShowSuccessChange, onRoleSubmitted }: RegisterFormProps = {}) {
  const [selectedRole, setSelectedRole] = useState<RoleType>('')
  const { address } = useAccount()
  const { data: isPaused } = useIsPaused()
  const { requestRole, isPending: isTransactionPending, isConfirming, isSuccess, error, hash } = useRequestRole()
  
  // CRÍTICO: Si el usuario está cancelado, NO puede solicitar un nuevo rol
  // Solo el administrador puede cambiar el estado de Canceled a Pending
  const isCanceled = Boolean(userInfo && Number(userInfo.status) === UserStatus.Canceled)
  
  // Manejar el éxito de la transacción: mostrar mensaje verde durante 4 segundos completos
  // Usar useRef para evitar que el efecto se ejecute múltiples veces
  const successHandledRef = React.useRef(false)
  // Guardar selectedRole en un ref para asegurar que esté disponible cuando isSuccess se vuelve true
  const selectedRoleRef = React.useRef<RoleType>('')
  
  // Actualizar el ref cuando selectedRole cambie
  React.useEffect(() => {
    selectedRoleRef.current = selectedRole
  }, [selectedRole])
  
  // Usar useRef para almacenar las funciones de callback y evitar que cambien en cada render
  // Esto previene que el useEffect se ejecute múltiples veces
  const onRegistrationSuccessRef = React.useRef(onRegistrationSuccess)
  const onShowSuccessChangeRef = React.useRef(onShowSuccessChange)
  const onRoleSubmittedRef = React.useRef(onRoleSubmitted)
  
  // Actualizar las refs cuando cambien las funciones
  React.useEffect(() => {
    onRegistrationSuccessRef.current = onRegistrationSuccess
    onShowSuccessChangeRef.current = onShowSuccessChange
    onRoleSubmittedRef.current = onRoleSubmitted
  }, [onRegistrationSuccess, onShowSuccessChange, onRoleSubmitted])
  
  // Debug: Log cuando isSuccess cambia
  React.useEffect(() => {
    console.log('[RegisterForm] isSuccess changed:', isSuccess, 'selectedRole:', selectedRole, 'selectedRoleRef.current:', selectedRoleRef.current)
    console.log('[RegisterForm] Callbacks:', {
      onShowSuccessChange: !!onShowSuccessChangeRef.current,
      onRoleSubmitted: !!onRoleSubmittedRef.current,
      onRegistrationSuccess: !!onRegistrationSuccessRef.current
    })
  }, [isSuccess, selectedRole])
  
  // Guardar los timers en un ref para evitar que se limpien prematuramente
  const timersRef = React.useRef<NodeJS.Timeout[]>([])
  // Flag para indicar si los timers ya están configurados y no deben limpiarse
  const timersSetupRef = React.useRef(false)
  
  React.useEffect(() => {
    if (isSuccess && !successHandledRef.current) {
      // Marcar como manejado para evitar ejecuciones múltiples
      successHandledRef.current = true
      timersSetupRef.current = true
      
      console.log('[RegisterForm] ✅ Transaction successful - showing success message for 4 seconds')
      console.log('[RegisterForm] Current state:', { selectedRole, selectedRoleRef: selectedRoleRef.current })
      
      // Limpiar timers anteriores si existen (solo si no están configurados)
      if (!timersSetupRef.current) {
        timersRef.current.forEach(timer => clearTimeout(timer))
        timersRef.current = []
      }
      
      // 1. Notificar al padre INMEDIATAMENTE para mostrar RegistrationSubmittedCard
      if (onShowSuccessChangeRef.current) {
        console.log('[RegisterForm] Calling onShowSuccessChange(true)')
        onShowSuccessChangeRef.current(true)
      } else {
        console.error('[RegisterForm] ❌ onShowSuccessChangeRef.current is null!')
      }
      
      // 2. Pasar el rol seleccionado al padre para mostrarlo en RegistrationSubmittedCard
      // Usar el ref para asegurar que tenemos el valor correcto
      const roleToSubmit = selectedRoleRef.current || selectedRole
      console.log('[RegisterForm] Role to submit:', roleToSubmit, 'hasCallback:', !!onRoleSubmittedRef.current)
      if (onRoleSubmittedRef.current && roleToSubmit) {
        console.log('[RegisterForm] ✅ Calling onRoleSubmitted with role:', roleToSubmit)
        onRoleSubmittedRef.current(roleToSubmit)
      } else {
        console.error('[RegisterForm] ❌ Cannot submit role:', { roleToSubmit, hasCallback: !!onRoleSubmittedRef.current })
      }
      
      // 3. UN SOLO refetch después de 1 segundo para actualizar el header rápidamente
      // La información se guardará en localStorage y se usará para el ApprovalPendingCard sin más refetches
      const timer1 = setTimeout(() => {
        console.log('[RegisterForm] ⏰ Timer 1 (1s) - Refetching user data ONCE to update header and save to localStorage')
        if (onRegistrationSuccessRef.current) {
          onRegistrationSuccessRef.current()
        }
      }, 1000)
      timersRef.current.push(timer1)
      
      // 4. Después de 4 segundos completos: ocultar RegistrationSubmittedCard y mostrar ApprovalPendingCard
      // NO hacer más refetches - usar la información del localStorage
      const timer2 = setTimeout(() => {
        console.log('[RegisterForm] ⏰ Timer 2 (4s) - Hiding success message and showing Approval Pending card')
        if (onShowSuccessChangeRef.current) {
          console.log('[RegisterForm] Calling onShowSuccessChange(false)')
          onShowSuccessChangeRef.current(false)
        } else {
          console.error('[RegisterForm] ❌ onShowSuccessChangeRef.current is null when trying to hide!')
        }
        // NO hacer más refetches - la información ya está en localStorage
        successHandledRef.current = false // Resetear para permitir futuros registros
        timersSetupRef.current = false // Resetear el flag
        timersRef.current = [] // Limpiar el array de timers
      }, 4000) // 4 segundos completos - el mensaje se mantiene visible todo este tiempo
      timersRef.current.push(timer2)
      
      console.log('[RegisterForm] ✅ All timers set up:', timersRef.current.length)
      
      return () => {
        // NO limpiar los timers si ya están configurados
        // El cleanup solo debe ejecutarse si el componente se desmonta ANTES de que isSuccess sea true
        if (!timersSetupRef.current) {
          console.log('[RegisterForm] 🧹 Cleaning up timers (component unmounting before success)')
          timersRef.current.forEach(timer => clearTimeout(timer))
          timersRef.current = []
        } else {
          console.warn('[RegisterForm] ⚠️ useEffect cleanup called but timers are active - NOT cleaning up to preserve timers!')
          console.warn('[RegisterForm] This usually means the component is re-rendering. Timers will continue running.')
        }
      }
    } else if (error && !isSuccess) {
      // Solo resetear si hay error Y no hay éxito
      console.log('[RegisterForm] ❌ Error occurred, resetting state')
      if (onShowSuccessChangeRef.current) {
        onShowSuccessChangeRef.current(false)
      }
      successHandledRef.current = false
      timersSetupRef.current = false
      timersRef.current.forEach(timer => clearTimeout(timer))
      timersRef.current = []
    }
  }, [isSuccess, error]) // NO incluir selectedRole aquí - causa re-ejecuciones que limpian los timers

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    e.stopPropagation()
    if (!selectedRole || isCanceled) return // Prevenir submit si está cancelado
    
    requestRole(selectedRole)
  }

  // El mensaje de éxito ahora se muestra en RegistrationSubmittedCard en page.tsx
  // Ya no necesitamos renderizar el mensaje verde aquí
  return (
    <Card className="relative">
      <DebugLabel component="RegisterForm" section="Form" props={{ isCanceled, isPaused, selectedRole }} />
      <CardHeader>
        <CardTitle>🆕 Register as User</CardTitle>
        <CardDescription>Choose your role in the supply chain</CardDescription>
      </CardHeader>
      <CardContent>
        {isCanceled ? (
          <Alert className="bg-slate-50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800">
            <Ban className="h-4 w-4 text-slate-600 dark:text-slate-400" />
            <AlertDescription className="text-slate-700 dark:text-slate-300">
              <strong>🚫 Registration Canceled:</strong> Your previous registration was canceled. 
              Only the administrator can change your status from Canceled to Pending. 
              Please contact the administrator for more information.
            </AlertDescription>
          </Alert>
        ) : isPaused ? (
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
                disabled={isCanceled}
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
              <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  {(() => {
                    // Detectar error de cancelación de MetaMask de forma más robusta
                    const errorAny = error as any
                    const errorCode = errorAny?.cause?.cause?.code || errorAny?.code
                    const errorName = errorAny?.cause?.cause?.name || errorAny?.name || ''
                    const errorMsg = error.message || String(error) || ''
                    const errorStr = errorMsg.toLowerCase()
                    const errorNameStr = errorName.toLowerCase()
                    
                    // Usuario canceló en MetaMask (código 4001 o UserRejectedRequestError)
                    const isUserCancelled = 
                      errorCode === 4001 ||
                      errorNameStr.includes('userrejected') ||
                      errorStr.includes('user rejected') ||
                      errorStr.includes('user denied') ||
                      errorStr.includes('user cancelled') ||
                      errorStr.includes('transaction cancelled') ||
                      errorStr.includes('cancelled by user')
                    
                    if (isUserCancelled) {
                      return (
                        <div>
                          <p className="font-semibold mb-2">⚠️ Transaction Cancelled</p>
                          <p className="text-sm mb-2">
                            You cancelled the transaction in MetaMask. No changes were made.
                          </p>
                          <p className="text-sm">
                            You can try again by clicking "Submit Registration" below.
                          </p>
                        </div>
                      )
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
                    
                    // Error de dropped/rejected de MetaMask (pero no cancelación)
                    if (errorStr.includes('dropped') || (errorStr.includes('rejected') && !isUserCancelled)) {
                      return 'Transaction was dropped or rejected. This may happen if you already have this role pending approval, if you are already approved, or if the contract is paused.'
                    }
                    
                    // Mostrar el mensaje completo solo en desarrollo
                    if (process.env.NODE_ENV === 'development') {
                      return errorMsg || 'An unexpected error occurred during registration'
                    }
                    
                    // En producción, mostrar mensaje genérico
                    return 'An error occurred during registration. Please try again or contact support if the problem persists.'
                  })()}
                </AlertDescription>
                {/* Mostrar detalles del error SOLO en desarrollo y SOLO si no es cancelación de usuario */}
                {process.env.NODE_ENV === 'development' && (() => {
                  const errorAny = error as any
                  const errorCode = errorAny?.cause?.cause?.code || errorAny?.code
                  const errorName = errorAny?.cause?.cause?.name || errorAny?.name || ''
                  const errorMsg = error.message || String(error) || ''
                  const errorStr = errorMsg.toLowerCase()
                  const errorNameStr = errorName.toLowerCase()
                  
                  const isUserCancelled = 
                    errorCode === 4001 ||
                    errorNameStr.includes('userrejected') ||
                    errorStr.includes('user rejected') ||
                    errorStr.includes('user denied') ||
                    errorStr.includes('user cancelled') ||
                    errorStr.includes('transaction cancelled') ||
                    errorStr.includes('cancelled by user')
                  
                  // No mostrar detalles técnicos si el usuario canceló
                  if (isUserCancelled) {
                    return null
                  }
                  
                  return (
                    <details className="mt-2">
                      <summary className="text-xs text-red-500 cursor-pointer hover:text-red-700">
                        ▼ Error details (dev only)
                      </summary>
                      <pre className="text-xs mt-1 p-2 bg-red-100 dark:bg-red-900/30 rounded overflow-auto max-h-32">
                        {JSON.stringify(error, null, 2)}
                      </pre>
                    </details>
                  )
                })()}
              </Alert>
            )}

            {/* Botón de envío */}
            <Button 
              type="submit" 
              className="w-full"
              disabled={isCanceled || !selectedRole || isTransactionPending || isConfirming}
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
