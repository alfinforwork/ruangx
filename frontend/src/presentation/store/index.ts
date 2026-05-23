import { create } from 'zustand'
import type { User } from '@/core/domain/entities'
import * as api from '@/infrastructure/api'
import { wsClient } from '@/infrastructure/websocket/client'

interface AuthState {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  restore: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  loading: true,

  login: async (email, password) => {
    const res = await api.login({ email, password })
    api.setToken(res.token)
    wsClient.connect(res.token)
    set({ user: res.user, token: res.token })
  },

  register: async (name, email, password) => {
    const res = await api.register({ name, email, password })
    api.setToken(res.token)
    wsClient.connect(res.token)
    set({ user: res.user, token: res.token })
  },

  logout: () => {
    api.setToken(null)
    wsClient.disconnect()
    set({ user: null, token: null })
  },

  restore: async () => {
    const t = api.getToken()
    if (!t) { set({ loading: false }); return }
    api.setToken(t)
    wsClient.connect(t)
    try {
      const user = await api.getProfile('me')  // TODO: add getMe endpoint
      set({ user, token: t, loading: false })
    } catch {
      api.setToken(null)
      set({ loading: false })
    }
  },
}))

// ─── Post store ───

interface PostState {
  feed: import('@/core/domain/entities').Post[]
  trendingTags: string[]
  loading: boolean
  loadFeed: (page?: number) => Promise<void>
  loadTrending: () => Promise<void>
}

export const usePostStore = create<PostState>((set) => ({
  feed: [],
  trendingTags: [],
  loading: false,
  loadFeed: async (page) => {
    set({ loading: true })
    const res = await api.getFeed(page)
    set({ feed: res.data, loading: false })
  },
  loadTrending: async () => {
    const tags = await api.getTrendingTags()
    set({ trendingTags: tags })
  },
}))