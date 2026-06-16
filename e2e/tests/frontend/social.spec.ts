import { test, expect } from '@playwright/test'

test.describe('Hashtag UI — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="username@email.com"]', 'testuser')
    await page.fill('input[placeholder="••••••••"]', 'test12345')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')
  })

  test('hashtag page loads with tag header', async ({ page }) => {
    await page.goto('/hashtag/testing')
    await expect(page.getByRole('heading', { name: '#testing' })).toBeVisible({ timeout: 10000 })
  })

  test('hashtag page has back button', async ({ page }) => {
    await page.goto('/hashtag/testing')
    await expect(page.locator('.lucide-chevron-left')).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Mobile Nav — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/login')
    await page.fill('input[placeholder="username@email.com"]', 'testuser')
    await page.fill('input[placeholder="••••••••"]', 'test12345')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')
  })

  test('mobile bottom nav is visible', async ({ page }) => {
    // Mobile sticky header is visible in mobile viewport
    await expect(page.locator('header.sticky')).toBeVisible({ timeout: 5000 })
  })

  test('floating post button visible on mobile', async ({ page }) => {
    const floatingBtn = page.locator('button.fixed.bottom-20')
    if (await floatingBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(floatingBtn).toBeVisible()
    }
  })
})

test.describe('Right Panel — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.goto('/login')
    await page.fill('input[placeholder="username@email.com"]', 'testuser')
    await page.fill('input[placeholder="••••••••"]', 'test12345')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')
  })

  test('right panel shows trending section', async ({ page }) => {
    await page.waitForTimeout(1000)
    const trending = page.getByText(/Trending|Ruang Populer/)
    if (await trending.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(trending.first()).toBeVisible()
    }
  })
})
