'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useAccount } from 'wagmi'

// Helper functions para manejar preferencias por usuario
const getUserThemeKey = (address: string) => `theme_${address.toLowerCase()}`
const getUserThemePreference = (address: string): 'light' | 'dark' | null => {
  if (!address) return null
  return localStorage.getItem(getUserThemeKey(address)) as 'light' | 'dark' | null
}
const setUserThemePreference = (address: string, theme: 'light' | 'dark') => {
  if (!address) return
  localStorage.setItem(getUserThemeKey(address), theme)
}

export function ThemeToggle() {
  const { address } = useAccount()
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (!address) {
      // Si no hay usuario conectado, usar modo claro por defecto
      document.documentElement.classList.remove('dark')
      setTheme('light')
      return
    }
    
    // Leer la preferencia guardada para este usuario específico
    const userPreference = getUserThemePreference(address)
    
    if (userPreference) {
      // Si hay preferencia guardada para este usuario, restaurarla
      if (userPreference === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      setTheme(userPreference)
    } else {
      // Si no hay preferencia guardada, usar claro por defecto
      document.documentElement.classList.remove('dark')
      setTheme('light')
    }
  }, [address])

  const toggleTheme = () => {
    if (!address) return
    
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    
    // Guardar la preferencia para este usuario específico
    setUserThemePreference(address, newTheme)
    
    // Aplicar el tema de forma explícita
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" className="w-10 h-10 p-0" disabled>
        <span className="text-lg">🌓</span>
      </Button>
    )
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="w-10 h-10 p-0"
      onClick={toggleTheme}
      title={theme === 'light' ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      aria-pressed={theme === 'dark'}
    >
      <span className="text-lg" aria-hidden="true">{theme === 'light' ? '🌙' : '☀️'}</span>
    </Button>
  )
}
