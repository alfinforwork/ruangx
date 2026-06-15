import type { Post, CursorResponse } from '@/types/api'
import { api } from './client'
import { normalizePostPage } from './normalize'

export const bookmarksApi = {
  toggle: (postId: string) =>
    api<{ bookmarked: boolean; bookmarkCount: number }>(`/posts/${postId}/bookmark`, { method: 'POST' }),

  list: async (cursor?: string) =>
    normalizePostPage(await api<CursorResponse<Post>>('/bookmarks', { params: { cursor } })),
}