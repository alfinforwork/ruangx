import type { Hashtag, Post, CursorResponse } from '@/types/api'
import { api } from './client'
import { normalizePostPage } from './normalize'

// Backend returns trend rows as { id, name: "#tag", postCount, ... } — normalize
// them to the frontend Hashtag shape that components expect.
function normalize(raw: any, index = 0): Hashtag {
  const name: string = raw?.tag ?? raw?.name ?? ''
  return {
    id: raw?.id ?? name,
    tag: name.replace(/^#/, ''),
    postCount: raw?.postCount ?? raw?.post_count ?? 0,
    isTrending: raw?.isTrending ?? true,
    trendingRank: raw?.trendingRank ?? raw?.rank ?? index + 1,
  }
}

export const hashtagsApi = {
  trending: async () => {
    const data = await api<any[]>('/hashtags/trending')
    return (Array.isArray(data) ? data : []).map((h, i) => normalize(h, i))
  },

  get: async (tag: string) => {
    const data = await api<any>(`/hashtags/${tag}`)
    return normalize(data)
  },

  getPosts: async (tag: string, cursor?: string) =>
    normalizePostPage(
      await api<CursorResponse<Post>>(`/hashtags/${tag}/posts`, { params: { cursor } }),
    ),
}
