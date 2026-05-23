export class ApiClient {
  private baseUrl: string
  private token: string | null = null

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_API_URL || ''
  }

  setToken(t: string | null) { this.token = t }

  private headers(): HeadersInit {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (this.token) h['Authorization'] = `Bearer ${this.token}`
    return h
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, { headers: this.headers() })
    if (!res.ok) throw new ApiError(res.status, await res.text())
    return res.json()
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) throw new ApiError(res.status, await res.text())
    return res.json()
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: this.headers(),
      body: body ? JSON.stringify(body) : undefined,
    })
    if (!res.ok) throw new ApiError(res.status, await res.text())
    return res.json()
  }

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.headers(),
    })
    if (!res.ok) throw new ApiError(res.status, await res.text())
    return res.json()
  }
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(`API ${status}: ${message}`)
    this.name = 'ApiError'
  }
}

export const api = new ApiClient()