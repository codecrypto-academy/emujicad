'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useIsPaused, usePause, useUnpause } from '@/hooks/usePause'
import { AlertTriangle, Play, Pause, Loader2 } from 'lucide-react'
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

export function PauseControl() {
  const { data: isPaused, isLoading: isLoadingStatus } = useIsPaused()
  const { pause, isPending: isPausing, isConfirming: isConfirmingPause, isSuccess: pauseSuccess, error: pauseError } = usePause()
  const { unpause, isPending: isUnpausing, isConfirming: isConfirmingUnpause, isSuccess: unpauseSuccess, error: unpauseError } = useUnpause()
  
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [showUnpauseDialog, setShowUnpauseDialog] = useState(false)

  const REQUIRED_CONFIRMATION = 'PAUSAR'

  const handlePauseClick = () => {
    setShowPauseDialog(true)
    setConfirmationText('')
  }

  const handlePauseConfirm = () => {
    if (confirmationText === REQUIRED_CONFIRMATION) {
      pause()
      setShowPauseDialog(false)
      setConfirmationText('')
    }
  }

  const handleUnpauseClick = () => {
    setShowUnpauseDialog(true)
  }

  const handleUnpauseConfirm = () => {
    unpause()
    setShowUnpauseDialog(false)
  }

  if (isLoadingStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Estado del Contrato</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Verificando estado...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const paused = isPaused === true

  return (
    <>
      <Card className={`${paused ? 'border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-900/20' : 'border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-900/20'} transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4`}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {paused ? (
              <>
                <Pause className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300">Contrato Pausado</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300">Contrato Activo</span>
              </>
            )}
          </CardTitle>
          <CardDescription className={paused ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
            {paused 
              ? 'El contrato está pausado. Las funciones críticas están deshabilitadas.'
              : 'El contrato está activo. Todas las funciones están disponibles.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paused ? (
            <>
              <Alert className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  <strong>Funciones deshabilitadas:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Solicitar rol o cambiar rol</li>
                    <li>Crear tokens</li>
                    <li>Hacer transferencias</li>
                    <li>Aceptar/Rechazar/Cancelar transferencias</li>
                  </ul>
                </AlertDescription>
              </Alert>
              
              <Button
                onClick={handleUnpauseClick}
                disabled={isUnpausing || isConfirmingUnpause}
                className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                aria-label="Unpause the smart contract"
                aria-disabled={isUnpausing || isConfirmingUnpause}
              >
                {isUnpausing || isConfirmingUnpause ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isUnpausing ? 'Confirmando...' : 'Procesando...'}
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Reanudar Contrato
                  </>
                )}
              </Button>

              {unpauseError && (
                <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    ❌ Error: {unpauseError.message}
                  </AlertDescription>
                </Alert>
              )}

              {unpauseSuccess && (
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    ✅ Contrato reanudado exitosamente
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={handlePauseClick}
                disabled={isPausing || isConfirmingPause}
                variant="destructive"
                className="w-full"
                aria-label="Pause the smart contract"
                aria-disabled={isPausing || isConfirmingPause}
              >
                {isPausing || isConfirmingPause ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isPausing ? 'Confirmando...' : 'Procesando...'}
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pausar Contrato
                  </>
                )}
              </Button>

              {pauseError && (
                <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <AlertDescription className="text-red-700 dark:text-red-300">
                    ❌ Error: {pauseError.message}
                  </AlertDescription>
                </Alert>
              )}

              {pauseSuccess && (
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <AlertDescription className="text-green-700 dark:text-green-300">
                    ✅ Contrato pausado exitosamente
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmación para pausar */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Confirmar Pausa del Contrato
            </DialogTitle>
            <DialogDescription>
              Esta acción pausará el contrato y deshabilitará todas las funciones críticas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <AlertDescription className="text-red-700 dark:text-red-300">
                <strong>⚠️ Advertencia:</strong> Al pausar el contrato se deshabilitarán:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Solicitud de roles</li>
                  <li>Cambio de roles</li>
                  <li>Creación de tokens</li>
                  <li>Todas las transferencias</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Escribe <strong className="font-mono">PAUSAR</strong> para confirmar:
              </Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="PAUSAR"
                className="font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowPauseDialog(false)
                setConfirmationText('')
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handlePauseConfirm}
              disabled={confirmationText !== REQUIRED_CONFIRMATION}
            >
              Confirmar Pausa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmación para reanudar */}
      <Dialog open={showUnpauseDialog} onOpenChange={setShowUnpauseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Play className="h-5 w-5" />
              Reanudar Contrato
            </DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas reanudar el contrato? Esto habilitará todas las funciones nuevamente.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnpauseDialog(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleUnpauseConfirm}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
            >
              Reanudar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

