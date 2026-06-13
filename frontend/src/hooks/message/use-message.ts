import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { messagesApi } from '@/libs/api/messages'
import { messageKeys } from '@/libs/query'
import type { SendMessageRequest } from '@/types/api'

export function useConversations() {
  return useQuery({
    queryKey: messageKeys.conversations(),
    queryFn: messagesApi.getConversations,
  })
}

export function useMessages(conversationId: string) {
  return useInfiniteQuery({
    queryKey: messageKeys.conversation(conversationId),
    queryFn: ({ pageParam }) => messagesApi.getMessages(conversationId, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.meta.hasMore ? last.meta.cursor : undefined,
    enabled: !!conversationId,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SendMessageRequest) => messagesApi.send(data),
    onSuccess: (_, data) => {
      if (data.conversationId) {
        queryClient.invalidateQueries({ queryKey: messageKeys.conversation(data.conversationId) })
      }
      queryClient.invalidateQueries({ queryKey: messageKeys.conversations() })
    },
  })
}