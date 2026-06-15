import { useInfiniteQuery } from '@tanstack/react-query'
import { PostCard } from './post-card'
import { Spinner } from '@/components/ui/spinner'
import { Skeleton } from '@/components/ui/skeleton'
import { useEffect, useRef } from 'react'
import type { Post, CursorResponse } from '@/types/api'

interface PostListProps {
  queryKey: readonly unknown[]
  queryFn: (params: { pageParam: string | undefined }) => Promise<CursorResponse<Post>>
  emptyTitle?: string
  emptySubtitle?: string
}

export function PostList({ queryKey, queryFn, emptyTitle, emptySubtitle }: PostListProps) {
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
      <div className="flex flex-col gap-3.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-[18px] border border-line bg-card p-5">
            <div className="flex gap-3">
              <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted">
        <p className="text-sm">Gagal memuat thread</p>
        <p className="mt-1 text-xs text-[#fb5a7e]">
          {error instanceof Error ? error.message : 'Terjadi kesalahan'}
        </p>
      </div>
    )
  }

  const posts = data?.pages.flatMap((page) => page.data) ?? []

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted">
        <p className="text-[15px] font-semibold text-ink">{emptyTitle ?? 'Belum ada thread'}</p>
        <p className="mt-1 text-sm">{emptySubtitle ?? 'Mulai dengan membuat thread pertamamu'}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3.5">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isFetchingNextPage && <Spinner size="sm" />}
      </div>
    </div>
  )
}
