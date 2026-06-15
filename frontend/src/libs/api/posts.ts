import type { Post, CreatePostRequest, CursorResponse, PostListParams } from '@/types/api'
import { api } from './client'
import { normalizePost, normalizePostPage } from './normalize'

export const postsApi = {
  list: async (params?: PostListParams) =>
    normalizePostPage(await api<CursorResponse<Post>>('/posts', { params })),

  get: async (id: string) => normalizePost(await api<Post>(`/posts/${id}`)),

  create: async (data: CreatePostRequest) =>
    normalizePost(await api<Post>('/posts', { method: 'POST', body: data })),

  delete: (id: string) => api<void>(`/posts/${id}`, { method: 'DELETE' }),

  getThread: async (id: string) => {
    const res = await api<{ post: any; ancestors: any[]; descendants: any[] }>(
      `/posts/${id}/thread`,
    )
    return {
      post: normalizePost(res.post),
      ancestors: (res.ancestors ?? []).map(normalizePost),
      descendants: (res.descendants ?? []).map(normalizePost),
    }
  },

  getFeed: async (type?: string, cursor?: string) =>
    normalizePostPage(await api<CursorResponse<Post>>('/feed', { params: { type, cursor } })),

  // Backend keys user posts by username.
  getByUser: async (username: string, type?: string, cursor?: string) =>
    normalizePostPage(
      await api<CursorResponse<Post>>(`/users/${username}/posts`, { params: { type, cursor } }),
    ),
}
