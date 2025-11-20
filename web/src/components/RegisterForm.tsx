'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useRequestRole } from '@/hooks/useRequestRole'
import { useAccount } from 'wagmi'

type RoleType = 'Producer' | 'Factory' | 'Retailer' | 'Consumer' | ''

export function RegisterForm() {
  const [selectedRole, setSelectedRole] = useState<RoleType>('')
  const { address } = useAccount()
  const { requestRole, isPending, isConfirming, isSuccess, error, hash } = useRequestRole()

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
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dirección del usuario */}
          <div className="space-y-2">
            <Label htmlFor="address">Your Address</Label>
            <div className="p-2 bg-gray-100 rounded text-sm font-mono break-all">
              {address}
            </div>
          </div>

          {/* Selector de rol */}
          <div className="space-y-2">
            <Label htmlFor="role">Select Your Role</Label>
            <Select 
              value={selectedRole} 
              onValueChange={(value) => setSelectedRole(value as RoleType)}
            >
              <SelectTrigger id="role">
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

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
              <p className="font-semibold">Error:</p>
              <p>{error.message || 'Failed to submit registration'}</p>
            </div>
          )}

          {/* Botón de envío */}
          <Button 
            type="submit" 
            className="w-full"
            disabled={!selectedRole || isPending || isConfirming}
          >
            {isPending && !hash && 'Waiting for signature...'}
            {hash && isConfirming && 'Confirming transaction...'}
            {!isPending && !isConfirming && 'Submit Registration'}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            After submitting, an administrator must approve your request before you can use the system.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
