import { useMutation, useQueryClient } from '@tanstack/react-query'
import { followsApi } from '@/libs/api/follows'
import { userKeys } from '@/libs/query'

export function useFollow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => followsApi.follow(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.details() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail('me') })
    },
  })
}

export function useUnfollow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (userId: string) => followsApi.unfollow(userId),
    onSuccess: (_, userId) => {
      queryClient.invalidateQueries({ queryKey: userKeys.details() })
      queryClient.invalidateQueries({ queryKey: userKeys.detail('me') })
    },
  })
}