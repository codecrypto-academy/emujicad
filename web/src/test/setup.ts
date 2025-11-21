import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Limpiar después de cada test
afterEach(() => {
  cleanup()
})

// Mock de window.ethereum para tests
if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'ethereum', {
    value: {
      isMetaMask: true,
      request: vi.fn(),
      on: vi.fn(),
      removeListener: vi.fn(),
    },
    writable: true,
  })
}

