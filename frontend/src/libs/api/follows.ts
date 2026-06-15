import type { User, CursorResponse } from '@/types/api'
import { api } from './client'

export const followsApi = {
  // Backend follows are keyed by username (POST/DELETE /users/:username/follow).
  follow: (username: string) =>
    api<User>(`/users/${username}/follow`, { method: 'POST' }),

  unfollow: (username: string) =>
    api<void>(`/users/${username}/follow`, { method: 'DELETE' }),

  getFollowers: (username: string, cursor?: string) =>
    api<CursorResponse<User>>(`/users/${username}/followers`, { params: { cursor } }),

  getFollowing: (username: string, cursor?: string) =>
    api<CursorResponse<User>>(`/users/${username}/following`, { params: { cursor } }),
}