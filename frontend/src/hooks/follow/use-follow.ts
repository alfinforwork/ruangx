import { useMutation, useQueryClient } from '@tanstack/react-query'
import { followsApi } from '@/libs/api/follows'
import { userKeys } from '@/libs/query'

export function useFollow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (username: string) => followsApi.follow(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

export function useUnfollow() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (username: string) => followsApi.unfollow(username),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}