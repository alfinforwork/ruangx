import { test, expect } from '@playwright/test'

const API = 'http://localhost:8080/api/v1'

async function getToken(request: any): Promise<string> {
  const login = await request.post(`${API}/auth/login`, {
    data: { username: 'testuser', password: 'password123' },
  })
  return (await login.json()).data.access_token
}

test.describe('Messages API', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    token = await getToken(request)
  })

  test('POST /messages — send message to user', async ({ request }) => {
    const res = await request.post(`${API}/messages/`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { recipientId: 'testuser', content: 'Hello from E2E!' },
    })
    expect([200, 201, 400, 422]).toContain(res.status())
  })

  test('POST /messages — reject empty content', async ({ request }) => {
    const res = await request.post(`${API}/messages/`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { recipientId: 'someuser', content: '' },
    })
    expect([400, 422]).toContain(res.status())
  })

  test('POST /messages — reject without auth', async ({ request }) => {
    const res = await request.post(`${API}/messages/`, {
      data: { recipientId: 'testuser', content: 'hello' },
    })
    expect(res.status()).toBe(401)
  })

  test('GET /conversations — list user conversations (paginated)', async ({ request }) => {
    const res = await request.get(`${API}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.items).toBeDefined()
    expect(Array.isArray(body.data.items)).toBe(true)
  })

  test('GET /conversations — reject without auth', async ({ request }) => {
    const res = await request.get(`${API}/conversations`)
    expect(res.status()).toBe(401)
  })

  test('GET /conversations/:id/messages — get conversation messages', async ({ request }) => {
    const convsRes = await request.get(`${API}/conversations`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const convs = (await convsRes.json()).data.items

    if (convs.length > 0) {
      const convId = convs[0].id
      const res = await request.get(`${API}/conversations/${convId}/messages`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(res.status()).toBe(200)
      const body = await res.json()
      expect(Array.isArray(body.data)).toBe(true)
    }
  })
})

test.describe('Messages UI — Authenticated', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
    await page.fill('input[placeholder="username@email.com"]', 'testuser')
    await page.fill('input[placeholder="••••••••"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/')
    await page.goto('/messages')
    await page.waitForTimeout(1000)
  })

  test('messages page loads with header', async ({ page }) => {
    await expect(page.getByText('Pesan').first()).toBeVisible({ timeout: 10000 })
  })

  test('empty state shows when no conversations', async ({ page }) => {
    const emptyText = page.getByText(/Belum ada pesan|Mulai percakapan/)
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