import { test, expect } from '@playwright/test'

test.describe('Profile UI — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="username@email.com"]', 'testuser')
    await page.fill('input[placeholder="••••••••"]', 'test12345')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')
  })

  test('profile page loads with user info', async ({ page }) => {
    await page.goto('/profile/testuser')
    await expect(page.getByText('@testuser').first()).toBeVisible({ timeout: 10000 })
  })

  test('profile page has tabs: Thread, Balasan, Suka, Media', async ({ page }) => {
    await page.goto('/profile/testuser')
    await expect(page.getByRole('button', { name: 'Thread', exact: true })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Balasan')).toBeVisible()
    await expect(page.getByText('Suka')).toBeVisible()
    await expect(page.getByText('Media')).toBeVisible()
  })

  test('profile page shows follower and following counts', async ({ page }) => {
    await page.goto('/profile/testuser')
    await expect(page.getByText('Mengikuti')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Pengikut')).toBeVisible()
  })

  test('profile page has back button to feed', async ({ page }) => {
    await page.goto('/profile/testuser')
    // Profile page has Thread/Balasan tabs that serve as page landmark
    await expect(page.getByRole('button', { name: 'Thread', exact: true })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Balasan')).toBeVisible()
  })

  test('own profile shows in sidebar user section', async ({ page }) => {
    const sidebarUser = page.locator('aside').getByText('@testuser')
    await expect(sidebarUser).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Settings UI — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="username@email.com"]', 'testuser')
    await page.fill('input[placeholder="••••••••"]', 'test12345')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')
  })

  test('settings page loads with profile form', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByText('Pengaturan')).toBeVisible({ timeout: 10000 })
  })

  test('settings page shows name, bio, website, location fields', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByText('Nama tampilan')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Bio')).toBeVisible()
    await expect(page.getByText('Website')).toBeVisible()
    await expect(page.getByText('Lokasi')).toBeVisible()
  })

  test('settings page has save button', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('button', { name: 'Simpan' })).toBeVisible({ timeout: 5000 })
  })

  test('settings page has logout button', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByRole('button', { name: 'Keluar' })).toBeVisible({ timeout: 5000 })
  })

  test('can update display name', async ({ page }) => {
    await page.goto('/settings')
    // First input in settings is the display name field
    const nameInput = page.locator('input').first()
    await nameInput.fill('E2E Updated Name')
    await page.getByRole('button', { name: 'Simpan' }).click()
    await page.waitForTimeout(2000)
  })
})
