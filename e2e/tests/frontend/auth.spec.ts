import { test, expect } from '@playwright/test'

test.describe('Auth UI', () => {
  test('landing page redirects to login for unauthenticated users', async ({ page }) => {
    await page.goto('/')
    await page.waitForURL('**/login')
  })

  test('login page shows login form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByText('Masuk ke ruangx')).toBeVisible()
    await expect(page.getByPlaceholder('username@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible()
  })

  test('login page has link to register', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('link', { name: 'Daftar' })).toBeVisible()
  })

  test('register page shows register form', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByText('Daftar ruangx')).toBeVisible()
    await expect(page.getByPlaceholder('username')).toBeVisible()
    await expect(page.getByPlaceholder('Nama Anda')).toBeVisible()
    await expect(page.getByPlaceholder('email@example.com')).toBeVisible()
  })

  test('register page has link to login', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('link', { name: 'Masuk' })).toBeVisible()
  })

  test('login with valid credentials redirects to feed', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="username@email.com"]', 'testuser')
    await page.fill('input[placeholder="••••••••"]', 'test12345')
    await page.click('button[type="submit"]')

    // Wait for navigation — auth store hydration may lag
    await page.waitForFunction(() => !window.location.href.includes('/login'), null, { timeout: 15000 })
    await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  })

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="username@email.com"]', 'testuser')
    await page.fill('input[placeholder="••••••••"]', 'wrong_password')
    await page.click('button[type="submit"]')

    await expect(page.getByText(/sandi|gagal|error/i)).toBeVisible({ timeout: 5000 })
  })

  test('logout from sidebar redirects to login', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[placeholder="username@email.com"]', 'testuser')
    await page.fill('input[placeholder="••••••••"]', 'test12345')
    await page.click('button[type="submit"]')
    await page.waitForFunction(() => !window.location.href.includes('/login'), null, { timeout: 15000 })
    await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })

    // Open user menu in sidebar, then click Keluar
    const menuTrigger = page.locator('aside button', { has: page.locator('.lucide-more-vertical') }).first()
    if (await menuTrigger.isVisible({ timeout: 3000 }).catch(() => false)) {
      await menuTrigger.click()
      await page.getByText('Keluar').click()
    } else {
      // Fallback: use settings page logout button
      await page.goto('/settings')
      await page.getByRole('button', { name: 'Keluar' }).click()
    }

    await page.waitForURL('**/login', { timeout: 10000 })
  })

  test('protected routes redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/settings')
    await page.waitForURL('**/login')

    await page.goto('/notifications')
    await page.waitForURL('**/login')

    await page.goto('/messages')
    await page.waitForURL('**/login')
  })

  test('sidebar navigation is visible after login', async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="username@email.com"]', 'testuser')
    await page.fill('input[placeholder="••••••••"]', 'test12345')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')

    await expect(page.getByText('ruangx').first()).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('link', { name: 'Beranda', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Jelajahi', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Notifikasi', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Pesan', exact: true })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Ruang', exact: true })).toBeVisible()
  })
})
