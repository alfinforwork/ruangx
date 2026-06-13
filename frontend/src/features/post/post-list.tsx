import { useInfiniteQuery } from '@tanstack/react-query'
import { PostCard } from './post-card'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useRef } from 'react'
import type { Post, CursorResponse } from '@/types/api'

interface PostListProps {
  queryKey: readonly unknown[]
  queryFn: (params: { pageParam: string | undefined }) => Promise<CursorResponse<Post>>
}

export function PostList({ queryKey, queryFn }: PostListProps) {
  const loadMoreRef = useRef<HTMLDivElement>(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey,
    queryFn: ({ pageParam }) => queryFn({ pageParam: pageParam as string | undefined }),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => (last.meta.hasMore ? last.meta.cursor : undefined),
  })

  // Intersection observer for infinite scroll
  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  if (isLoading) {
    return (
      <div className="divide-y divide-surface-800">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3 px-4 py-3">
            <Skeleton className="h-10 w-10 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p className="text-sm">Gagal memuat kiriman</p>
        <p className="text-xs text-red-400 mt-1">
          {error instanceof Error ? error.message : 'Terjadi kesalahan'}
        </p>
      </div>
    )
  }

  const posts = data?.pages.flatMap((page) => page.data) ?? []

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p className="text-sm">Belum ada kiriman</p>
        <p className="text-xs mt-1">Mulai dengan membuat kiriman pertama</p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-surface-800">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}

      {/* Load more trigger */}
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && <Spinner size="sm" />}
      </div>
    </div>
  )
}