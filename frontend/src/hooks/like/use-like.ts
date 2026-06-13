import { useMutation, useQueryClient } from '@tanstack/react-query'
import { likesApi } from '@/libs/api/likes'
import { postKeys } from '@/libs/query'

export function useToggleLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: string) => likesApi.toggle(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) })
      const prev = queryClient.getQueryData(postKeys.detail(postId))
      queryClient.setQueryData(postKeys.detail(postId), (old: any) => {
        if (!old) return old
        return { ...old, isLiked: !old.isLiked, likeCount: old.isLiked ? old.likeCount - 1 : old.likeCount + 1 }
      })
      return { prev }
    },
    onError: (_err, postId, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(postKeys.detail(postId), ctx.prev)
    },
    onSettled: (_, __, postId) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) })
    },
  })
}