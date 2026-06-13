import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { hashtagsApi } from '@/libs/api/hashtags'
import { hashtagKeys } from '@/libs/query'

export function useTrendingHashtags() {
  return useQuery({
    queryKey: hashtagKeys.trending(),
    queryFn: hashtagsApi.trending,
    staleTime: 5 * 60 * 1000,
  })
}

export function useHashtag(tag: string) {
  return useQuery({
    queryKey: hashtagKeys.detail(tag),
    queryFn: () => hashtagsApi.get(tag),
    enabled: !!tag,
  })
}

export function useHashtagPosts(tag: string) {
  return useInfiniteQuery({
    queryKey: hashtagKeys.posts(tag),
    queryFn: ({ pageParam }) => hashtagsApi.getPosts(tag, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.meta.hasMore ? last.meta.cursor : undefined,
    enabled: !!tag,
  })
}