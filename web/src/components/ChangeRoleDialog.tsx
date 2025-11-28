'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRequestRole } from '@/hooks/useRequestRole'
import { useIsPaused } from '@/hooks/usePause'
import { UserStatus } from '@/contracts/config'
import { Pause } from 'lucide-react'
import { DebugLabel, DEBUG_MODE } from '@/lib/debug'
import { formatTransactionError, getWalletName } from '@/lib/error-formatter'
import { useAccount } from 'wagmi'

type RoleType = 'Producer' | 'Factory' | 'Retailer' | 'Consumer'

interface ChangeRoleDialogProps {
  currentRole: number
  userStatus: number // UserStatus enum value
  onSuccess?: () => void
}

// Componente interno que se remonta completamente con cada key
function DialogFormContent({ currentRole, userStatus, onSuccess, onClose }: { currentRole: number; userStatus: number; onSuccess?: () => void; onClose: () => void }) {
  const [selectedRole, setSelectedRole] = useState<RoleType | ''>('')
  const { data: isPaused } = useIsPaused()
  const { requestRole, isPending, isSuccess, error } = useRequestRole()
  const { connector } = useAccount()
  
  // Obtener nombre de la wallet usando la función helper
  const walletName = getWalletName(connector)

  const getRoleName = (roleNumber: number): RoleType => {
    const roleNames: Record<number, RoleType> = {
      0: 'Producer',
      1: 'Factory',
      2: 'Retailer',
      3: 'Consumer',
    }
    return roleNames[roleNumber] || 'Producer'
  }

  const currentRoleName = getRoleName(currentRole)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    // Permitir enviar el mismo rol si el usuario está Rejected
    if (!selectedRole || (selectedRole === currentRoleName && userStatus !== UserStatus.Rejected)) return
    
    try {
      requestRole(selectedRole)
    } catch (err) {
      console.error('Error requesting role:', err)
    }
  }

  // Detectar cuando el cambio es exitoso y refrescar datos
  useEffect(() => {
    if (isSuccess && onSuccess) {
      console.log('ChangeRoleDialog: Transacción exitosa, refrescando datos del usuario...')
      
      // Refrescar inmediatamente
      onSuccess()
      
      // Refrescar después de 1 segundo (para asegurar que la blockchain se haya actualizado)
      const timer1 = setTimeout(() => {
        console.log('ChangeRoleDialog: Refrescando datos después de 1 segundo...')
        onSuccess()
      }, 1000)
      
      // Refrescar después de 3 segundos (para asegurar que los datos estén completamente actualizados)
      const timer2 = setTimeout(() => {
        console.log('ChangeRoleDialog: Refrescando datos después de 3 segundos...')
        onSuccess()
      }, 3000)
      
      // Cerrar el diálogo después de 2 segundos
      const timer3 = setTimeout(() => {
        onClose()
      }, 2000)
      
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
        clearTimeout(timer3)
      }
    }
  }, [isSuccess, onClose, onSuccess])

  return (
    <>
      {isSuccess ? (
        <>
          <DialogHeader>
            <DialogTitle id="change-role-title" className="text-green-700">✅ Role Change Requested!</DialogTitle>
            <DialogDescription>
              Your request to change to <span className="font-semibold">{selectedRole}</span> role has been submitted to the administrator
            </DialogDescription>
          </DialogHeader>
          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm text-green-700">
            Please wait for the administrator to review your new request.
          </div>
        </>
      ) : (
        <>
          <DialogHeader>
            <DialogTitle id="change-role-title">Change Your Role</DialogTitle>
            <DialogDescription>
              {userStatus === UserStatus.Rejected 
                ? 'You can request a different role after rejection'
                : userStatus === UserStatus.Pending
                ? 'You can change your role request while it is pending approval'
                : 'Your registration was canceled'}
            </DialogDescription>
          </DialogHeader>
          {userStatus === UserStatus.Canceled ? (
            <Alert className="bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800">
              <AlertDescription className="text-gray-700 dark:text-gray-300">
                <strong>🚫 Registro Cancelado:</strong> Tu registro fue cancelado. 
                Solo el administrador puede cambiar tu estado. Por favor, contacta al administrador para más información.
              </AlertDescription>
            </Alert>
          ) : isPaused ? (
            <Alert className="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <Pause className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              <AlertDescription className="text-yellow-700 dark:text-yellow-300">
                <strong>⚠️ Contract Paused:</strong> You cannot change your role while the contract is paused.
                Please wait for the administrator to resume the contract.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-role">Current Role</Label>
                <div className="p-2 bg-gray-100 rounded text-sm font-semibold">
                  {currentRoleName}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-role">New Role</Label>
                <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as RoleType)}>
                  <SelectTrigger id="new-role">
                    <SelectValue placeholder="Select new role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Permitir seleccionar el mismo rol si el usuario está Rejected (puede haber resuelto el problema administrativo) */}
                    <SelectItem value="Producer" disabled={currentRoleName === 'Producer' && userStatus !== UserStatus.Rejected}>
                      👨‍🌾 Producer
                    </SelectItem>
                    <SelectItem value="Factory" disabled={currentRoleName === 'Factory' && userStatus !== UserStatus.Rejected}>
                      🏭 Factory
                    </SelectItem>
                    <SelectItem value="Retailer" disabled={currentRoleName === 'Retailer' && userStatus !== UserStatus.Rejected}>
                      🏪 Retailer
                    </SelectItem>
                    <SelectItem value="Consumer" disabled={currentRoleName === 'Consumer' && userStatus !== UserStatus.Rejected}>
                      🛒 Consumer
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (() => {
                const { friendlyMessage, isUserCancelled, technicalDetails } = formatTransactionError(
                  error,
                  {
                    action: 'the role change',
                    walletName,
                  }
                )
                
                return (
                  <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                    <AlertDescription className="text-red-700 dark:text-red-300 whitespace-pre-line">
                      {friendlyMessage}
                      {technicalDetails && process.env.NODE_ENV === 'development' && (
                        <details className="mt-2">
                          <summary className="text-xs text-red-500 cursor-pointer hover:text-red-700">
                            ▼ Technical details (dev only)
                          </summary>
                          <pre className="text-xs mt-1 p-2 bg-red-100 dark:bg-red-900/30 rounded overflow-auto max-h-32">
                            {technicalDetails}
                          </pre>
                        </details>
              )}
                    </AlertDescription>
                  </Alert>
                )
              })()}

              <Button 
                type="submit" 
                className="w-full"
                disabled={!selectedRole || (selectedRole === currentRoleName && userStatus !== UserStatus.Rejected) || isPending}
              >
                {isPending ? 'Submitting...' : 'Change Role'}
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                The administrator will review your new role request
              </p>
            </form>
          )}
        </>
      )}
    </>
  )
}

  export function ChangeRoleDialog({ currentRole, userStatus, onSuccess }: ChangeRoleDialogProps) {
    const [open, setOpen] = useState(false)
    const [dialogKey, setDialogKey] = useState(0)
    const { data: isPaused } = useIsPaused()
  
    // Incrementar key cuando se cierra para forzar remontaje completo
    const handleOpenChange = (newOpen: boolean) => {
      if (!newOpen && open) {
        // Al cerrar, incrementar key para remontar todo el contenido
        setDialogKey(prev => prev + 1)
      }
      setOpen(newOpen)
    }
  
    const handleClose = () => {
      setOpen(false)
    }
  
    // Solo permitir cambiar el rol si:
    // - El estado es Rejected Y el contrato NO está pausado
    // - El estado es Pending Y el contrato NO está pausado (autogestión)
    // - Los usuarios cancelados NUNCA pueden cambiar el rol
    const canChangeRole = (userStatus === UserStatus.Rejected || userStatus === UserStatus.Pending) && !isPaused
  
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline" disabled={!canChangeRole}>
            Change Role
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md" aria-labelledby="change-role-title" style={DEBUG_MODE ? { outline: '3px solid rgba(0, 128, 0, 0.6)', outlineOffset: '0px' } : {}}>
          <div className="relative rounded-2xl">
            <DebugLabel component="ChangeRoleDialog" section="DialogContent" props={{ userStatus, currentRole, isPaused: isPaused === true, canChangeRole }} position="top-right" offset={-20} />
            <DialogFormContent 
              key={dialogKey}
              currentRole={currentRole}
              userStatus={userStatus}
              onSuccess={onSuccess}
              onClose={handleClose}
            />
          </div>
        </DialogContent>
      </Dialog>
    )
  }
