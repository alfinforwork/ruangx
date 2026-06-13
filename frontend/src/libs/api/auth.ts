import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types/api'
import { api } from './client'

export const authApi = {
  login: (data: LoginRequest) =>
    api<AuthResponse>('/auth/login', { method: 'POST', body: data }),

  register: (data: RegisterRequest) =>
    api<AuthResponse>('/auth/register', { method: 'POST', body: data }),

  refresh: (refreshToken: string) =>
    api<AuthResponse>('/auth/refresh', { method: 'POST', body: { refreshToken } }),

  logout: () =>
    api<void>('/auth/logout', { method: 'POST' }),

  getMe: () =>
    api<{ user: import('@/types/api').User }>('/auth/me'),
}