'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Leer el tema guardado en localStorage, por defecto siempre claro
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
    const initialTheme = savedTheme || 'light'
    
    // Si no hay tema guardado, asegurar que inicie en claro
    if (!savedTheme) {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.toggle('dark', initialTheme === 'dark')
    }
    setTheme(initialTheme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
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
    >
      <span className="text-lg">{theme === 'light' ? '🌙' : '☀️'}</span>
    </Button>
  )
}
