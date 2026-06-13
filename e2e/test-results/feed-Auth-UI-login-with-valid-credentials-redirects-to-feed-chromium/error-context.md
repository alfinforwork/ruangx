# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: feed.spec.ts >> Auth UI >> login with valid credentials redirects to feed
- Location: tests/feed.spec.ts:70:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForFunction: Test timeout of 30000ms exceeded.
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
  1   | import { test, expect } from '@playwright/test'
  2   | 
  3   | const API = 'http://localhost:8080/api/v1'
  4   | 
  5   | // ─── Unified helpers ─────────────────────────────────────────────
  6   | 
  7   | async function login(page: any, username = 'testuser', password = 'password123') {
  8   |   await page.goto('/login', { waitUntil: 'networkidle' })
  9   |   await page.fill('input[placeholder="username@email.com"]', username)
  10  |   await page.fill('input[placeholder="••••••••"]', password)
  11  |   await page.click('button[type="submit"]')
  12  | 
  13  |   // Wait for redirect away from login (zustand persist hydration can lag)
  14  |   try {
  15  |     await page.waitForFunction(
  16  |       () => window.location.pathname !== '/login',
  17  |       null,
  18  |       { timeout: 20000 }
  19  |     )
  20  |   } catch {
  21  |     // If still on login, the form may have failed — retry once
  22  |     if (page.url().includes('/login')) {
  23  |       await page.fill('input[placeholder="username@email.com"]', username)
  24  |       await page.fill('input[placeholder="••••••••"]', password)
  25  |       await page.click('button[type="submit"]')
> 26  |       await page.waitForFunction(
      |                  ^ Error: page.waitForFunction: Test timeout of 30000ms exceeded.
  27  |         () => window.location.pathname !== '/login',
  28  |         null,
  29  |         { timeout: 20000 }
  30  |       )
  31  |     }
  32  |   }
  33  |   await page.waitForTimeout(500)
  34  | }
  35  | 
  36  | // ─── Auth UI ─────────────────────────────────────────────────────
  37  | 
  38  | test.describe('Auth UI', () => {
  39  |   test('landing page redirects to login for unauthenticated users', async ({ page }) => {
  40  |     await page.goto('/')
  41  |     await expect(page).toHaveURL(/login/, { timeout: 10000 })
  42  |   })
  43  | 
  44  |   test('login page shows login form', async ({ page }) => {
  45  |     await page.goto('/login', { waitUntil: 'networkidle' })
  46  |     await expect(page.getByText('Masuk ke ruangx')).toBeVisible()
  47  |     await expect(page.getByPlaceholder('username@email.com')).toBeVisible()
  48  |     await expect(page.getByPlaceholder('••••••••')).toBeVisible()
  49  |     await expect(page.getByRole('button', { name: 'Masuk' })).toBeVisible()
  50  |   })
  51  | 
  52  |   test('login page has link to register', async ({ page }) => {
  53  |     await page.goto('/login', { waitUntil: 'networkidle' })
  54  |     await expect(page.getByRole('link', { name: 'Daftar' })).toBeVisible()
  55  |   })
  56  | 
  57  |   test('register page shows register form', async ({ page }) => {
  58  |     await page.goto('/register', { waitUntil: 'networkidle' })
  59  |     await expect(page.getByText('Daftar ruangx')).toBeVisible()
  60  |     await expect(page.getByPlaceholder('username')).toBeVisible()
  61  |     await expect(page.getByPlaceholder('Nama Anda')).toBeVisible()
  62  |     await expect(page.getByPlaceholder('email@example.com')).toBeVisible()
  63  |   })
  64  | 
  65  |   test('register page has link to login', async ({ page }) => {
  66  |     await page.goto('/register', { waitUntil: 'networkidle' })
  67  |     await expect(page.getByRole('link', { name: 'Masuk' })).toBeVisible()
  68  |   })
  69  | 
  70  |   test('login with valid credentials redirects to feed', async ({ page }) => {
  71  |     await login(page)
  72  |     await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  73  |   })
  74  | 
  75  |   test('login with wrong password shows error', async ({ page }) => {
  76  |     await page.goto('/login', { waitUntil: 'networkidle' })
  77  |     await page.fill('input[placeholder="username@email.com"]', 'testuser')
  78  |     await page.fill('input[placeholder="••••••••"]', 'wrong_password')
  79  |     await page.click('button[type="submit"]')
  80  |     await page.waitForTimeout(2000)
  81  |     // Should still be on login page or show error
  82  |     const url = page.url()
  83  |     const errorText = page.getByText(/sandi|gagal|error|Invalid credentials/i)
  84  |     const stillOnLogin = url.includes('/login')
  85  |     expect(stillOnLogin || await errorText.isVisible().catch(() => false)).toBeTruthy()
  86  |   })
  87  | 
  88  |   test('protected routes redirect to login when unauthenticated', async ({ page }) => {
  89  |     await page.goto('/settings', { waitUntil: 'networkidle' })
  90  |     await expect(page).toHaveURL(/login/, { timeout: 10000 })
  91  |   })
  92  | 
  93  |   test('sidebar navigation is visible after login', async ({ page }) => {
  94  |     await login(page)
  95  |     await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  96  |     await expect(page.getByText('Jelajahi')).toBeVisible({ timeout: 5000 })
  97  |     await expect(page.getByText('Pengaturan')).toBeVisible()
  98  |     // ruangx logo
  99  |     await expect(page.getByText('ruangx')).toBeVisible()
  100 |   })
  101 | 
  102 |   test('logout from sidebar redirects to login', async ({ page }) => {
  103 |     await login(page)
  104 |     await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  105 | 
  106 |     // Click logout via settings page (more reliable)
  107 |     await page.goto('/settings', { waitUntil: 'networkidle' })
  108 |     await page.waitForTimeout(500)
  109 |     const logoutBtn = page.getByRole('button', { name: 'Keluar' })
  110 |     if (await logoutBtn.isVisible().catch(() => false)) {
  111 |       await logoutBtn.click()
  112 |       await expect(page).toHaveURL(/login/, { timeout: 10000 })
  113 |     }
  114 |   })
  115 | })
  116 | 
  117 | // ─── Feed UI ─────────────────────────────────────────────────────
  118 | 
  119 | test.describe('Feed UI — Authenticated', () => {
  120 |   test.beforeEach(async ({ page }) => {
  121 |     await login(page)
  122 |     await expect(page.getByText('Beranda')).toBeVisible({ timeout: 15000 })
  123 |   })
  124 | 
  125 |   test('feed shows "Untukmu" and "Mengikuti" tabs', async ({ page }) => {
  126 |     await expect(page.getByText('Untukmu')).toBeVisible()
```