import type { User, CursorResponse } from '@/types/api'
import { api } from './client'

export const followsApi = {
  follow: (userId: string) =>
    api<User>(`/users/${userId}/follow`, { method: 'POST' }),

  unfollow: (userId: string) =>
    api<void>(`/users/${userId}/follow`, { method: 'DELETE' }),

  getFollowers: (userId: string, cursor?: string) =>
    api<CursorResponse<User>>(`/users/${userId}/followers`, { params: { cursor } }),

  getFollowing: (userId: string, cursor?: string) =>
    api<CursorResponse<User>>(`/users/${userId}/following`, { params: { cursor } }),

  check: (userId: string) =>
    api<{ isFollowing: boolean }>(`/users/${userId}/follow/check`),
}