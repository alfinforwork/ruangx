import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { notificationsApi } from '@/libs/api/notifications'
import { notificationKeys } from '@/libs/query'
import { useNotificationStore } from '@/stores/notification'

export function useNotifications() {
  return useInfiniteQuery({
    queryKey: notificationKeys.list(),
    queryFn: ({ pageParam }) => notificationsApi.list(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.meta.hasMore ? last.meta.cursor : undefined,
  })
}

export function useMarkRead() {
  const queryClient = useQueryClient()
  const decrement = useNotificationStore((s) => s.decrement)

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => {
      decrement()
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllRead() {
  const queryClient = useQueryClient()
  const reset = useNotificationStore((s) => s.reset)

  return useMutation({
    mutationFn: () => notificationsApi.markAllRead(),
    onSuccess: () => {
      reset()
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useUnreadCount() {
  const setUnreadCount = useNotificationStore((s) => s.setUnreadCount)

  return useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: async () => {
      const data = await notificationsApi.unreadCount()
      setUnreadCount(data.count)
      return data.count
    },
    refetchInterval: 30_000,
  })
}