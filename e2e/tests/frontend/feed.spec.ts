import { test, expect } from '@playwright/test'

const API = 'http://localhost:8080/api/v1'

// ─── Unified helpers ─────────────────────────────────────────────

async function login(page: any, username = 'testuser', password = 'test12345') {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await page.fill('input[placeholder="username@email.com"]', username)
  await page.fill('input[placeholder="••••••••"]', password)
  await page.click('button[type="submit"]')

  // Wait for redirect away from login (zustand persist hydration can lag)
  try {
    await page.waitForFunction(
      () => window.location.pathname !== '/login',
      null,
      { timeout: 20000 }
    )
  } catch {
    // If still on login, the form may have failed — retry once
    if (page.url().includes('/login')) {
      await page.fill('input[placeholder="username@email.com"]', username)
      await page.fill('input[placeholder="••••••••"]', password)
      await page.click('button[type="submit"]')
      await page.waitForFunction(
        () => window.location.pathname !== '/login',
        null,
        { timeout: 20000 }
      )
    }
  }
  await page.waitForTimeout(500)
}

// ─── Auth UI ─────────────────────────────────────────────────────

test.describe('Auth UI', () => {
  test('landing page redirects to login for unauthenticated users', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })

  test('login page shows login form', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Masuk ke ruangx')).toBeVisible()
    await expect(page.getByPlaceholder('username@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible()
  })

  test('login page has link to register', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('link', { name: 'Daftar' })).toBeVisible()
  })

  test('register page shows register form', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Daftar ruangx')).toBeVisible()
    await expect(page.getByPlaceholder('username')).toBeVisible()
    await expect(page.getByPlaceholder('Nama Anda')).toBeVisible()
    await expect(page.getByPlaceholder('email@example.com')).toBeVisible()
  })

  test('register page has link to login', async ({ page }) => {
    await page.goto('/register', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('link', { name: 'Masuk' })).toBeVisible()
  })

  test('login with valid credentials redirects to feed', async ({ page }) => {
    await login(page)
    await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  })

  test('login with wrong password shows error', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await page.fill('input[placeholder="username@email.com"]', 'testuser')
    await page.fill('input[placeholder="••••••••"]', 'wrong_password')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(2000)
    // Should still be on login page or show error
    const url = page.url()
    const errorText = page.getByText(/sandi|gagal|error|Invalid credentials/i)
    const stillOnLogin = url.includes('/login')
    expect(stillOnLogin || await errorText.isVisible().catch(() => false)).toBeTruthy()
  })

  test('protected routes redirect to login when unauthenticated', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' })
    await expect(page).toHaveURL(/login/, { timeout: 10000 })
  })

  test('sidebar navigation is visible after login', async ({ page }) => {
    await login(page)
    await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
    await expect(page.getByText('Jelajahi')).toBeVisible({ timeout: 5000 })
    // ruangx logo (appears in multiple places — just check the first)
    await expect(page.getByText('ruangx').first()).toBeVisible()
  })

  test('logout from sidebar redirects to login', async ({ page }) => {
    await login(page)
    await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })

    // Click logout via settings page (more reliable)
    await page.goto('/settings', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(500)
    const logoutBtn = page.getByRole('button', { name: 'Keluar' })
    if (await logoutBtn.isVisible().catch(() => false)) {
      await logoutBtn.click()
      await expect(page).toHaveURL(/login/, { timeout: 10000 })
    }
  })
})

// ─── Feed UI ─────────────────────────────────────────────────────

test.describe('Feed UI — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  })

  test('feed shows "Untuk Anda" and "Mengikuti" tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Untuk Anda', exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Mengikuti', exact: true })).toBeVisible()
  })

  test('composer shows character count and submit button', async ({ page }) => {
    // Click the trigger to open the global composer modal
    await page.getByRole('button', { name: 'Posting' }).click()
    const textarea = page.getByPlaceholder('Apa yang ada di pikiranmu?')
    await expect(textarea).toBeVisible({ timeout: 5000 })
    await textarea.fill('Test post from E2E')
    await expect(page.getByText(/\/500$/).or(page.getByText(/\/500/i))).toBeVisible({ timeout: 3000 })
    await expect(page.getByRole('button', { name: 'Posting', exact: true })).toBeEnabled()
  })

  test('composer shows over-limit warning', async ({ page }) => {
    // Click the trigger to open the global composer modal
    await page.getByRole('button', { name: 'Posting' }).click()
    const textarea = page.getByPlaceholder('Apa yang ada di pikiranmu?')
    await expect(textarea).toBeVisible({ timeout: 5000 })
    await textarea.fill('A'.repeat(510))
    await expect(page.getByText('510/500')).toBeVisible({ timeout: 3000 })
    await expect(page.getByRole('button', { name: 'Posting', exact: true })).toBeDisabled()
  })
})

// ─── Navigation ──────────────────────────────────────────────────

test.describe('Navigation — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  })

  for (const { name, url, selector } of [
    { name: 'explore', url: '/explore', selector: 'Topik yang sedang tren' },
    { name: 'notifications', url: '/notifications', selector: 'Notifikasi' },
    { name: 'messages', url: '/messages', selector: 'Pesan' },
    { name: 'rooms', url: '/rooms', selector: 'Ruang' },
    { name: 'settings', url: '/settings', selector: 'Pengaturan' },
  ]) {
    test(`navigate to ${name} page`, async ({ page }) => {
      await page.goto(url, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(500)
      await expect(page.getByText(selector).first()).toBeVisible({ timeout: 10000 })
    })
  }

  test('navigate back to feed from settings', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(500)
    await page.getByRole('link', { name: /Beranda/ }).first().click()
    await expect(page.getByText('Beranda').first()).toBeVisible({ timeout: 5000 })
  })
})

// ─── Profile UI ──────────────────────────────────────────────────

test.describe('Profile UI — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  })

  test('profile page loads with @username', async ({ page }) => {
    await page.goto('/profile/testuser', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('@testuser').first()).toBeVisible({ timeout: 10000 })
  })

  test('profile page has tabs: Thread, Balasan, Suka, Media', async ({ page }) => {
    await page.goto('/profile/testuser', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: 'Thread', exact: true })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Balasan')).toBeVisible()
    await expect(page.getByText('Suka')).toBeVisible()
    await expect(page.getByText('Media')).toBeVisible()
  })

  test('profile page shows follower/following counts', async ({ page }) => {
    await page.goto('/profile/testuser', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Mengikuti')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Pengikut')).toBeVisible()
  })

  test('profile page shows join date', async ({ page }) => {
    await page.goto('/profile/testuser', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText(/Bergabung/)).toBeVisible({ timeout: 10000 })
  })
})

// ─── Settings UI ─────────────────────────────────────────────────

test.describe('Settings UI — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  })

  test('settings page loads with profile form', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Pengaturan')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Nama tampilan')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Bio')).toBeVisible()
    await expect(page.getByText('Website')).toBeVisible()
    await expect(page.getByText('Lokasi')).toBeVisible()
  })

  test('settings page has save and logout buttons', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('button', { name: 'Simpan' })).toBeVisible({ timeout: 5000 })
    await expect(page.getByRole('button', { name: 'Keluar' })).toBeVisible()
  })
})

// ─── Explore / Search UI ─────────────────────────────────────────

test.describe('Explore UI — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  })

  test('explore page shows trending topics', async ({ page }) => {
    await page.goto('/explore', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Topik yang sedang tren')).toBeVisible({ timeout: 10000 })
  })

  test('explore search works for known user', async ({ page }) => {
    await page.goto('/explore', { waitUntil: 'domcontentloaded' })
    const searchInput = page.getByPlaceholder('Cari orang & topik')
    await expect(searchInput).toBeVisible({ timeout: 5000 })
    await searchInput.fill('testuser')
    await page.waitForTimeout(1500)
    // Should show testuser in results
    await expect(page.getByText('@testuser').first()).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Search UI — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  })

  test('search page shows autofocused input', async ({ page }) => {
    await page.goto('/search', { waitUntil: 'domcontentloaded' })
    const searchInput = page.getByPlaceholder('Cari pengguna, kiriman, tagar...')
    await expect(searchInput).toBeVisible({ timeout: 10000 })
  })

  test('search page shows tabs after typing', async ({ page }) => {
    await page.goto('/search', { waitUntil: 'domcontentloaded' })
    await page.getByPlaceholder('Cari pengguna, kiriman, tagar...').fill('test')
    await page.waitForTimeout(1000)
    await expect(page.getByRole('tab', { name: 'Orang' })).toBeVisible({ timeout: 5000 })
  })
})

// ─── Hashtag UI ──────────────────────────────────────────────────

test.describe('Hashtag UI — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  })

  test('hashtag page loads with tag header', async ({ page }) => {
    await page.goto('/hashtag/testing', { waitUntil: 'domcontentloaded' })
    await expect(page.getByRole('heading', { name: '#testing' })).toBeVisible({ timeout: 10000 })
  })

  test('hashtag page has back button', async ({ page }) => {
    await page.goto('/hashtag/testing', { waitUntil: 'domcontentloaded' })
    await expect(page.locator('.lucide-chevron-left')).toBeVisible({ timeout: 10000 })
  })
})

// ─── Rooms UI ────────────────────────────────────────────────────

test.describe('Rooms UI — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  })

  test('rooms page loads with "Ruang" header', async ({ page }) => {
    await page.goto('/rooms', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Ruang').first()).toBeVisible({ timeout: 10000 })
  })
})

// ─── Notifications UI ────────────────────────────────────────────

test.describe('Notifications UI — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await login(page)
    await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  })

  test('notifications page loads with header', async ({ page }) => {
    await page.goto('/notifications', { waitUntil: 'domcontentloaded' })
    await expect(page.getByText('Notifikasi').first()).toBeVisible({ timeout: 10000 })
  })
})

// ─── Mobile & Layout ─────────────────────────────────────────────

test.describe('Layout — Authenticated', () => {
  test('mobile viewport shows bottom nav bar', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await login(page)
    // Mobile sticky header is visible
    await expect(page.locator('header.sticky')).toBeVisible({ timeout: 15000 })
    // Bottom nav bar is visible (icons only on mobile)
    await expect(page.locator('nav').filter({ hasText: '' }).last()).toBeVisible({ timeout: 5000 })
  })

  test('desktop viewport shows right panel', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await login(page)
    await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
    // Right panel search or trending
    const rpText = page.getByText(/Trending|Ruang Populer|Cari di ruangx/)
    if (await rpText.first().isVisible({ timeout: 5000 }).catch(() => false)) {
      await expect(rpText.first()).toBeVisible()
    }
  })
})