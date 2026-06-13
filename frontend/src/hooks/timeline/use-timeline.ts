import { useInfiniteQuery } from '@tanstack/react-query'
import { timelineApi } from '@/libs/api/timeline'
import { feedKeys } from '@/libs/query'

export function useTimeline(type: string = 'for_you') {
  return useInfiniteQuery({
    queryKey: feedKeys.list(type),
    queryFn: ({ pageParam }) => timelineApi.get(type, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.meta.hasMore ? last.meta.cursor : undefined,
  })
}