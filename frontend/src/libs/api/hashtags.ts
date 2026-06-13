import type { Hashtag, Post, CursorResponse } from '@/types/api'
import { api } from './client'

export const hashtagsApi = {
  trending: () =>
    api<Hashtag[]>('/hashtags/trending'),

  get: (tag: string) =>
    api<Hashtag>(`/hashtags/${tag}`),

  getPosts: (tag: string, cursor?: string) =>
    api<CursorResponse<Post>>(`/hashtags/${tag}/posts`, { params: { cursor } }),
}