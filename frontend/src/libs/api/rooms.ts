import type { Room, CreateRoomRequest, CursorResponse } from '@/types/api'
import { api } from './client'

export const roomsApi = {
  list: (cursor?: string) =>
    api<CursorResponse<Room>>('/rooms', { params: { cursor } }),

  get: (id: string) =>
    api<Room>(`/rooms/${id}`),

  create: (data: CreateRoomRequest) =>
    api<Room>('/rooms', { method: 'POST', body: data }),

  join: (id: string) =>
    api<Room>(`/rooms/${id}/join`, { method: 'POST' }),

  leave: (id: string) =>
    api<void>(`/rooms/${id}/leave`, { method: 'POST' }),

  getPopular: () =>
    api<Room[]>('/rooms/popular'),
}