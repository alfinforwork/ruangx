import type { Post, CursorResponse } from '@/types/api'
import { api } from './client'
import { normalizePostPage } from './normalize'

export const timelineApi = {
  get: async (type?: string, cursor?: string): Promise<CursorResponse<Post>> => {
    const res = await api<CursorResponse<Post>>('/timeline', { params: { type, cursor } })
    return normalizePostPage(res)
  },
}
