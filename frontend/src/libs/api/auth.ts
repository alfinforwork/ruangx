import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types/api'
import { api } from './client'
import { normalizeUser } from './normalize'

async function withUser(p: Promise<AuthResponse>): Promise<AuthResponse> {
  const res = await p
  return { ...res, user: normalizeUser(res.user) }
}

export const authApi = {
  login: (data: LoginRequest) =>
    withUser(api<AuthResponse>('/auth/login', { method: 'POST', body: data })),

  register: (data: RegisterRequest) =>
    withUser(api<AuthResponse>('/auth/register', { method: 'POST', body: data })),

  refresh: (refreshToken: string) =>
    withUser(api<AuthResponse>('/auth/refresh', { method: 'POST', body: { refreshToken } })),

  logout: () => api<void>('/auth/logout', { method: 'POST' }),

  getMe: async () => {
    const res = await api<{ user: User }>('/auth/me')
    return { user: normalizeUser(res.user) }
  },
}
