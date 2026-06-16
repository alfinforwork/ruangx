import { test, expect } from '@playwright/test'

const API = 'http://localhost:8080/api/v1'

async function getToken(request: any): Promise<string> {
  const login = await request.post(`${API}/auth/login`, {
    data: { identifier: 'testuser', password: 'test12345' },
  })
  return (await login.json()).data.access_token
}

test.describe('Rooms API', () => {
  let token: string
  let roomId: string

  test.beforeAll(async ({ request }) => {
    token = await getToken(request)
  })

  test('POST /rooms — create a room', async ({ request }) => {
    const res = await request.post(`${API}/rooms/`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `E2E Room ${Date.now()}`, description: 'A room for E2E testing', is_private: false },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.data.name).toBeTruthy()
    roomId = body.data.id
  })

  test('POST /rooms — reject empty name', async ({ request }) => {
    const res = await request.post(`${API}/rooms/`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: '', description: 'test', is_private: false },
    })
    expect([400, 422]).toContain(res.status())
  })

  test('POST /rooms — reject without auth', async ({ request }) => {
    const res = await request.post(`${API}/rooms/`, {
      data: { name: 'Unauth room', description: 'test', is_private: false },
    })
    expect(res.status()).toBe(401)
  })

  test('GET /rooms/ — get popular rooms (paginated)', async ({ request }) => {
    const res = await request.get(`${API}/rooms/`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.items).toBeDefined()
    expect(Array.isArray(body.data.items)).toBe(true)
  })

  test('GET /rooms/:id — get room by id', async ({ request }) => {
    if (!roomId) return test.skip()
    const res = await request.get(`${API}/rooms/${roomId}`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.id).toBe(roomId)
  })

  test('GET /rooms/:id — non-existent room returns 404', async ({ request }) => {
    const res = await request.get(`${API}/rooms/00000000-0000-0000-0000-000000000001`)
    expect(res.status()).toBe(404)
  })

  test('POST /rooms/:id/join — join a room', async ({ request }) => {
    if (!roomId) return test.skip()
    const res = await request.post(`${API}/rooms/${roomId}/join`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.ok()).toBeTruthy()
  })

  test('join and leave reject without auth', async ({ request }) => {
    if (!roomId) return test.skip()
    const res1 = await request.post(`${API}/rooms/${roomId}/join`)
    expect(res1.status()).toBe(401)
    const res2 = await request.delete(`${API}/rooms/${roomId}/leave`)
    expect(res2.status()).toBe(401)
  })

  test('POST /rooms — create a private room', async ({ request }) => {
    const res = await request.post(`${API}/rooms/`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { name: `Private ${Date.now()}`, description: 'Secret', is_private: true },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.data.is_private).toBe(true)
  })
})
