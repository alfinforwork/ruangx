import { useMutation, useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { bookmarksApi } from '@/libs/api/bookmarks'
import { bookmarkKeys, postKeys } from '@/libs/query'

export function useToggleBookmark() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (postId: string) => bookmarksApi.toggle(postId),
    onMutate: async (postId) => {
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) })
      const prev = queryClient.getQueryData(postKeys.detail(postId))
      queryClient.setQueryData(postKeys.detail(postId), (old: any) => {
        if (!old) return old
        return { ...old, isBookmarked: !old.isBookmarked, bookmarkCount: old.isBookmarked ? old.bookmarkCount - 1 : old.bookmarkCount + 1 }
      })
      return { prev }
    },
    onError: (_err, postId, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(postKeys.detail(postId), ctx.prev)
    },
    onSettled: (_, __, postId) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) })
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.all })
    },
  })
}

export function useBookmarkList() {
  return useInfiniteQuery({
    queryKey: bookmarkKeys.list(),
    queryFn: ({ pageParam }) => bookmarksApi.list(pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.meta.hasMore ? last.meta.cursor : undefined,
  })
}