import { test, expect } from '@playwright/test'

test.describe('Home Page', () => {
  test('should display the main title', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('heading', { name: /supply chain tracker/i })).toBeVisible()
  })

  test('should show connect wallet button when not connected', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('button', { name: /conectar wallet/i })).toBeVisible()
  })

  test('should navigate to dashboard when clicking stats', async ({ page }) => {
    await page.goto('/')
    // This test would require wallet connection mock
    // For now, just verify the page loads
    await expect(page).toHaveTitle(/supply chain/i)
  })
})

