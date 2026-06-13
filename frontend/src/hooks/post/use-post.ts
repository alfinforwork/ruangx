import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { postsApi } from '@/libs/api/posts'
import { postKeys, feedKeys } from '@/libs/query'
import type { CreatePostRequest, PostListParams } from '@/types/api'

export function usePostList(params?: PostListParams) {
  return useInfiniteQuery({
    queryKey: postKeys.list(params as Record<string, unknown> ?? {}),
    queryFn: ({ pageParam }) => postsApi.list({ ...params, cursor: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.meta.hasMore ? last.meta.cursor : undefined,
  })
}

export function usePost(id: string) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postsApi.get(id),
    enabled: !!id,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreatePostRequest) => postsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
      queryClient.invalidateQueries({ queryKey: feedKeys.all })
    },
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => postsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
    },
  })
}

export function usePostThread(id: string) {
  return useQuery({
    queryKey: postKeys.thread(id),
    queryFn: () => postsApi.getThread(id),
    enabled: !!id,
  })
}

export function usePostFeed(type?: string) {
  return useInfiniteQuery({
    queryKey: feedKeys.list(type ?? 'for_you'),
    queryFn: ({ pageParam }) => postsApi.getFeed(type, pageParam as string | undefined),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.meta.hasMore ? last.meta.cursor : undefined,
  })
}