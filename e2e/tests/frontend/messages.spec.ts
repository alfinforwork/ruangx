import { test, expect } from '@playwright/test'

test.describe('Messages UI — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="username@email.com"]', 'testuser')
    await page.fill('input[placeholder="••••••••"]', 'test12345')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')
    await page.goto('/messages')
    await page.waitForTimeout(1000)
  })

  test('messages page loads with header', async ({ page }) => {
    await expect(page.getByText('Pesan').first()).toBeVisible({ timeout: 10000 })
  })

  test('empty state shows when no conversations', async ({ page }) => {
    const emptyText = page.getByText(/Belum ada percakapan|Mulai percakapan/)
    const convItems = page.locator('a[href*="/messages/"]')
    await expect(emptyText.or(convItems.first())).toBeVisible({ timeout: 5000 })
  })

  test('can navigate to conversation thread', async ({ page }) => {
    const firstConv = page.locator('a[href*="/messages/"]').first()
    if (await firstConv.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstConv.click()
      await page.waitForTimeout(1000)
      await expect(page.getByPlaceholder('Ketik pesan...')).toBeVisible({ timeout: 5000 })
    }
  })

  test('message thread has back button', async ({ page }) => {
    const firstConv = page.locator('a[href*="/messages/"]').first()
    if (await firstConv.isVisible({ timeout: 3000 }).catch(() => false)) {
      await firstConv.click()
      await expect(page.locator('.lucide-chevron-left')).toBeVisible({ timeout: 5000 })
    }
  })
})
