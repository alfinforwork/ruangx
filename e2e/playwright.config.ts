import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  globalSetup: './global-setup.ts',
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : 4,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // ─── Backend (API) tests — request-only, run once, no multi-browser ───
    {
      name: 'backend',
      testDir: './tests/backend',
      use: { ...devices['Desktop Chrome'] },
    },

    // ─── Frontend (UI) tests — run across desktop + mobile browsers ───
    {
      name: 'frontend-chromium',
      testDir: './tests/frontend',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'frontend-firefox',
      testDir: './tests/frontend',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'frontend-webkit',
      testDir: './tests/frontend',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'frontend-mobile-chrome',
      testDir: './tests/frontend',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'frontend-mobile-safari',
      testDir: './tests/frontend',
      use: { ...devices['iPhone 13'] },
    },
  ],

  // API tests don't need a browser
  webServer: [
    {
      command: 'echo "Backend should already be running on :8080"',
      port: 8080,
      reuseExistingServer: true,
      ignoreHTTPSErrors: true,
    },
    {
      command: 'echo "Frontend should already be running on :3000"',
      port: 3000,
      reuseExistingServer: true,
    },
  ],
})
