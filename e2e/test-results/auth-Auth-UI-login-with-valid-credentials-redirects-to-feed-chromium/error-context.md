# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth.spec.ts >> Auth UI >> login with valid credentials redirects to feed
- Location: tests/auth.spec.ts:166:7

# Error details

```
TimeoutError: page.waitForFunction: Timeout 15000ms exceeded.
```

# Page snapshot

```yaml
- generic [ref=e2]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e7]: r
      - heading "Masuk ke ruangx" [level=1] [ref=e8]
      - paragraph [ref=e9]: Selamat datang kembali
    - generic [ref=e10]:
      - generic [ref=e11]:
        - generic [ref=e12]: Username atau Email
        - textbox "Username atau Email" [ref=e13]:
          - /placeholder: username@email.com
          - text: testuser
      - generic [ref=e14]:
        - generic [ref=e15]: Kata Sandi
        - textbox "Kata Sandi" [ref=e16]:
          - /placeholder: ••••••••
          - text: password123
      - paragraph [ref=e17]: "[POST] \"http://localhost:8080/api/v1/auth/login\": <no response> Failed to fetch"
      - button "Masuk" [ref=e18]
    - paragraph [ref=e19]:
      - text: Belum punya akun?
      - link "Daftar" [ref=e20] [cursor=pointer]:
        - /url: /register
  - region "Notifications (F8)":
    - list
```

# Test source

```ts
  73  | 
  74  |   test('POST /auth/login — reject empty credentials', async ({ request }) => {
  75  |     const res = await request.post(`${API}/auth/login`, {
  76  |       data: { username: '', password: '' },
  77  |     })
  78  |     expect([400, 422]).toContain(res.status())
  79  |   })
  80  | 
  81  |   test('POST /auth/refresh — refresh token', async ({ request }) => {
  82  |     const login = await request.post(`${API}/auth/login`, {
  83  |       data: { username: 'testuser', password: 'password123' },
  84  |     })
  85  |     const { refresh_token } = (await login.json()).data
  86  | 
  87  |     const res = await request.post(`${API}/auth/refresh`, {
  88  |       data: { refresh_token },
  89  |     })
  90  |     expect(res.status()).toBe(200)
  91  |     const body = await res.json()
  92  |     expect(body.data.access_token).toBeTruthy()
  93  |     expect(body.data.refresh_token).toBeTruthy()
  94  |   })
  95  | 
  96  |   test('POST /auth/refresh — reject invalid token', async ({ request }) => {
  97  |     const res = await request.post(`${API}/auth/refresh`, {
  98  |       data: { refresh_token: 'invalid_token_here_12345' },
  99  |     })
  100 |     expect(res.status()).toBe(401)
  101 |   })
  102 | 
  103 |   test('POST /auth/logout — logout (authenticated)', async ({ request }) => {
  104 |     const login = await request.post(`${API}/auth/login`, {
  105 |       data: { username: 'testuser', password: 'password123' },
  106 |     })
  107 |     const token = (await login.json()).data.access_token
  108 | 
  109 |     const res = await request.post(`${API}/auth/logout`, {
  110 |       headers: { Authorization: `Bearer ${token}` },
  111 |     })
  112 |     expect(res.ok()).toBeTruthy()
  113 |   })
  114 | 
  115 |   test('POST /auth/logout — reject without token', async ({ request }) => {
  116 |     const res = await request.post(`${API}/auth/logout`)
  117 |     expect(res.status()).toBe(401)
  118 |   })
  119 | 
  120 |   test('GET /health — health check', async ({ request }) => {
  121 |     const res = await request.get(`${API}/health`)
  122 |     expect(res.status()).toBe(200)
  123 |     const body = await res.json()
  124 |     expect(body.status).toBe('ok')
  125 |     expect(body.service).toBe('ruangx')
  126 |   })
  127 | 
  128 |   test('protected endpoint without token returns 401', async ({ request }) => {
  129 |     const res = await request.get(`${API}/posts/`)
  130 |     expect(res.status()).toBe(401)
  131 |   })
  132 | })
  133 | 
  134 | test.describe('Auth UI', () => {
  135 |   test('landing page redirects to login for unauthenticated users', async ({ page }) => {
  136 |     await page.goto('/')
  137 |     await page.waitForURL('**/login')
  138 |   })
  139 | 
  140 |   test('login page shows login form', async ({ page }) => {
  141 |     await page.goto('/login')
  142 |     await expect(page.getByText('Masuk ke ruangx')).toBeVisible()
  143 |     await expect(page.getByPlaceholder('username@email.com')).toBeVisible()
  144 |     await expect(page.getByPlaceholder('••••••••')).toBeVisible()
  145 |     await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible()
  146 |   })
  147 | 
  148 |   test('login page has link to register', async ({ page }) => {
  149 |     await page.goto('/login')
  150 |     await expect(page.getByRole('link', { name: 'Daftar' })).toBeVisible()
  151 |   })
  152 | 
  153 |   test('register page shows register form', async ({ page }) => {
  154 |     await page.goto('/register')
  155 |     await expect(page.getByText('Daftar ruangx')).toBeVisible()
  156 |     await expect(page.getByPlaceholder('username')).toBeVisible()
  157 |     await expect(page.getByPlaceholder('Nama Anda')).toBeVisible()
  158 |     await expect(page.getByPlaceholder('email@example.com')).toBeVisible()
  159 |   })
  160 | 
  161 |   test('register page has link to login', async ({ page }) => {
  162 |     await page.goto('/register')
  163 |     await expect(page.getByRole('link', { name: 'Masuk' })).toBeVisible()
  164 |   })
  165 | 
  166 |   test('login with valid credentials redirects to feed', async ({ page }) => {
  167 |     await page.goto('/login')
  168 |     await page.fill('input[placeholder="username@email.com"]', 'testuser')
  169 |     await page.fill('input[placeholder="••••••••"]', 'password123')
  170 |     await page.click('button[type="submit"]')
  171 | 
  172 |     // Wait for navigation — auth store hydration may lag
> 173 |     await page.waitForFunction(() => !window.location.href.includes('/login'), null, { timeout: 15000 })
      |                ^ TimeoutError: page.waitForFunction: Timeout 15000ms exceeded.
  174 |     await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  175 |   })
  176 | 
  177 |   test('login with wrong password shows error', async ({ page }) => {
  178 |     await page.goto('/login')
  179 |     await page.fill('input[placeholder="username@email.com"]', 'testuser')
  180 |     await page.fill('input[placeholder="••••••••"]', 'wrong_password')
  181 |     await page.click('button[type="submit"]')
  182 | 
  183 |     await expect(page.getByText(/sandi|gagal|error/i)).toBeVisible({ timeout: 5000 })
  184 |   })
  185 | 
  186 |   test('logout from sidebar redirects to login', async ({ page }) => {
  187 |     // Login first
  188 |     await page.goto('/login')
  189 |     await page.fill('input[placeholder="username@email.com"]', 'testuser')
  190 |     await page.fill('input[placeholder="••••••••"]', 'password123')
  191 |     await page.click('button[type="submit"]')
  192 |     await page.waitForFunction(() => !window.location.href.includes('/login'), null, { timeout: 15000 })
  193 |     await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  194 | 
  195 |     // Desktop: click logout button
  196 |     const logoutBtn = page.locator('aside button', { has: page.locator('.lucide-log-out') }).first()
  197 |     if (await logoutBtn.isVisible()) {
  198 |       await logoutBtn.click()
  199 |     }
  200 | 
  201 |     await page.waitForURL('**/login', { timeout: 10000 })
  202 |   })
  203 | 
  204 |   test('protected routes redirect to login when unauthenticated', async ({ page }) => {
  205 |     await page.goto('/settings')
  206 |     await page.waitForURL('**/login')
  207 | 
  208 |     await page.goto('/notifications')
  209 |     await page.waitForURL('**/login')
  210 | 
  211 |     await page.goto('/messages')
  212 |     await page.waitForURL('**/login')
  213 |   })
  214 | 
  215 |   test('sidebar navigation is visible after login', async ({ page }) => {
  216 |     await page.goto('/login')
  217 |     await page.fill('input[placeholder="username@email.com"]', 'testuser')
  218 |     await page.fill('input[placeholder="••••••••"]', 'password123')
  219 |     await page.click('button[type="submit"]')
  220 |     await page.waitForURL('**/')
  221 | 
  222 |     await expect(page.getByText('ruangx')).toBeVisible({ timeout: 5000 })
  223 |     await expect(page.getByText('Beranda')).toBeVisible()
  224 |     await expect(page.getByText('Jelajahi')).toBeVisible()
  225 |     await expect(page.getByText('Notifikasi')).toBeVisible()
  226 |     await expect(page.getByText('Pesan')).toBeVisible()
  227 |     await expect(page.getByText('Ruang')).toBeVisible()
  228 |     await expect(page.getByText('Pengaturan')).toBeVisible()
  229 |   })
  230 | })
```