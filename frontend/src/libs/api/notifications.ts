import type { Notification, CursorResponse } from '@/types/api'
import { api } from './client'

export const notificationsApi = {
  list: (cursor?: string) =>
    api<CursorResponse<Notification>>('/notifications', { params: { cursor } }),

  markRead: (id: string) =>
    api<void>(`/notifications/${id}/read`, { method: 'POST' }),

  markAllRead: () =>
    api<void>('/notifications/read-all', { method: 'POST' }),

  unreadCount: () =>
    api<{ count: number }>('/notifications/unread-count'),
}