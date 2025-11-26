/**
 * Sistema de debug para identificar componentes en la UI
 * Activar con: NEXT_PUBLIC_DEBUG_MODE=true
 */

'use client'

import { useState, useEffect } from 'react'

export const DEBUG_MODE = process.env.NEXT_PUBLIC_DEBUG_MODE === 'true'

// Contador global para numerar los DebugLabels en orden de renderizado
let debugLabelCounter = 0
// Mapa para mantener números estables por componente+sección
const componentNumberMap = new Map<string, number>()
let stableCounter = 0
const debugLabelHistory: Array<{
  number: number
  stableNumber?: number
  component: string
  section?: string
  props?: Record<string, any>
  timestamp: number
  stackTrace?: string
}> = []

// Función para obtener un stack trace simplificado (últimas 3 líneas)
function getSimplifiedStackTrace(): string {
  try {
    const stack = new Error().stack
    if (!stack) return ''
    const lines = stack.split('\n').slice(3, 6) // Saltar las primeras 3 líneas (Error, getSimplifiedStackTrace, DebugLabel)
    return lines.map(line => line.trim()).join(' | ')
  } catch {
    return ''
  }
}

export function DebugLabel({ 
  component, 
  section, 
  props,
  position = 'top-right', // 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
  offset = 0 // Offset vertical en píxeles para evitar superposiciones
}: { 
  component: string
  section?: string
  props?: Record<string, any>
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'
  offset?: number // Offset vertical en píxeles
}) {
  // Solo renderizar en el cliente después de la hidratación para evitar errores de hidratación
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!DEBUG_MODE || !mounted) return null

  // Obtener número estable para este componente+sección (no cambia entre re-renders)
  const componentKey = section ? `${component}::${section}` : component
  let stableNumber = componentNumberMap.get(componentKey)
  if (stableNumber === undefined) {
    stableNumber = ++stableCounter
    componentNumberMap.set(componentKey, stableNumber)
  }
  
  // Contador de renderizado: solo incrementar cuando el componente realmente se renderiza
  // (ya pasamos la verificación de DEBUG_MODE, así que este componente será visible)
  const labelNumber = ++debugLabelCounter
  const timestamp = Date.now()
  const stackTrace = getSimplifiedStackTrace()
  
  const label = section ? `${component} > ${section}` : component
  const propsStr = props ? Object.entries(props)
    .filter(([_, v]) => v !== undefined && v !== null)
    .map(([k, v]) => {
      if (typeof v === 'boolean') return `${k}=${v}`
      if (typeof v === 'string' && v.length > 20) return `${k}="${v.slice(0, 20)}..."`
      return `${k}=${v}`
    })
    .join(' ') : ''

  // Registrar en el historial y logs SOLO si estamos en el cliente
  // Esto asegura que solo contamos componentes que realmente se renderizan
  if (typeof window !== 'undefined') {
    debugLabelHistory.push({
      number: labelNumber,
      stableNumber,
      component,
      section,
      props,
      timestamp,
      stackTrace
    })
    
    // Log detallado con número estable y número de renderizado (consistente con la UI)
    console.log(
      `[DebugLabel #${stableNumber} (render: #${labelNumber})] ${label}`,
      {
        props: props || {},
        timestamp: new Date(timestamp).toISOString(),
        renderOrder: labelNumber,
        stableNumber: stableNumber,
        totalRendered: debugLabelCounter,
        stackTrace
      }
    )
    
    // Cada 10 renderizados, mostrar un resumen del historial
    if (debugLabelCounter % 10 === 0) {
      console.group(`[DebugLabel History] Last 10 renders:`)
      debugLabelHistory.slice(-10).forEach(entry => {
        console.log(
          `#${entry.stableNumber} (render: #${entry.number}) - ${entry.component}${entry.section ? ` > ${entry.section}` : ''}`,
          `(${new Date(entry.timestamp).toLocaleTimeString()})`
        )
      })
      console.groupEnd()
    }
  }

  const isBottom = position === 'bottom-right' || position === 'bottom-left'
  const isLeft = position === 'top-left' || position === 'bottom-left'
  
  return (
    <div 
      style={{
        position: 'absolute',
        top: isBottom ? 'auto' : (offset < 0 ? offset : Math.max(offset, 4)),
        bottom: isBottom ? (offset < 0 ? offset : Math.max(offset, 4)) : 'auto',
        right: isLeft ? 'auto' : 4,
        left: isLeft ? 4 : 'auto',
        background: 'rgba(255, 0, 0, 0.95)',
        color: 'white',
        padding: '3px 6px',
        fontSize: '10px',
        fontFamily: 'monospace',
        zIndex: 99999,
        borderRadius: '3px',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        maxWidth: '350px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        border: '2px solid rgba(255, 255, 255, 0.8)',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        lineHeight: '1.2'
      }}
      title={`#${stableNumber} (render: #${labelNumber}) - ${label}${propsStr ? ` | ${propsStr}` : ''} | Rendered at ${new Date(timestamp).toLocaleTimeString()}`}
    >
      🔍 <strong>#{stableNumber}</strong> <span style={{ opacity: 0.7, fontSize: '9px' }}>(#{labelNumber})</span> <strong>{label}</strong>
      {propsStr && <span style={{ opacity: 0.8, marginLeft: '4px', fontSize: '9px' }}>| {propsStr}</span>}
    </div>
  )
}

// Componente wrapper para enmarcar elementos con DebugLabel
export function DebugWrapper({ 
  component, 
  section, 
  props,
  position = 'top-right',
  offset = 0,
  children,
  className = ''
}: { 
  component: string
  section?: string
  props?: Record<string, any>
  position?: 'top-right' | 'bottom-right'
  offset?: number
  children: React.ReactNode
  className?: string
}) {
  if (!DEBUG_MODE) {
    return <>{children}</>
  }

  return (
    <div 
      className={className}
      style={{
        position: 'relative',
        border: '3px solid rgba(255, 0, 0, 0.6)',
        borderRadius: '4px',
        padding: '2px',
        boxShadow: '0 0 0 1px rgba(255, 0, 0, 0.3) inset'
      }}
    >
      <DebugLabel 
        component={component} 
        section={section} 
        props={props} 
        position={position} 
        offset={offset} 
      />
      {children}
    </div>
  )
}

// Función para obtener el historial completo de DebugLabels (útil para debugging)
export function getDebugLabelHistory() {
  return [...debugLabelHistory]
}

// Función para limpiar el historial (útil para reiniciar el contador)
export function clearDebugLabelHistory() {
  debugLabelCounter = 0
  stableCounter = 0
  componentNumberMap.clear()
  debugLabelHistory.length = 0
  if (typeof window !== 'undefined') {
    console.log('[DebugLabel] History cleared')
  }
}

