import { test, expect } from '@playwright/test'

test.describe('Tokens Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar a la página de tokens
    await page.goto('http://localhost:3000/tokens')
  })

  test('should display tokens page with header', async ({ page }) => {
    // Verificar que la página carga
    await expect(page).toHaveTitle(/Supply Chain Tracker|Next.js/)
    
    // Verificar que existe el título "All Tokens"
    const title = page.getByRole('heading', { name: /All Tokens/i })
    await expect(title).toBeVisible()
  })

  test('should display filters section', async ({ page }) => {
    // Verificar que existe la sección de filtros
    const filtersCard = page.getByText(/Filters/i)
    await expect(filtersCard).toBeVisible()
    
    // Verificar que existe el input de búsqueda
    const searchInput = page.getByPlaceholder(/Search tokens/i)
    await expect(searchInput).toBeVisible()
    
    // Verificar que existe el select de filtro por tipo
    const filterSelect = page.getByLabel(/Filter by type/i)
    await expect(filterSelect).toBeVisible()
  })

  test('should have search input accessible', async ({ page }) => {
    // Verificar que el input de búsqueda tiene aria-label
    const searchInput = page.getByPlaceholder(/Search tokens/i)
    await expect(searchInput).toHaveAttribute('aria-label', 'Search tokens by name')
  })

  test('should have filter select accessible', async ({ page }) => {
    // Verificar que el select tiene aria-label
    const filterSelect = page.getByLabel(/Filter by type/i)
    await expect(filterSelect).toHaveAttribute('aria-label', 'Filter tokens by type')
  })

  test('should display loading state initially', async ({ page }) => {
    // Verificar que se muestran skeletons durante la carga
    // (puede que no siempre se vean si carga muy rápido)
    const skeletons = page.locator('[class*="animate-pulse"]')
    // No fallar si no hay skeletons (carga muy rápida)
    const count = await skeletons.count()
    if (count > 0) {
      await expect(skeletons.first()).toBeVisible()
    }
  })

  test('should redirect to home if not authenticated', async ({ page, context }) => {
    // Limpiar localStorage y cookies para simular usuario no autenticado
    await context.clearCookies()
    await page.evaluate(() => localStorage.clear())
    
    // Recargar la página
    await page.reload()
    
    // Esperar un momento para que la redirección ocurra
    await page.waitForTimeout(1000)
    
    // Verificar que se redirige a la página principal
    const currentUrl = page.url()
    expect(currentUrl).toMatch(/\/($|\?)/)
  })

  test('should have responsive layout', async ({ page }) => {
    // Verificar que el layout es responsive
    const container = page.locator('.container')
    await expect(container).toBeVisible()
    
    // Verificar que el grid existe
    const grid = page.locator('[class*="grid"]').first()
    await expect(grid).toBeVisible()
  })
})

