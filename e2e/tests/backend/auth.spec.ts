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
      data: { identifier: 'testuser', password: 'test12345' },
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
      data: { identifier: 'testuser', password: 'wrongpass' },
    })
    expect(res.status()).toBe(401)
  })

  test('POST /auth/login — reject non-existent user', async ({ request }) => {
    const res = await request.post(`${API}/auth/login`, {
      data: { identifier: 'nonexistent_user_12345', password: 'test12345' },
    })
    expect(res.status()).toBe(401)
  })

  test('POST /auth/login — reject empty credentials', async ({ request }) => {
    const res = await request.post(`${API}/auth/login`, {
      data: { identifier: '', password: '' },
    })
    expect([400, 422]).toContain(res.status())
  })

  test('POST /auth/refresh — refresh token', async ({ request }) => {
    const login = await request.post(`${API}/auth/login`, {
      data: { identifier: 'testuser', password: 'test12345' },
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
      data: { identifier: 'testuser', password: 'test12345' },
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
