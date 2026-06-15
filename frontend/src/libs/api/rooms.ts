import type { Room, CreateRoomRequest, CursorResponse } from '@/types/api'
import { api } from './client'
import { normalizeUser } from './normalize'

function normalizeRoom(r: any): Room {
  return {
    id: r?.id ?? '',
    name: r?.name ?? '',
    description: r?.description || null,
    icon: r?.icon || null,
    bannerUrl: r?.bannerUrl || null,
    memberCount: r?.memberCount ?? 0,
    postCount: r?.postCount ?? 0,
    isPrivate: !!r?.isPrivate,
    isJoined: r?.isJoined ?? r?.isMember ?? false,
    createdAt: r?.createdAt || new Date().toISOString(),
    owner: r?.owner ? normalizeUser(r.owner) : undefined,
    moderators: Array.isArray(r?.moderators) ? r.moderators.map(normalizeUser) : undefined,
  }
}

export const roomsApi = {
  list: async (cursor?: string) => {
    const res = await api<CursorResponse<Room>>('/rooms', { params: { cursor } })
    return {
      data: (res.data ?? []).map(normalizeRoom),
      meta: { cursor: res.meta?.cursor ?? null, hasMore: res.meta?.hasMore ?? false },
    }
  },

  get: async (id: string) => normalizeRoom(await api<Room>(`/rooms/${id}`)),

  create: async (data: CreateRoomRequest) =>
    normalizeRoom(await api<Room>('/rooms', { method: 'POST', body: data })),

  join: (id: string) => api<Room>(`/rooms/${id}/join`, { method: 'POST' }),

  leave: (id: string) => api<void>(`/rooms/${id}/leave`, { method: 'POST' }),

  // Popular rooms are served from GET /rooms/ (paginated).
  getPopular: async () => {
    const res = await api<CursorResponse<Room>>('/rooms')
    return (res.data ?? []).map(normalizeRoom)
  },
}
