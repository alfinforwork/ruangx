import type { Post, CursorResponse } from '@/types/api'
import { api } from './client'

export const timelineApi = {
  get: (type?: string, cursor?: string) =>
    api<CursorResponse<Post>>('/timeline', { params: { type, cursor } }),
}