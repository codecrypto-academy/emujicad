'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRequestRole } from '@/hooks/useRequestRole'

type RoleType = 'Producer' | 'Factory' | 'Retailer' | 'Consumer'

interface ChangeRoleDialogProps {
  currentRole: number
  onSuccess?: () => void
}

// Componente interno que se remonta completamente con cada key
function DialogFormContent({ currentRole, onSuccess, onClose }: { currentRole: number; onSuccess?: () => void; onClose: () => void }) {
  const [selectedRole, setSelectedRole] = useState<RoleType | ''>('')
  const { requestRole, isPending, isSuccess, error } = useRequestRole()

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
    if (!selectedRole || selectedRole === currentRoleName) return
    
    try {
      requestRole(selectedRole)
    } catch (err) {
      console.error('Error requesting role:', err)
    }
  }

  // Detectar cuando el cambio es exitoso y cerrar
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onClose()
        onSuccess?.()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, onClose, onSuccess])

  return (
    <>
      {isSuccess ? (
        <>
          <DialogHeader>
            <DialogTitle className="text-green-700">✅ Role Change Requested!</DialogTitle>
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
            <DialogTitle>Change Your Role</DialogTitle>
            <DialogDescription>
              You can change your role while your registration is pending
            </DialogDescription>
          </DialogHeader>
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
                  <SelectItem value="Producer" disabled={currentRoleName === 'Producer'}>
                    👨‍🌾 Producer
                  </SelectItem>
                  <SelectItem value="Factory" disabled={currentRoleName === 'Factory'}>
                    🏭 Factory
                  </SelectItem>
                  <SelectItem value="Retailer" disabled={currentRoleName === 'Retailer'}>
                    🏪 Retailer
                  </SelectItem>
                  <SelectItem value="Consumer" disabled={currentRoleName === 'Consumer'}>
                    🛒 Consumer
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                <p className="font-semibold">Error:</p>
                <p>{error.message || 'Failed to change role'}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={!selectedRole || selectedRole === currentRoleName || isPending}
            >
              {isPending ? 'Submitting...' : 'Change Role'}
            </Button>

            <p className="text-xs text-center text-muted-foreground">
              The administrator will review your new role request
            </p>
          </form>
        </>
      )}
    </>
  )
}

  export function ChangeRoleDialog({ currentRole, onSuccess }: ChangeRoleDialogProps) {
    const [open, setOpen] = useState(false)
    const [dialogKey, setDialogKey] = useState(0)
  
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
  
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button size="sm" variant="outline">
            Change Role
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogFormContent 
            key={dialogKey}
            currentRole={currentRole} 
            onSuccess={onSuccess}
            onClose={handleClose}
          />
        </DialogContent>
      </Dialog>
    )
  }
