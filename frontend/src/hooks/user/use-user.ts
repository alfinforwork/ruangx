import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { usersApi } from '@/libs/api/users'
import { userKeys } from '@/libs/query'
import { postsApi } from '@/libs/api/posts'
import { postKeys } from '@/libs/query'

export function useUser(username: string) {
  return useQuery({
    queryKey: userKeys.detail(username),
    queryFn: () => usersApi.getProfile(username),
    enabled: !!username,
  })
}

export function useUserPosts(username: string, type?: string) {
  return useInfiniteQuery({
    queryKey: userKeys.posts(username, type),
    queryFn: ({ pageParam }) =>
      postsApi.getByUser(username, type, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.meta.hasMore ? last.meta.cursor : undefined),
    enabled: !!username,
  })
}

export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: userKeys.search(query),
    queryFn: () => usersApi.search(query),
    enabled: query.length >= 2,
  })
}

export function useSuggestions() {
  return useQuery({
    queryKey: [...userKeys.all, 'suggestions'],
    queryFn: () => usersApi.getSuggestions().catch(() => [] as Awaited<ReturnType<typeof usersApi.getSuggestions>>),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}