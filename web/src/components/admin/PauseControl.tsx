'use client'

import { useState } from 'react'
import { useAccount } from 'wagmi'
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
import { DebugLabel, DEBUG_MODE } from '@/lib/debug'
import { formatTransactionError, getWalletName } from '@/lib/error-formatter'

export function PauseControl() {
  const { data: isPaused, isLoading: isLoadingStatus } = useIsPaused()
  const { pause, isPending: isPausing, isConfirming: isConfirmingPause, isSuccess: pauseSuccess, error: pauseError } = usePause()
  const { unpause, isPending: isUnpausing, isConfirming: isConfirmingUnpause, isSuccess: unpauseSuccess, error: unpauseError } = useUnpause()
  const { connector } = useAccount()
  
  // Get the connected wallet name using the centralized function
  const walletName = getWalletName(connector)
  
  const [showPauseDialog, setShowPauseDialog] = useState(false)
  const [confirmationText, setConfirmationText] = useState('')
  const [showUnpauseDialog, setShowUnpauseDialog] = useState(false)
  
  // Enable modern design if enabled
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
        <div className="relative rounded-2xl bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-slate-200/50 dark:border-slate-700/50 p-6" style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
          <DebugLabel component="PauseControl" section="LoadingState" props={{ isLoadingStatus, useModernDesign: true }} position="top-right" offset={4} />
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-slate-600 dark:text-slate-400" />
            <span className="text-sm text-slate-600 dark:text-slate-400">Checking status...</span>
          </div>
        </div>
      )
    }
    return (
      <Card style={DEBUG_MODE ? { border: '3px solid rgba(255, 0, 0, 0.6)', borderRadius: '4px', padding: '4px' } : {}}>
        <DebugLabel component="PauseControl" section="LoadingState" props={{ isLoadingStatus, useModernDesign: false }} position="top-right" offset={4} />
        <CardHeader>
          <CardTitle>Contract Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Checking status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const paused = isPaused === true

  // Modern design
  if (useModernDesign) {
    return (
      <>
        <div className={`group relative overflow-hidden rounded-2xl ${paused ? 'bg-red-50/80 dark:bg-red-900/30 border-red-200/50 dark:border-red-800/50' : 'bg-green-50/80 dark:bg-green-900/30 border-green-200/50 dark:border-green-800/50'} backdrop-blur-xl border shadow-lg hover:shadow-2xl transition-all duration-500 animate-in fade-in slide-in-from-bottom-4`} style={DEBUG_MODE ? { outline: '3px solid rgba(0, 128, 0, 0.6)', outlineOffset: '0px' } : {}}>
          <DebugLabel component="PauseControl" section="MainCard" props={{ paused, useModernDesign: true, isPausing, isUnpausing }} position="top-left" offset={4} />
          <div className={`absolute inset-0 ${paused ? 'bg-gradient-to-br from-red-500/10 to-rose-500/10' : 'bg-gradient-to-br from-green-500/10 to-emerald-500/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
          <div className="relative p-6">
            <div className="flex items-center gap-3 mb-4">
              {paused ? (
                <>
                  <div className="p-2 rounded-xl bg-red-500/20 dark:bg-red-400/20">
                    <Pause className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-red-700 dark:text-red-300">Contract Paused</h3>
                    <p className="text-sm text-red-600 dark:text-red-400">The contract is paused. Critical functions are disabled.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-2 rounded-xl bg-green-500/20 dark:bg-green-400/20">
                    <Play className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-green-700 dark:text-green-300">Contract Active</h3>
                    <p className="text-sm text-green-600 dark:text-green-400">The contract is active. All functions are available.</p>
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
                      <strong>Disabled functions:</strong>
                      <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                        <li>Request role or change role</li>
                        <li>Create tokens</li>
                        <li>Make transfers</li>
                        <li>Accept/Reject/Cancel transfers</li>
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
                        {isUnpausing ? 'Confirming...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Resume Contract
                      </>
                    )}
                  </Button>

                  {unpauseError && (() => {
                    const { friendlyMessage, isUserCancelled, technicalDetails } = formatTransactionError(
                      unpauseError,
                      {
                        action: 'unpausing the contract',
                        walletName,
                      }
                    )
                    // Dividir el mensaje por líneas y filtrar líneas vacías
                    const messageLines = friendlyMessage.split('\n').filter(line => line.trim() !== '')
                    return (
                    <Alert className="rounded-xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur border-red-200 dark:border-red-800">
                      <AlertDescription className="text-red-700 dark:text-red-300">
                          {messageLines.map((line, index) => (
                            <p key={index} className={index === 0 ? 'font-semibold' : 'mt-1 text-sm'}>
                              {line}
                            </p>
                          ))}
                          {isUserCancelled && (
                            <p className="text-sm mt-1">
                              You can try again by clicking "Unpause Contract" below.
                            </p>
                          )}
                          {process.env.NODE_ENV === 'development' && technicalDetails && (
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

                  {unpauseSuccess && (
                    <Alert className="rounded-xl bg-green-50/80 dark:bg-green-900/30 backdrop-blur border-green-200 dark:border-green-800">
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        ✅ Contract resumed successfully
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
                        {isPausing ? 'Confirming...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <Pause className="h-4 w-4 mr-2" />
                        Pause Contract
                      </>
                    )}
                  </Button>

                  {pauseError && (() => {
                    const { friendlyMessage, isUserCancelled, technicalDetails } = formatTransactionError(
                      pauseError,
                      {
                        action: 'pausing the contract',
                        walletName,
                      }
                    )
                    // Dividir el mensaje por líneas y filtrar líneas vacías
                    const messageLines = friendlyMessage.split('\n').filter(line => line.trim() !== '')
                    return (
                    <Alert className="rounded-xl bg-red-50/80 dark:bg-red-900/30 backdrop-blur border-red-200 dark:border-red-800">
                      <AlertDescription className="text-red-700 dark:text-red-300">
                          {messageLines.map((line, index) => (
                            <p key={index} className={index === 0 ? 'font-semibold' : 'mt-1 text-sm'}>
                              {line}
                            </p>
                          ))}
                          {isUserCancelled && (
                            <p className="text-sm mt-1">
                              You can try again by clicking "Pause Contract" below.
                            </p>
                          )}
                          {process.env.NODE_ENV === 'development' && technicalDetails && (
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

                  {pauseSuccess && (
                    <Alert className="rounded-xl bg-green-50/80 dark:bg-green-900/30 backdrop-blur border-green-200 dark:border-green-800">
                      <AlertDescription className="text-green-700 dark:text-green-300">
                        ✅ Contract paused successfully
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Modern dialogs */}
        <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
          <DialogContent className="rounded-2xl" aria-labelledby="pause-dialog-title" style={DEBUG_MODE ? { outline: '3px solid rgba(0, 128, 0, 0.6)', outlineOffset: '0px' } : {}}>
            <div className="relative">
              <DebugLabel component="PauseControl" section="PauseDialog" props={{ showPauseDialog, useModernDesign: true }} position="top-right" offset={4} />
              <DialogHeader>
              <DialogTitle id="pause-dialog-title" className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertTriangle className="h-5 w-5" />
                Confirm Contract Pause
              </DialogTitle>
              <DialogDescription>
                This action will pause the contract and disable all critical functions.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Alert className="rounded-xl bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertDescription className="text-red-700 dark:text-red-300">
                  <strong>⚠️ Warning:</strong> Pausing the contract will disable:
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Role requests</li>
                    <li>Role changes</li>
                    <li>Token creation</li>
                    <li>All transfers</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label htmlFor="confirmation">
                  Type <strong className="font-mono">PAUSAR</strong> to confirm:
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
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handlePauseConfirm}
                disabled={confirmationText !== REQUIRED_CONFIRMATION}
                className="rounded-xl"
              >
                Confirm Pause
              </Button>
            </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={showUnpauseDialog} onOpenChange={setShowUnpauseDialog}>
          <DialogContent className="rounded-2xl" aria-labelledby="unpause-dialog-title" style={DEBUG_MODE ? { outline: '3px solid rgba(0, 128, 0, 0.6)', outlineOffset: '0px' } : {}}>
            <div className="relative">
              <DebugLabel component="PauseControl" section="UnpauseDialog" props={{ showUnpauseDialog, useModernDesign: true }} position="top-right" offset={4} />
              <DialogHeader>
              <DialogTitle id="unpause-dialog-title" className="flex items-center gap-2 text-green-600 dark:text-green-400">
                <Play className="h-5 w-5" />
                Resume Contract
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to resume the contract? This will enable all functions again.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowUnpauseDialog(false)}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                onClick={handleUnpauseConfirm}
                className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
              >
                Resume
              </Button>
            </DialogFooter>
            </div>
          </DialogContent>
        </Dialog>
      </>
    )
  }

  // Original design
  return (
    <>
      <Card className={`${paused ? 'border-red-500 dark:border-red-700 bg-red-50 dark:bg-red-900/20' : 'border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-900/20'} transition-all duration-300 hover:shadow-lg animate-in fade-in slide-in-from-bottom-4`} style={DEBUG_MODE ? { outline: '3px solid rgba(0, 128, 0, 0.6)', outlineOffset: '0px' } : {}}>
        <DebugLabel component="PauseControl" section="MainCard" props={{ paused, useModernDesign: false, isPausing, isUnpausing }} position="top-left" offset={4} />
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {paused ? (
              <>
                <Pause className="h-5 w-5 text-red-600 dark:text-red-400" />
                <span className="text-red-700 dark:text-red-300">Contract Paused</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-green-700 dark:text-green-300">Contract Active</span>
              </>
            )}
          </CardTitle>
          <CardDescription className={paused ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}>
            {paused 
              ? 'The contract is paused. Critical functions are disabled.'
              : 'The contract is active. All functions are available.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {paused ? (
            <>
              <Alert className="bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <AlertDescription className="text-red-700 dark:text-red-300">
                  <strong>Disabled functions:</strong>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>Request role or change role</li>
                    <li>Create tokens</li>
                    <li>Make transfers</li>
                    <li>Accept/Reject/Cancel transfers</li>
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

              {unpauseError && (() => {
                const { friendlyMessage, isUserCancelled, technicalDetails } = formatTransactionError(
                  unpauseError,
                  {
                    action: 'unpausing the contract',
                    walletName,
                  }
                )
                // Dividir el mensaje por líneas y filtrar líneas vacías
                const messageLines = friendlyMessage.split('\n').filter(line => line.trim() !== '')
                return (
                <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <AlertDescription className="text-red-700 dark:text-red-300">
                      {messageLines.map((line, index) => (
                        <p key={index} className={index === 0 ? 'font-semibold' : 'mt-1 text-sm'}>
                          {line}
                        </p>
                      ))}
                      {isUserCancelled && (
                        <p className="text-sm mt-1">
                          You can try again by clicking "Unpause Contract" below.
                        </p>
                      )}
                      {process.env.NODE_ENV === 'development' && technicalDetails && (
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

              {pauseError && (() => {
                const { friendlyMessage, isUserCancelled, technicalDetails } = formatTransactionError(
                  pauseError,
                  {
                    action: 'pausing the contract',
                    walletName,
                  }
                )
                // Dividir el mensaje por líneas y filtrar líneas vacías
                const messageLines = friendlyMessage.split('\n').filter(line => line.trim() !== '')
                return (
                <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                  <AlertDescription className="text-red-700 dark:text-red-300">
                      {messageLines.map((line, index) => (
                        <p key={index} className={index === 0 ? 'font-semibold' : 'mt-1 text-sm'}>
                          {line}
                        </p>
                      ))}
                      {isUserCancelled && (
                        <p className="text-sm mt-1">
                          You can try again by clicking "Pause Contract" below.
                        </p>
                      )}
                      {process.env.NODE_ENV === 'development' && technicalDetails && (
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

      {/* Confirmation dialog for pause */}
      <Dialog open={showPauseDialog} onOpenChange={setShowPauseDialog}>
        <DialogContent aria-labelledby="pause-dialog-title-original" style={DEBUG_MODE ? { outline: '3px solid rgba(0, 128, 0, 0.6)', outlineOffset: '0px' } : {}}>
          <div className="relative">
            <DebugLabel component="PauseControl" section="PauseDialog" props={{ showPauseDialog, useModernDesign: false }} position="top-right" offset={4} />
            <DialogHeader>
            <DialogTitle id="pause-dialog-title-original" className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              Confirm Contract Pause
            </DialogTitle>
            <DialogDescription>
              This action will pause the contract and disable all critical functions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <AlertDescription className="text-red-700 dark:text-red-300">
                <strong>⚠️ Warning:</strong> Pausing the contract will disable:
                <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                  <li>Role requests</li>
                  <li>Role changes</li>
                  <li>Token creation</li>
                  <li>All transfers</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="confirmation">
                Type <strong className="font-mono">PAUSAR</strong> to confirm:
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
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handlePauseConfirm}
              disabled={confirmationText !== REQUIRED_CONFIRMATION}
            >
              Confirm Pause
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog for resume */}
      <Dialog open={showUnpauseDialog} onOpenChange={setShowUnpauseDialog}>
        <DialogContent aria-labelledby="unpause-dialog-title-original" style={DEBUG_MODE ? { outline: '3px solid rgba(0, 128, 0, 0.6)', outlineOffset: '0px' } : {}}>
          <div className="relative">
            <DebugLabel component="PauseControl" section="UnpauseDialog" props={{ showUnpauseDialog, useModernDesign: false }} position="top-right" offset={4} />
            <DialogHeader>
            <DialogTitle id="unpause-dialog-title-original" className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <Play className="h-5 w-5" />
              Resume Contract
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to resume the contract? This will enable all functions again.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowUnpauseDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUnpauseConfirm}
              className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
            >
              Resume
            </Button>
          </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

