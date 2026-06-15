import type { User, UpdateProfileRequest, CursorResponse } from '@/types/api'
import { api } from './client'
import { normalizeUser } from './normalize'

export const usersApi = {
  getProfile: async (username: string) =>
    normalizeUser(await api<User>(`/users/${username}`)),

  updateProfile: async (data: UpdateProfileRequest) =>
    normalizeUser(await api<User>('/users/me', { method: 'PUT', body: data })),

  search: async (q: string, cursor?: string) => {
    const res = await api<CursorResponse<User>>('/users/search', { params: { q, cursor } })
    return {
      data: (res.data ?? []).map(normalizeUser),
      meta: { cursor: res.meta?.cursor ?? null, hasMore: res.meta?.hasMore ?? false },
    }
  },

  getSuggestions: async () => {
    const res = await api<User[]>('/users/suggestions')
    return (Array.isArray(res) ? res : []).map(normalizeUser)
  },
}
