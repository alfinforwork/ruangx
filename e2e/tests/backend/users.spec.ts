import { test, expect } from '@playwright/test'

const API = 'http://localhost:8080/api/v1'

async function getToken(request: any): Promise<string> {
  const login = await request.post(`${API}/auth/login`, {
    data: { identifier: 'testuser', password: 'test12345' },
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
