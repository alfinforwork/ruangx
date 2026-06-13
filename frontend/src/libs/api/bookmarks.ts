import type { Post, CursorResponse } from '@/types/api'
import { api } from './client'

export const bookmarksApi = {
  toggle: (postId: string) =>
    api<{ bookmarked: boolean; bookmarkCount: number }>(`/posts/${postId}/bookmark`, { method: 'POST' }),

  list: (cursor?: string) =>
    api<CursorResponse<Post>>('/bookmarks', { params: { cursor } }),
}