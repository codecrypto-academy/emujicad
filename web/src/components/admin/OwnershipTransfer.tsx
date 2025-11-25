'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useContractOwner } from '@/hooks/useContractOwner'
import { usePendingOwner } from '@/hooks/usePendingOwner'
import { useOwnershipTransfer } from '@/hooks/useOwnershipTransfer'
import { AlertTriangle, Crown, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AddressDisplay } from '@/components/AddressDisplay'
import { DebugLabel, DEBUG_MODE } from '@/lib/debug'

export function OwnershipTransfer() {
  const { address, isConnected } = useAccount()
  const { owner, isLoading: isLoadingOwner } = useContractOwner(isConnected)
  const { pendingOwner, isLoading: isLoadingPending } = usePendingOwner(isConnected)
  const { 
    initiateOwnershipTransfer, 
    acceptOwnershipTransfer,
    rejectOwnershipTransfer,
    // Estados separados para initiateOwnershipTransfer
    isPendingInitiate, 
    isConfirmingInitiate, 
    successInitiate, 
    errorInitiate,
    // Estados separados para acceptOwnershipTransfer
    isPendingAccept,
    isConfirmingAccept,
    successAccept,
    errorAccept,
    // Estados separados para rejectOwnershipTransfer
    isPendingReject,
    isConfirmingReject,
    successReject,
    errorReject
  } = useOwnershipTransfer()
  
  const [showInitiateDialog, setShowInitiateDialog] = useState(false)
  const [newOwnerAddress, setNewOwnerAddress] = useState('')
  const [showAcceptDialog, setShowAcceptDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  
  // Activar diseño moderno si está habilitado
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'

  const REQUIRED_CONFIRMATION = 'ACEPTAR'

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase()
  const isPendingOwnerAddress = address && pendingOwner && pendingOwner !== '0x0000000000000000000000000000000000000000' && address.toLowerCase() === pendingOwner.toLowerCase()
  const hasPendingOwner = pendingOwner && pendingOwner !== '0x0000000000000000000000000000000000000000'

  const handleInitiateClick = () => {
    setShowInitiateDialog(true)
    setNewOwnerAddress('')
  }

  const handleInitiateConfirm = () => {
    if (newOwnerAddress && /^0x[a-fA-F0-9]{40}$/.test(newOwnerAddress)) {
      initiateOwnershipTransfer(newOwnerAddress as `0x${string}`)
      setShowInitiateDialog(false)
      setNewOwnerAddress('')
    }
  }

  const handleAcceptClick = () => {
    setShowAcceptDialog(true)
    setConfirmationText('')
  }

  const handleAcceptConfirm = () => {
    if (confirmationText === REQUIRED_CONFIRMATION) {
      acceptOwnershipTransfer()
      setShowAcceptDialog(false)
      setConfirmationText('')
    }
  }

  const handleRejectClick = () => {
    setShowRejectDialog(true)
  }

  const handleRejectConfirm = () => {
    rejectOwnershipTransfer()
    setShowRejectDialog(false)
  }

  // Resetear diálogos cuando hay éxito
  useEffect(() => {
    if (successInitiate) {
      const timer = setTimeout(() => {
        setNewOwnerAddress('')
      }, 0)
      return () => clearTimeout(timer)
    }
    if (successAccept) {
      const timer = setTimeout(() => {
        setConfirmationText('')
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [successInitiate, successAccept])

  if (isLoadingOwner || isLoadingPending) {
    if (useModernDesign) {
      return (
        <div className="relative rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6" style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
          <DebugLabel component="OwnershipTransfer" section="LoadingState" props={{ isLoadingOwner, isLoadingPending, useModernDesign: true }} position="top-right" offset={4} />
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-slate-600 dark:text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Verificando ownership...</span>
          </div>
        </div>
      )
    }
    return (
      <Card style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
        <DebugLabel component="OwnershipTransfer" section="LoadingState" props={{ isLoadingOwner, isLoadingPending, useModernDesign: false }} position="top-right" offset={4} />
        <CardHeader>
          <CardTitle>Transferencia de Ownership</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Verificando ownership...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Diseño moderno
  if (useModernDesign) {
    return (
      <>
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50/80 to-indigo-50/80 dark:from-purple-900/30 dark:to-indigo-900/30 backdrop-blur-xl border border-purple-200/50 dark:border-purple-700/50 shadow-lg hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4" style={DEBUG_MODE ? { outline: '3px solid rgba(128, 0, 128, 0.6)', outlineOffset: '0px' } : {}}>
          <DebugLabel component="OwnershipTransfer" section="MainCard" props={{ isOwner, hasPendingOwner, isPendingOwnerAddress, useModernDesign: true }} position="top-left" offset={4} />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-purple-500/20 dark:bg-purple-400/20">
                <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-purple-700 dark:text-purple-300">Ownership del Contrato</h3>
                <p className="text-sm text-purple-600 dark:text-purple-400">Gestiona la transferencia de ownership del contrato</p>
              </div>
            </div>
            
            <div className="space-y-4">
              {/* Owner actual */}
              <div className="rounded-xl bg-white/50 dark:bg-slate-800/50 p-4 border border-purple-200/50 dark:border-purple-700/50">
                <Label className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2 block">
                  Owner Actual:
                </Label>
                <AddressDisplay address={owner || ''} className="text-sm font-mono" />
              </div>

              {/* Pending Owner */}
              {hasPendingOwner && (
                <div className="rounded-xl bg-amber-50/80 dark:bg-amber-900/30 p-4 border border-amber-200/50 dark:border-amber-700/50">
                  <Label className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2 block">
                    Pending Owner:
                  </Label>
                  <AddressDisplay address={pendingOwner || ''} className="text-sm font-mono" />
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                    Esperando aceptación de la transferencia...
                  </p>
                </div>
              )}

              {/* Botones de acción */}
              {isOwner && !hasPendingOwner && (
                <Button
                  onClick={handleInitiateClick}
                  disabled={isPendingInitiate || isConfirmingInitiate}
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                >
                  {isPendingInitiate || isConfirmingInitiate ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isPendingInitiate ? 'Confirmando...' : 'Procesando...'}
                    </>
                  ) : (
                    <>
                      <Crown className="h-4 w-4 mr-2" />
                      Iniciar Transferencia de Ownership
                    </>
                  )}
                </Button>
              )}

              {/* Owner puede cancelar transferencia pendiente */}
              {isOwner && hasPendingOwner && (
                <Button
                  onClick={handleRejectClick}
                  disabled={isPendingReject || isConfirmingReject || isPendingAccept || isConfirmingAccept}
                  variant="outline"
                  className="w-full rounded-xl border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all"
                >
                  {isPendingReject || isConfirmingReject ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isPendingReject ? 'Confirmando...' : 'Procesando...'}
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-2" />
                      Cancelar Transferencia (Owner)
                    </>
                  )}
                </Button>
              )}

              {isPendingOwnerAddress && (
                <div className="space-y-3">
                  <Button
                    onClick={handleAcceptClick}
                    disabled={isPendingAccept || isConfirmingAccept || isPendingReject || isConfirmingReject}
                    className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
                  >
                    {isPendingAccept || isConfirmingAccept ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isPendingAccept ? 'Confirmando...' : 'Procesando...'}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Aceptar Ownership
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handleRejectClick}
                    disabled={isPendingAccept || isConfirmingAccept || isPendingReject || isConfirmingReject}
                    variant="outline"
                    className="w-full rounded-xl border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
                  >
                    {isPendingReject || isConfirmingReject ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {isPendingReject ? 'Confirmando...' : 'Procesando...'}
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 mr-2" />
                        Rechazar Transferencia
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Mensajes de éxito/error para iniciar */}
              {errorInitiate && (
                <Alert className="rounded-xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur border-red-200 dark:border-red-800">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    ❌ Error al iniciar transferencia: {errorInitiate.message}
                  </AlertDescription>
                </Alert>
              )}

              {successInitiate && (
                <Alert className="rounded-xl bg-green-50/80 dark:bg-green-900/30 backdrop-blur border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    ✅ Transferencia iniciada exitosamente. El nuevo owner debe aceptar la transferencia.
                  </AlertDescription>
                </Alert>
              )}

              {/* Mensajes de éxito/error para aceptar */}
              {errorAccept && (
                <Alert className="rounded-xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur border-red-200 dark:border-red-800">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    ❌ Error al aceptar ownership: {errorAccept.message}
                  </AlertDescription>
                </Alert>
              )}

              {successAccept && (
                <Alert className="rounded-xl bg-green-50/80 dark:bg-green-900/30 backdrop-blur border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    ✅ Ownership aceptado exitosamente. Ahora eres el nuevo owner del contrato.
                  </AlertDescription>
                </Alert>
              )}

              {/* Mensajes de éxito/error para rechazar */}
              {errorReject && (
                <Alert className="rounded-xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur border-red-200 dark:border-red-800">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    ❌ Error al {isOwner ? 'cancelar' : 'rechazar'} transferencia: {errorReject.message}
                  </AlertDescription>
                </Alert>
              )}

              {successReject && (
                <Alert className="rounded-xl bg-green-50/80 dark:bg-green-900/30 backdrop-blur border-green-200 dark:border-green-800">
                  <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    ✅ Transferencia {isOwner ? 'cancelada' : 'rechazada'} exitosamente.
                  </AlertDescription>
                </Alert>
              )}

              {/* Información adicional */}
              {!isOwner && !isPendingOwnerAddress && (
                <Alert className="rounded-xl bg-slate-50/80 dark:bg-slate-900/30 backdrop-blur border-slate-200 dark:border-slate-700">
                  <AlertDescription className="text-slate-600 dark:text-slate-400 text-sm">
                    Solo el owner actual puede iniciar transferencias de ownership.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </div>

        {/* Dialog para iniciar transferencia */}
        <Dialog open={showInitiateDialog} onOpenChange={setShowInitiateDialog}>
          <DialogContent className="rounded-2xl" aria-labelledby="initiate-transfer-title" style={DEBUG_MODE ? { outline: '3px solid rgba(0, 128, 0, 0.6)', outlineOffset: '0px' } : {}}>
            <div className="relative">
              <DebugLabel component="OwnershipTransfer" section="InitiateDialog" props={{ showInitiateDialog, useModernDesign: true }} position="top-right" offset={4} />
              <DialogHeader>
              <DialogTitle id="initiate-transfer-title" className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                <Crown className="h-5 w-5" />
                Iniciar Transferencia de Ownership
              </DialogTitle>
              <DialogDescription>
                Transfiere el ownership del contrato a otra dirección. El nuevo owner debe aceptar la transferencia.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Alert className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  <strong>⚠️ Importante:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>El nuevo owner NO debe haber solicitado NINGÚN rol en el sistema (ni siquiera Pending)</li>
                    <li>Si la dirección alguna vez llamó a requestUserRole(), no puede ser owner</li>
                    <li>El nuevo owner será el único que pueda aprobar/rechazar usuarios</li>
                    <li>Esta acción es irreversible una vez aceptada</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="newOwner">
                  Dirección del nuevo owner:
                </Label>
                <Input
                  id="newOwner"
                  value={newOwnerAddress}
                  onChange={(e) => setNewOwnerAddress(e.target.value)}
                  placeholder="0x..."
                  className="font-mono rounded-xl"
                />
                {newOwnerAddress && !/^0x[a-fA-F0-9]{40}$/.test(newOwnerAddress) && (
                  <p className="text-xs text-red-600 dark:text-red-400">
                    Dirección inválida. Debe ser una dirección Ethereum válida (0x...)
                  </p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowInitiateDialog(false)
                  setNewOwnerAddress('')
                }}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleInitiateConfirm}
                disabled={!newOwnerAddress || !/^0x[a-fA-F0-9]{40}$/.test(newOwnerAddress) || isPendingInitiate || isConfirmingInitiate}
                className="rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                {isPendingInitiate || isConfirmingInitiate ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Iniciar Transferencia'
                )}
              </Button>
            </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog para rechazar ownership */}
        <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
          <DialogContent className="rounded-2xl" aria-labelledby="reject-transfer-title" style={DEBUG_MODE ? { outline: '3px solid rgba(0, 128, 0, 0.6)', outlineOffset: '0px' } : {}}>
            <div className="relative">
              <DebugLabel component="OwnershipTransfer" section="RejectDialog" props={{ showRejectDialog, useModernDesign: true }} position="top-right" offset={4} />
              <DialogHeader>
              <DialogTitle id="reject-transfer-title" className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <XCircle className="h-5 w-5" />
                {isOwner ? 'Cancelar' : 'Rechazar'} Transferencia de Ownership
              </DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas {isOwner ? 'cancelar' : 'rechazar'} la transferencia de ownership? Esto cancelará la transferencia pendiente.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Alert className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  <strong>⚠️ Advertencia:</strong> Al {isOwner ? 'cancelar' : 'rechazar'} la transferencia:
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>La transferencia pendiente será cancelada</li>
                    <li>El owner actual seguirá siendo el owner</li>
                    <li>El pendingOwner será limpiado</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowRejectDialog(false)}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleRejectConfirm}
                disabled={isPendingReject || isConfirmingReject}
                variant="destructive"
                className="rounded-xl"
              >
                {isPendingReject || isConfirmingReject ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    {isOwner ? 'Cancelar Transferencia' : 'Rechazar Transferencia'}
                  </>
                )}
              </Button>
            </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog para aceptar ownership */}
        <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
          <DialogContent className="rounded-2xl" aria-labelledby="accept-transfer-title" style={DEBUG_MODE ? { outline: '3px solid rgba(0, 128, 0, 0.6)', outlineOffset: '0px' } : {}}>
            <div className="relative">
              <DebugLabel component="OwnershipTransfer" section="AcceptDialog" props={{ showAcceptDialog, useModernDesign: true }} position="top-right" offset={4} />
              <DialogHeader>
              <DialogTitle id="accept-transfer-title" className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <CheckCircle2 className="h-5 w-5" />
                Aceptar Ownership
              </DialogTitle>
              <DialogDescription>
                ¿Estás seguro de que deseas aceptar el ownership del contrato? Esta acción es irreversible.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Alert className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-700 dark:text-amber-300">
                  <strong>⚠️ Advertencia:</strong> Al aceptar el ownership:
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Serás el único que pueda aprobar/rechazar usuarios</li>
                    <li>Serás el único que pueda pausar/despausar el contrato</li>
                    <li>NO podrás tener un rol en el sistema (Producer, Factory, etc.)</li>
                    <li>Esta acción es irreversible</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="confirmation">
                  Escribe <strong className="font-mono">ACEPTAR</strong> para confirmar:
                </Label>
                <Input
                  id="confirmation"
                  value={confirmationText}
                  onChange={(e) => setConfirmationText(e.target.value)}
                  placeholder="ACEPTAR"
                  className="font-mono rounded-xl"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAcceptDialog(false)
                  setConfirmationText('')
                }}
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAcceptConfirm}
                disabled={confirmationText !== REQUIRED_CONFIRMATION || isPendingAccept || isConfirmingAccept}
                className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                {isPendingAccept || isConfirmingAccept ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Aceptar Ownership'
                )}
              </Button>
            </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Diseño original (fallback)
  return (
    <>
      <Card className="border-purple-500 dark:border-purple-700 bg-purple-50 dark:bg-purple-900/20 transition-all duration-300 hover:shadow-lg" style={DEBUG_MODE ? { outline: '3px solid rgba(128, 0, 128, 0.6)', outlineOffset: '0px' } : {}}>
        <DebugLabel component="OwnershipTransfer" section="MainCard" props={{ isOwner, hasPendingOwner, isPendingOwnerAddress, useModernDesign: false }} position="top-left" offset={4} />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-purple-700 dark:text-purple-300">Transferencia de Ownership</span>
          </CardTitle>
          <CardDescription className="text-purple-600 dark:text-purple-400">
            Gestiona la transferencia de ownership del contrato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Owner actual */}
          <div className="p-4 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700">
            <Label className="text-sm font-semibold text-purple-700 dark:text-purple-300 mb-2 block">
              Owner Actual:
            </Label>
            <AddressDisplay address={owner || ''} className="text-sm font-mono" />
          </div>

          {/* Pending Owner */}
          {hasPendingOwner && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg border border-amber-200 dark:border-amber-700">
              <Label className="text-sm font-semibold text-amber-700 dark:text-amber-300 mb-2 block">
                Pending Owner:
              </Label>
              <AddressDisplay address={pendingOwner || ''} className="text-sm font-mono" />
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                Esperando aceptación de la transferencia...
              </p>
            </div>
          )}

          {/* Botones de acción */}
          {isOwner && !hasPendingOwner && (
            <Button
              onClick={handleInitiateClick}
              disabled={isPendingInitiate || isConfirmingInitiate}
              className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white"
            >
              {isPendingInitiate || isConfirmingInitiate ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isPendingInitiate ? 'Confirmando...' : 'Procesando...'}
                </>
              ) : (
                <>
                  <Crown className="h-4 w-4 mr-2" />
                  Iniciar Transferencia de Ownership
                </>
              )}
            </Button>
          )}

          {/* Owner puede cancelar transferencia pendiente */}
          {isOwner && hasPendingOwner && (
            <Button
              onClick={handleRejectClick}
              disabled={isPendingReject || isConfirmingReject || isPendingAccept || isConfirmingAccept}
              variant="outline"
              className="w-full border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-900/30"
            >
              {isPendingReject || isConfirmingReject ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isPendingReject ? 'Confirmando...' : 'Procesando...'}
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Cancelar Transferencia (Owner)
                </>
              )}
            </Button>
          )}

          {isPendingOwnerAddress && (
            <div className="space-y-3">
              <Button
                onClick={handleAcceptClick}
                disabled={isPendingAccept || isConfirmingAccept || isPendingReject || isConfirmingReject}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
              >
                {isPendingAccept || isConfirmingAccept ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isPendingAccept ? 'Confirmando...' : 'Procesando...'}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Aceptar Ownership
                  </>
                )}
              </Button>
              <Button
                onClick={handleRejectClick}
                disabled={isPendingAccept || isConfirmingAccept || isPendingReject || isConfirmingReject}
                variant="outline"
                className="w-full border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/30"
              >
                {isPendingReject || isConfirmingReject ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isPendingReject ? 'Confirmando...' : 'Procesando...'}
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Rechazar Transferencia
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Mensajes de éxito/error */}
          {errorInitiate && (
            <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                ❌ Error al iniciar transferencia: {errorInitiate.message}
              </AlertDescription>
            </Alert>
          )}

          {successInitiate && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                ✅ Transferencia iniciada exitosamente
              </AlertDescription>
            </Alert>
          )}

          {errorAccept && (
            <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                ❌ Error al aceptar ownership: {errorAccept.message}
              </AlertDescription>
            </Alert>
          )}

          {successAccept && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                ✅ Ownership aceptado exitosamente
              </AlertDescription>
            </Alert>
          )}

          {errorReject && (
            <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-700 dark:text-red-300">
                ❌ Error al {isOwner ? 'cancelar' : 'rechazar'} transferencia: {errorReject.message}
              </AlertDescription>
            </Alert>
          )}

          {successReject && (
            <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                ✅ Transferencia {isOwner ? 'cancelada' : 'rechazada'} exitosamente
              </AlertDescription>
            </Alert>
          )}

          {!isOwner && !isPendingOwnerAddress && (
            <Alert className="bg-slate-50 dark:bg-slate-900/30 border-slate-200 dark:border-slate-700">
              <AlertDescription className="text-slate-600 dark:text-slate-400 text-sm">
                Solo el owner actual puede iniciar transferencias de ownership.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      <Dialog open={showInitiateDialog} onOpenChange={setShowInitiateDialog}>
        <DialogContent aria-labelledby="initiate-transfer-title-original" style={DEBUG_MODE ? { outline: '3px solid rgba(0, 128, 0, 0.6)', outlineOffset: '0px' } : {}}>
          <div className="relative">
            <DebugLabel component="OwnershipTransfer" section="InitiateDialog" props={{ showInitiateDialog, useModernDesign: false }} position="top-right" offset={4} />
            <DialogHeader>
            <DialogTitle id="initiate-transfer-title-original" className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Crown className="h-5 w-5" />
              Iniciar Transferencia de Ownership
            </DialogTitle>
            <DialogDescription>
              Transfiere el ownership del contrato a otra dirección.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                <strong>⚠️ Importante:</strong> El nuevo owner NO debe haber solicitado NINGÚN rol en el sistema (ni siquiera Pending). Si la dirección alguna vez llamó a requestUserRole(), no puede ser owner.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="newOwner">Dirección del nuevo owner:</Label>
              <Input
                id="newOwner"
                value={newOwnerAddress}
                onChange={(e) => setNewOwnerAddress(e.target.value)}
                placeholder="0x..."
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInitiateDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleInitiateConfirm}
              disabled={!newOwnerAddress || !/^0x[a-fA-F0-9]{40}$/.test(newOwnerAddress) || isPendingInitiate || isConfirmingInitiate}
            >
              {isPendingInitiate || isConfirmingInitiate ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Iniciar Transferencia'
              )}
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent aria-labelledby="accept-transfer-title-original" style={DEBUG_MODE ? { outline: '3px solid rgba(0, 128, 0, 0.6)', outlineOffset: '0px' } : {}}>
          <div className="relative">
            <DebugLabel component="OwnershipTransfer" section="AcceptDialog" props={{ showAcceptDialog, useModernDesign: false }} position="top-right" offset={4} />
            <DialogHeader>
            <DialogTitle id="accept-transfer-title-original" className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
              Aceptar Ownership
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas aceptar el ownership del contrato?
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <AlertDescription className="text-amber-700 dark:text-amber-300">
                <strong>⚠️ Advertencia:</strong> Esta acción es irreversible.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Escribe <strong className="font-mono">ACEPTAR</strong> para confirmar:
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="ACEPTAR"
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAcceptDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAcceptConfirm}
              disabled={confirmationText !== REQUIRED_CONFIRMATION || isPendingAccept || isConfirmingAccept}
            >
              {isPendingAccept || isConfirmingAccept ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                'Aceptar Ownership'
              )}
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent aria-labelledby="reject-transfer-title-original" style={DEBUG_MODE ? { outline: '3px solid rgba(0, 128, 0, 0.6)', outlineOffset: '0px' } : {}}>
          <div className="relative">
            <DebugLabel component="OwnershipTransfer" section="RejectDialog" props={{ showRejectDialog, useModernDesign: false }} position="top-right" offset={4} />
            <DialogHeader>
            <DialogTitle id="reject-transfer-title-original" className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <XCircle className="h-5 w-5" />
              {isOwner ? 'Cancelar' : 'Rechazar'} Transferencia de Ownership
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas {isOwner ? 'cancelar' : 'rechazar'} la transferencia de ownership? Esto cancelará la transferencia pendiente.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleRejectConfirm}
              disabled={isPendingReject || isConfirmingReject}
              variant="destructive"
            >
              {isPendingReject || isConfirmingReject ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  {isOwner ? 'Cancelar Transferencia' : 'Rechazar Transferencia'}
                </>
              )}
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

