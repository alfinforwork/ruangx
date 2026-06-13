import type { Post, CreatePostRequest, PaginatedResponse, CursorResponse, PostListParams } from '@/types/api'
import { api } from './client'

export const postsApi = {
  list: (params?: PostListParams) =>
    api<CursorResponse<Post>>('/posts', { params }),

  get: (id: string) =>
    api<Post>(`/posts/${id}`),

  create: (data: CreatePostRequest) =>
    api<Post>('/posts', { method: 'POST', body: data }),

  delete: (id: string) =>
    api<void>(`/posts/${id}`, { method: 'DELETE' }),

  getThread: (id: string) =>
    api<{ post: Post; ancestors: Post[]; descendants: Post[] }>(`/posts/${id}/thread`),

  getFeed: (type?: string, cursor?: string) =>
    api<CursorResponse<Post>>('/feed', { params: { type, cursor } }),

  getByUser: (userId: string, type?: string, cursor?: string) =>
    api<CursorResponse<Post>>(`/users/${userId}/posts`, { params: { type, cursor } }),
}