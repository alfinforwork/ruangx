import { request as playwrightRequest } from '@playwright/test'

const API = 'http://localhost:8080/api/v1'

async function globalSetup() {
  const context = await playwrightRequest.newContext()

  // Seed testuser — 409 means already exists, which is fine
  const res = await context.post(`${API}/auth/register`, {
    data: {
      username: 'testuser',
      display_name: 'Test User',
      email: 'testuser@example.com',
      password: 'test12345',
    },
  })

  if (res.status() !== 201 && res.status() !== 409) {
    throw new Error(`Failed to seed testuser: ${res.status()} ${await res.text()}`)
  }

  await context.dispose()
}

export default globalSetup
