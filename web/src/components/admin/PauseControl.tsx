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
import { DebugLabel } from '@/lib/debug'

export function PauseControl() {
  const { data: isPaused, isLoading: isLoadingStatus } = useIsPaused()
  const { pause, isPending: isPausing, isConfirming: isConfirmingPause, isSuccess: pauseSuccess, error: pauseError } = usePause()
  const { unpause, isPending: isUnpausing, isConfirming: isConfirmingUnpause, isSuccess: unpauseSuccess, error: unpauseError } = useUnpause()
  
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [showUnpauseDialog, setShowUnpauseDialog] = useState(false)
  
  // Activar diseño moderno si está habilitado
  const useModernDesign = process.env.NEXT_PUBLIC_MODERN_DESIGN === 'true'

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
    if (useModernDesign) {
      return (
        <div className="rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
          <DebugLabel component="PauseControl" section="LoadingState" props={{ isLoadingStatus, useModernDesign: true }} />
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-slate-600 dark:text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Verificando estado...</span>
          </div>
        </div>
      )
    }
    return (
      <Card>
        <DebugLabel component="PauseControl" section="LoadingState" props={{ isLoadingStatus, useModernDesign: false }} />
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

  // Diseño moderno
  if (useModernDesign) {
    return (
      <>
        <div className={`group relative overflow-hidden rounded-2xl ${paused ? 'bg-red-50/80 dark:bg-red-900/30 border-red-200/50 dark:border-red-800/50' : 'bg-green-50/80 dark:bg-green-900/30 border-green-200/50 dark:border-green-800/50'} backdrop-blur-xl border shadow-lg hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`}>
          <DebugLabel component="PauseControl" section="MainCard" props={{ paused, useModernDesign: true, isPausing, isUnpausing }} />
          <div className={`absolute inset-0 ${paused ? 'bg-gradient-to-br from-red-500/10 to-rose-500/10' : 'bg-gradient-to-br from-green-500/10 to-emerald-500/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              {paused ? (
                <>
                  <div className="p-2 rounded-xl bg-red-500/20 dark:bg-red-400/20">
                    <Pause className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-700 dark:text-red-300">Contrato Pausado</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">El contrato está pausado. Las funciones críticas están deshabilitadas.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 rounded-xl bg-green-500/20 dark:bg-green-400/20">
                    <Play className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-700 dark:text-green-300">Contrato Activo</h3>
                    <p className="text-sm text-green-600 dark:text-green-400">El contrato está activo. Todas las funciones están disponibles.</p>
                  </div>
                </>
              )}
            </div>
            
            <div className="space-y-4">
              {paused ? (
                <>
                  <Alert className="rounded-xl bg-red-100/80 dark:bg-red-900/30 backdrop-blur border-red-300 dark:border-red-700">
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
                    className="w-full rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all"
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
                    <Alert className="rounded-xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur border-red-200 dark:border-red-800">
                      <AlertDescription className="text-red-700 dark:text-red-300">
                        ❌ Error: {unpauseError.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {unpauseSuccess && (
                    <Alert className="rounded-xl bg-green-50/80 dark:bg-green-900/30 backdrop-blur border-green-200 dark:border-green-800">
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
                    className="w-full rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-lg hover:shadow-xl transition-all"
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
                    <Alert className="rounded-xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur border-red-200 dark:border-red-800">
                      <AlertDescription className="text-red-700 dark:text-red-300">
                        ❌ Error: {pauseError.message}
                      </AlertDescription>
                    </Alert>
                  )}

                  {pauseSuccess && (
                    <Alert className="rounded-xl bg-green-50/80 dark:bg-green-900/30 backdrop-blur border-green-200 dark:border-green-800">
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        ✅ Contrato pausado exitosamente
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Dialogs modernos */}
        <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
          <DebugLabel component="PauseControl" section="PauseDialog" props={{ showPauseDialog, useModernDesign: true }} />
          <DialogContent className="rounded-2xl" aria-labelledby="pause-dialog-title">
            <DialogHeader>
              <DialogTitle id="pause-dialog-title" className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Confirmar Pausa del Contrato
              </DialogTitle>
              <DialogDescription>
                Esta acción pausará el contrato y deshabilitará todas las funciones críticas.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Alert className="rounded-xl bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
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
                  className="font-mono rounded-xl"
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
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handlePauseConfirm}
                disabled={confirmationText !== REQUIRED_CONFIRMATION}
                className="rounded-xl"
              >
                Confirmar Pausa
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showUnpauseDialog} onOpenChange={setShowUnpauseDialog}>
          <DebugLabel component="PauseControl" section="UnpauseDialog" props={{ showUnpauseDialog, useModernDesign: true }} />
          <DialogContent className="rounded-2xl" aria-labelledby="unpause-dialog-title">
            <DialogHeader>
              <DialogTitle id="unpause-dialog-title" className="flex items-center gap-2 text-green-600 dark:text-green-400">
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
                className="rounded-xl"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleUnpauseConfirm}
                className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                Reanudar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Diseño original
  return (
    <>
      <Card className={`${paused ? 'border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-900/20' : 'border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-900/20'} transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4`}>
        <DebugLabel component="PauseControl" section="MainCard" props={{ paused, useModernDesign: false, isPausing, isUnpausing }} />
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
        <DebugLabel component="PauseControl" section="PauseDialog" props={{ showPauseDialog, useModernDesign: false }} />
        <DialogContent aria-labelledby="pause-dialog-title-original">
          <DialogHeader>
            <DialogTitle id="pause-dialog-title-original" className="flex items-center gap-2 text-red-600 dark:text-red-400">
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
        <DebugLabel component="PauseControl" section="UnpauseDialog" props={{ showUnpauseDialog, useModernDesign: false }} />
        <DialogContent aria-labelledby="unpause-dialog-title-original">
          <DialogHeader>
            <DialogTitle id="unpause-dialog-title-original" className="flex items-center gap-2 text-green-600 dark:text-green-400">
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

