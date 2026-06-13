import type { User, UpdateProfileRequest, CursorResponse } from '@/types/api'
import { api } from './client'

export const usersApi = {
  getProfile: (username: string) =>
    api<User>(`/users/${username}`),

  updateProfile: (data: UpdateProfileRequest) =>
    api<User>('/users/me', { method: 'PUT', body: data }),

  search: (q: string, cursor?: string) =>
    api<CursorResponse<User>>('/users/search', { params: { q, cursor } }),

  getSuggestions: () =>
    api<User[]>('/users/suggestions'),
}