import type { Message, Conversation, SendMessageRequest, CursorResponse } from '@/types/api'
import { api } from './client'

export const messagesApi = {
  send: (data: SendMessageRequest) =>
    api<Message>('/messages', { method: 'POST', body: data }),

  getConversations: () =>
    api<Conversation[]>('/messages/conversations'),

  getMessages: (conversationId: string, cursor?: string) =>
    api<CursorResponse<Message>>(`/messages/${conversationId}`, { params: { cursor } }),
}