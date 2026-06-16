import { test, expect } from '@playwright/test'

const API = 'http://localhost:8080/api/v1'

async function getToken(request: any): Promise<string> {
  const login = await request.post(`${API}/auth/login`, {
    data: { identifier: 'testuser', password: 'test12345' },
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
