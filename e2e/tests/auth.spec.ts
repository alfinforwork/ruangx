import { test, expect } from '@playwright/test'

const API = 'http://localhost:8080/api/v1'

test.describe('Auth API', () => {
  let freshUser: string

  test('POST /auth/register — create new user', async ({ request }) => {
    freshUser = `e2e${Date.now()}`
    const res = await request.post(`${API}/auth/register`, {
      data: {
        username: freshUser,
        display_name: 'E2E Tester',
        email: `${freshUser}@test.com`,
        password: 'test12345',
      },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.access_token).toBeTruthy()
    expect(body.data.refresh_token).toBeTruthy()
    expect(body.data.user.username).toBe(freshUser)
    expect(body.data.user.display_name).toBe('E2E Tester')
  })

  test('POST /auth/register — reject missing fields', async ({ request }) => {
    const res = await request.post(`${API}/auth/register`, {
      data: { username: 'a', password: 'test12345' },
    })
    expect([400, 422]).toContain(res.status())
  })

  test('POST /auth/register — reject short username', async ({ request }) => {
    const res = await request.post(`${API}/auth/register`, {
      data: { username: 'ab', display_name: 'Test', email: 'ab@test.com', password: 'test12345' },
    })
    expect([400, 422]).toContain(res.status())
  })

  test('POST /auth/register — reject duplicate username', async ({ request }) => {
    const res = await request.post(`${API}/auth/register`, {
      data: { username: 'testuser', display_name: 'Dup', email: 'dup@test.com', password: 'test12345' },
    })
    expect(res.status()).toBe(409)
  })

  test('POST /auth/login — login with valid credentials (username)', async ({ request }) => {
    const res = await request.post(`${API}/auth/login`, {
      data: { username: 'testuser', password: 'password123' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.access_token).toBeTruthy()
    expect(body.data.refresh_token).toBeTruthy()
    expect(body.data.user.username).toBe('testuser')
  })

  test('POST /auth/login — reject wrong password', async ({ request }) => {
    const res = await request.post(`${API}/auth/login`, {
      data: { username: 'testuser', password: 'wrongpass' },
    })
    expect(res.status()).toBe(401)
  })

  test('POST /auth/login — reject non-existent user', async ({ request }) => {
    const res = await request.post(`${API}/auth/login`, {
      data: { username: 'nonexistent_user_12345', password: 'test12345' },
    })
    expect(res.status()).toBe(401)
  })

  test('POST /auth/login — reject empty credentials', async ({ request }) => {
    const res = await request.post(`${API}/auth/login`, {
      data: { username: '', password: '' },
    })
    expect([400, 422]).toContain(res.status())
  })

  test('POST /auth/refresh — refresh token', async ({ request }) => {
    const login = await request.post(`${API}/auth/login`, {
      data: { username: 'testuser', password: 'password123' },
    })
    const { refresh_token } = (await login.json()).data

    const res = await request.post(`${API}/auth/refresh`, {
      data: { refresh_token },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.access_token).toBeTruthy()
    expect(body.data.refresh_token).toBeTruthy()
  })

  test('POST /auth/refresh — reject invalid token', async ({ request }) => {
    const res = await request.post(`${API}/auth/refresh`, {
      data: { refresh_token: 'invalid_token_here_12345' },
    })
    expect(res.status()).toBe(401)
  })

  test('POST /auth/logout — logout (authenticated)', async ({ request }) => {
    const login = await request.post(`${API}/auth/login`, {
      data: { username: 'testuser', password: 'password123' },
    })
    const token = (await login.json()).data.access_token

    const res = await request.post(`${API}/auth/logout`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.ok()).toBeTruthy()
  })

  test('POST /auth/logout — reject without token', async ({ request }) => {
    const res = await request.post(`${API}/auth/logout`)
    expect(res.status()).toBe(401)
  })

  test('GET /health — health check', async ({ request }) => {
    const res = await request.get(`${API}/health`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.status).toBe('ok')
    expect(body.service).toBe('ruangx')
  })

  test('protected endpoint without token returns 401', async ({ request }) => {
    const res = await request.get(`${API}/posts/`)
    expect(res.status()).toBe(401)
  })
})

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
    await page.fill('input[placeholder="••••••••"]', 'password123')
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
    await page.fill('input[placeholder="••••••••"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForFunction(() => !window.location.href.includes('/login'), null, { timeout: 15000 })
    await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })

    // Desktop: click logout button
    const logoutBtn = page.locator('aside button', { has: page.locator('.lucide-log-out') }).first()
    if (await logoutBtn.isVisible()) {
      await logoutBtn.click()
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
    await page.fill('input[placeholder="••••••••"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')

    await expect(page.getByText('ruangx')).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('Beranda')).toBeVisible()
    await expect(page.getByText('Jelajahi')).toBeVisible()
    await expect(page.getByText('Notifikasi')).toBeVisible()
    await expect(page.getByText('Pesan')).toBeVisible()
    await expect(page.getByText('Ruang')).toBeVisible()
    await expect(page.getByText('Pengaturan')).toBeVisible()
  })
})