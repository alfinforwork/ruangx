import { test, expect } from '@playwright/test'

const API = 'http://localhost:8080/api/v1'

async function getToken(request: any): Promise<string> {
  const login = await request.post(`${API}/auth/login`, {
    data: { username: 'testuser', password: 'password123' },
  })
  const body = await login.json()
  return body.data.access_token
}

test.describe('Posts API', () => {
  let postId: string
  let token: string

  test.beforeAll(async ({ request }) => {
    token = await getToken(request)
  })

  test('POST /posts — create a post', async ({ request }) => {
    const res = await request.post(`${API}/posts/`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { content: 'Hello from E2E test! #testing' },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.data.content_plain).toBe('Hello from E2E test! #testing')
    expect(body.data.id).toBeTruthy()
    expect(body.data.hashtags).toContain('testing')
    postId = body.data.id
  })

  test('POST /posts — create a post with parent (reply)', async ({ request }) => {
    if (!postId) return test.skip()
    const res = await request.post(`${API}/posts/`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { content: 'A reply to the post!', parent_id: postId },
    })
    expect(res.status()).toBe(201)
    const body = await res.json()
    expect(body.data.parent_id).toBe(postId)
  })

  test('POST /posts — reject empty content', async ({ request }) => {
    const res = await request.post(`${API}/posts/`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { content: '' },
    })
    expect([400, 422]).toContain(res.status())
  })

  test('POST /posts — reject without auth', async ({ request }) => {
    const res = await request.post(`${API}/posts/`, {
      data: { content: 'Should fail' },
    })
    expect(res.status()).toBe(401)
  })

  test('GET /posts — fetch feed (paginated)', async ({ request }) => {
    const res = await request.get(`${API}/posts/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.success).toBe(true)
    expect(body.data.posts).toBeDefined()
    expect(Array.isArray(body.data.posts)).toBe(true)
    expect(body.data.has_more !== undefined).toBe(true)
  })

  test('GET /posts — feed without auth fails', async ({ request }) => {
    const res = await request.get(`${API}/posts/`)
    expect(res.status()).toBe(401)
  })

  test('GET /posts/:id — get post by id', async ({ request }) => {
    if (!postId) return test.skip()
    const res = await request.get(`${API}/posts/${postId}`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.id).toBe(postId)
  })

  test('GET /posts/:id — non-existent post returns error', async ({ request }) => {
    const res = await request.get(`${API}/posts/nonexistent-post-99999`)
    expect([404, 500]).toContain(res.status())
  })

  test('GET /posts/:id/thread — get post thread', async ({ request }) => {
    if (!postId) return test.skip()
    const res = await request.get(`${API}/posts/${postId}/thread`)
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.post).toBeDefined()
  })

  test('DELETE /posts/:id — delete own post', async ({ request }) => {
    const create = await request.post(`${API}/posts/`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { content: 'Post to delete' },
    })
    const deleteId = (await create.json()).data.id
    const res = await request.delete(`${API}/posts/${deleteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.ok()).toBeTruthy()
  })

  test('DELETE /posts/:id — cannot delete without auth', async ({ request }) => {
    if (!postId) return test.skip()
    const res = await request.delete(`${API}/posts/${postId}`)
    expect(res.status()).toBe(401)
  })

  test('POST /posts/:id/like — toggle like', async ({ request }) => {
    if (!postId) return test.skip()
    const res1 = await request.post(`${API}/posts/${postId}/like`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res1.ok()).toBeTruthy()
    const res2 = await request.post(`${API}/posts/${postId}/like`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res2.ok()).toBeTruthy()
  })

  test('POST /posts/:id/bookmark — toggle bookmark', async ({ request }) => {
    if (!postId) return test.skip()
    const res1 = await request.post(`${API}/posts/${postId}/bookmark`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res1.ok()).toBeTruthy()
    const res2 = await request.post(`${API}/posts/${postId}/bookmark`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res2.ok()).toBeTruthy()
  })

  test('GET /posts — cursor pagination works', async ({ request }) => {
    const res1 = await request.get(`${API}/posts/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res1.status()).toBe(200)
    const body1 = await res1.json()
    expect(body1.data.has_more !== undefined).toBe(true)
    if (body1.data.has_more && body1.data.cursor) {
      const res2 = await request.get(`${API}/posts/?cursor=${body1.data.cursor}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      expect(res2.ok()).toBeTruthy()
    }
  })
})

test.describe('Timeline API', () => {
  test('GET /timeline — fetch timeline (paginated)', async ({ request }) => {
    const token = await getToken(request)
    const res = await request.get(`${API}/timeline`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.posts).toBeDefined()
    expect(Array.isArray(body.data.posts)).toBe(true)
  })

  test('GET /timeline — reject without auth', async ({ request }) => {
    const res = await request.get(`${API}/timeline`)
    expect(res.status()).toBe(401)
  })
})

test.describe('Upload API', () => {
  test('POST /upload — reject without auth', async ({ request }) => {
    const res = await request.post(`${API}/upload`, {
      multipart: {
        file: {
          name: 'test.txt',
          mimeType: 'text/plain',
          buffer: Buffer.from('test'),
        },
      },
    })
    expect(res.status()).toBe(401)
  })
})

test.describe('Bookmarks API', () => {
  test('GET /bookmarks — list user bookmarks (paginated)', async ({ request }) => {
    const token = await getToken(request)
    const res = await request.get(`${API}/bookmarks`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    expect(res.status()).toBe(200)
    const body = await res.json()
    expect(body.data.items).toBeDefined()
    expect(Array.isArray(body.data.items)).toBe(true)
  })

  test('GET /bookmarks — reject without auth', async ({ request }) => {
    const res = await request.get(`${API}/bookmarks`)
    expect(res.status()).toBe(401)
  })
})