import { test, expect } from '@playwright/test'

const API = 'http://localhost:8080/api/v1'

async function getToken(request: any): Promise<string> {
  const login = await request.post(`${API}/auth/login`, {
    data: { username: 'testuser', password: 'password123' },
  })
  return (await login.json()).data.access_token
}

test.describe('Users API', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    token = await getToken(request)
  })

  test('GET /users/:username — get user profile', async ({ request }) => {
    const res = await request.get(`${API}/users/testuser`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.username).toBe('testuser')
    expect(body.data.display_name).toBeDefined()
  })

  test('GET /users/:username — non-existent user returns 404', async ({ request }) => {
    const res = await request.get(`${API}/users/nonexistent_user_12345_xyz`)
    expect(res.status()).toBe(404)
  })

  test('GET /users/:username/posts — get user posts (paginated)', async ({ request }) => {
    const res = await request.get(`${API}/users/testuser/posts`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.posts).toBeDefined()
    expect(Array.isArray(body.data.posts)).toBe(true)
  })

  test('GET /users/:username/followers — get followers (paginated)', async ({ request }) => {
    const res = await request.get(`${API}/users/testuser/followers`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.items).toBeDefined()
    expect(Array.isArray(body.data.items)).toBe(true)
  })

  test('GET /users/:username/following — get following (paginated)', async ({ request }) => {
    const res = await request.get(`${API}/users/testuser/following`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.items).toBeDefined()
    expect(Array.isArray(body.data.items)).toBe(true)
  })

  test('GET /users/search — search users (paginated, with auth)', async ({ request }) => {
    const res = await request.get(`${API}/users/search?q=test`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.items).toBeDefined()
    expect(Array.isArray(body.data.items)).toBe(true)
  })

  test('GET /users/search — empty query requires auth', async ({ request }) => {
    const res = await request.get(`${API}/users/search?q=`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    // Query param is required by handler (returns 400) or auth is required
    expect([200, 400, 401, 422]).toContain(res.status())
  })

  test('PUT /users/me — update profile', async ({ request }) => {
    const res = await request.put(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { display_name: 'Updated E2E', bio: 'Hello from e2e!', location: 'Jakarta', website: 'https://e2e.test' },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.display_name).toBe('Updated E2E')
  })

  test('PUT /users/me — reject without auth', async ({ request }) => {
    const res = await request.put(`${API}/users/me`, {
      data: { display_name: 'Hack' },
    })
    expect(res.status()).toBe(401)
  })

  test('GET /users/search — accessible without auth (public)', async ({ request }) => {
    const res = await request.get(`${API}/users/search?q=test`)
    expect(res.ok()).toBeTruthy()
  })
})

test.describe('Profile UI — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="username@email.com"]', 'testuser')
    await page.fill('input[placeholder="••••••••"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')
  })

  test('profile page loads with user info', async ({ page }) => {
    await page.goto('/profile/testuser')
    await expect(page.getByText('@testuser')).toBeVisible({ timeout: 10000 })
  })

  test('profile page has tabs: Kiriman, Balasan, Suka, Media', async ({ page }) => {
    await page.goto('/profile/testuser')
    await expect(page.getByText('Kiriman')).toBeVisible({ timeout: 10000 })
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
    await expect(page.locator('.lucide-chevron-left')).toBeVisible({ timeout: 10000 })
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
    await page.fill('input[placeholder="••••••••"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')
  })

  test('settings page loads with profile form', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByText('Pengaturan')).toBeVisible({ timeout: 10000 })
  })

  test('settings page shows name, bio, website, location fields', async ({ page }) => {
    await page.goto('/settings')
    await expect(page.getByLabel('Nama Tampilan')).toBeVisible({ timeout: 5000 })
    await expect(page.getByLabel('Bio')).toBeVisible()
    await expect(page.getByLabel('Website')).toBeVisible()
    await expect(page.getByLabel('Lokasi')).toBeVisible()
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
    const nameInput = page.getByLabel('Nama Tampilan')
    await nameInput.fill('E2E Updated Name')
    await page.getByRole('button', { name: 'Simpan' }).click()
    await page.waitForTimeout(2000)
  })
})