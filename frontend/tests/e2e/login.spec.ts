import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/login')
    
    // Fill login form
    await page.fill('input[name="email"]', 'admin@burgerexpress.com')
    await page.fill('input[name="password"]', 'admin123')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill with invalid credentials
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    
    // Submit form
    await page.click('button[type="submit"]')
    
    // Should show error message
    await expect(page.locator('.toast-error')).toBeVisible()
  })

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/login')
    
    // Click register link
    await page.click('a[href="/register"]')
    
    // Should redirect to register page
    await expect(page).toHaveURL('/register')
    await expect(page.locator('h2')).toContainText('Criar Conta')
  })
})

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.fill('input[name="email"]', 'admin@burgerexpress.com')
    await page.fill('input[name="password"]', 'admin123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
  })

  test('should display dashboard stats', async ({ page }) => {
    // Check if stats cards are visible
    await expect(page.locator('text=Vendas do Dia')).toBeVisible()
    await expect(page.locator('text=Pedidos')).toBeVisible()
    await expect(page.locator('text=Clientes')).toBeVisible()
    await expect(page.locator('text=Produtos')).toBeVisible()
  })

  test('should navigate to products page', async ({ page }) => {
    // Click products link in sidebar
    await page.click('a[href="/products"]')
    
    // Should redirect to products page
    await expect(page).toHaveURL('/products')
    await expect(page.locator('h1')).toContainText('Produtos')
  })
})
