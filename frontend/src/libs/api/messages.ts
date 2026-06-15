import type { Message, Conversation, SendMessageRequest, CursorResponse } from '@/types/api'
import { api } from './client'
import { normalizeUser } from './normalize'

function normalizeMessage(m: any, conversationId = ''): Message {
  return {
    id: m?.id ?? '',
    conversationId: m?.conversationId || conversationId,
    sender: normalizeUser(m?.sender ?? { id: m?.senderId }),
    content: m?.content ?? '',
    createdAt: m?.createdAt || new Date().toISOString(),
  }
}

function normalizeConversation(c: any): Conversation {
  return {
    id: c?.id ?? '',
    participants: Array.isArray(c?.participants) ? c.participants.map(normalizeUser) : [],
    lastMessage: c?.lastMessage ? normalizeMessage(c.lastMessage, c?.id) : null,
    unreadCount: c?.unreadCount ?? 0,
    updatedAt: c?.updatedAt || c?.createdAt || new Date().toISOString(),
  }
}

export const messagesApi = {
  send: (data: SendMessageRequest) =>
    api<Message>('/messages', { method: 'POST', body: data }),

  getConversations: async (): Promise<Conversation[]> => {
    const res = await api<CursorResponse<Conversation>>('/conversations')
    return (res.data ?? []).map(normalizeConversation)
  },

  getMessages: async (conversationId: string, cursor?: string): Promise<CursorResponse<Message>> => {
    const res = await api<CursorResponse<Message>>(`/conversations/${conversationId}/messages`, {
      params: { cursor },
    })
    return {
      data: (res.data ?? []).map((m) => normalizeMessage(m, conversationId)),
      meta: { cursor: res.meta?.cursor ?? null, hasMore: res.meta?.hasMore ?? false },
    }
  },
}
