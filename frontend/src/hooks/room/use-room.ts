import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { roomsApi } from '@/libs/api/rooms'
import { roomKeys } from '@/libs/query'
import type { CreateRoomRequest } from '@/types/api'

export function useRoomList() {
  return useInfiniteQuery({
    queryKey: roomKeys.list({}),
    queryFn: ({ pageParam }) => roomsApi.list(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.meta.hasMore ? last.meta.cursor : undefined,
  })
}

export function useRoom(id: string) {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => roomsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateRoomRequest) => roomsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roomKeys.all })
    },
  })
}

export function useJoinRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => roomsApi.join(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
    },
  })
}

export function useLeaveRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => roomsApi.leave(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: roomKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: roomKeys.lists() })
    },
  })
}

export function usePopularRooms() {
  return useQuery({
    queryKey: roomKeys.list({ popular: true }),
    queryFn: roomsApi.getPopular,
    staleTime: 5 * 60 * 1000,
  })
}