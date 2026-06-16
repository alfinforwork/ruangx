import { test, expect } from '@playwright/test'

test.describe('Rooms UI — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="username@email.com"]', 'testuser')
    await page.fill('input[placeholder="••••••••"]', 'test12345')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')
    await page.goto('/rooms')
    await page.waitForTimeout(1000)
  })

  test('rooms page loads with header', async ({ page }) => {
    await expect(page.getByText('Ruang').first()).toBeVisible({ timeout: 10000 })
  })

  test('can navigate to room detail', async ({ page }) => {
    const firstRoom = page.locator('a[href*="/rooms/"]').first()
    if (await firstRoom.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstRoom.click()
      await page.waitForTimeout(1000)
      await expect(page.getByText(/anggota|Dibuat oleh/)).toBeVisible({ timeout: 5000 })
    }
  })

  test('room detail has back button', async ({ page }) => {
    const firstRoom = page.locator('a[href*="/rooms/"]').first()
    if (await firstRoom.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstRoom.click()
      await expect(page.locator('.lucide-chevron-left')).toBeVisible({ timeout: 5000 })
    }
  })
})
