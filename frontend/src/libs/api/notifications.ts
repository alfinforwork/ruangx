import type { Notification, CursorResponse } from '@/types/api'
import { api } from './client'
import { normalizeUser } from './normalize'

function normalizeNotification(n: any): Notification {
  return {
    id: n?.id ?? '',
    type: n?.type ?? 'like',
    actor: normalizeUser(n?.actor ?? {}),
    postId: n?.postId ?? null,
    postContent: n?.postContent ?? n?.message ?? null,
    read: n?.read ?? n?.isRead ?? false,
    createdAt: n?.createdAt || new Date().toISOString(),
  }
}

export const notificationsApi = {
  list: async (cursor?: string): Promise<CursorResponse<Notification>> => {
    const res = await api<CursorResponse<Notification>>('/notifications', { params: { cursor } })
    return {
      data: (res.data ?? []).map(normalizeNotification),
      meta: { cursor: res.meta?.cursor ?? null, hasMore: res.meta?.hasMore ?? false },
    }
  },

  markRead: (id: string) =>
    api<void>('/notifications/read', { method: 'PUT', body: { id } }),

  markAllRead: () => api<void>('/notifications/read-all', { method: 'PUT' }),

  unreadCount: () => api<{ count: number }>('/notifications/unread-count'),
}
