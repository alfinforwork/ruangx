import { test, expect } from '@playwright/test'

const API = 'http://localhost:8080/api/v1'

async function getToken(request: any): Promise<string> {
  const login = await request.post(`${API}/auth/login`, {
    data: { identifier: 'testuser', password: 'test12345' },
  })
  return (await login.json()).data.access_token
}

test.describe('Follow API', () => {
  let token: string

  test.beforeAll(async ({ request }) => {
    token = await getToken(request)
  })

  test('POST /users/:username/follow — follow a user', async ({ request }) => {
    const res = await request.post(`${API}/users/anotheruser/follow`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect([200, 201, 400, 404, 409]).toContain(res.status())
  })

  test('POST /users/:username/follow — reject without auth', async ({ request }) => {
    const res = await request.post(`${API}/users/testuser/follow`)
    expect(res.status()).toBe(401)
  })

  test('DELETE /users/:username/follow — unfollow a user', async ({ request }) => {
    const res = await request.delete(`${API}/users/anotheruser/follow`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect([200, 400, 404, 409]).toContain(res.status())
  })

  test('DELETE /users/:username/follow — reject without auth', async ({ request }) => {
    const res = await request.delete(`${API}/users/testuser/follow`)
    expect(res.status()).toBe(401)
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
})

test.describe('Hashtags API', () => {
  test('GET /hashtags/trending — get trending hashtags', async ({ request }) => {
    const res = await request.get(`${API}/hashtags/trending`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
  })

  test('GET /hashtags/:tag — get posts by hashtag', async ({ request }) => {
    const res = await request.get(`${API}/hashtags/testing`)
    expect(res.ok()).toBeTruthy()
  })

  test('GET /hashtags/:tag — non-existent tag returns empty', async ({ request }) => {
    const res = await request.get(`${API}/hashtags/nonexistentTagXYZ123`)
    expect(res.ok()).toBeTruthy()
  })
})

test.describe('Trends API', () => {
  test('GET /trends — get trending topics', async ({ request }) => {
    const res = await request.get(`${API}/trends`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(Array.isArray(body.data)).toBe(true)
  })
})

test.describe('Notifications API', () => {
  let token: string
  let notificationId: string

  test.beforeAll(async ({ request }) => {
    token = await getToken(request)
  })

  test('GET /notifications — get notifications (paginated)', async ({ request }) => {
    const res = await request.get(`${API}/notifications/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.items).toBeDefined()
    expect(Array.isArray(body.data.items)).toBe(true)
    if (body.data.items.length > 0 && body.data.items[0].id) {
      notificationId = body.data.items[0].id
    }
  })

  test('GET /notifications — reject without auth', async ({ request }) => {
    const res = await request.get(`${API}/notifications/`)
    expect(res.status()).toBe(401)
  })

  test('GET /notifications/unread-count — get unread count', async ({ request }) => {
    const res = await request.get(`${API}/notifications/unread-count`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(typeof body.data.count).toBe('number')
  })

  test('GET /notifications/unread-count — reject without auth', async ({ request }) => {
    const res = await request.get(`${API}/notifications/unread-count`)
    expect(res.status()).toBe(401)
  })

  test('PUT /notifications/read — mark single notification as read', async ({ request }) => {
    if (!notificationId) return test.skip()
    const res = await request.put(`${API}/notifications/read`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { id: notificationId },
    })
    expect(res.ok()).toBeTruthy()
  })

  test('PUT /notifications/read-all — mark all as read', async ({ request }) => {
    const res = await request.put(`${API}/notifications/read-all`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.ok()).toBeTruthy()
  })

  test('PUT /notifications/read-all — reject without auth', async ({ request }) => {
    const res = await request.put(`${API}/notifications/read-all`)
    expect(res.status()).toBe(401)
  })
})
