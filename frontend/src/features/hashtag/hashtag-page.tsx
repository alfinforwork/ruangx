import { useParams, Link } from '@tanstack/react-router'
import { useHashtag, useHashtagPosts } from '@/hooks/hashtag/use-hashtag'
import { PostCard } from '@/features/post/post-card'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, Hash } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

export function HashtagPage() {
  const { tag } = useParams({ from: '/_layout/hashtag/$tag' })
  const { data: hashtag, isLoading } = useHashtag(tag)
  const { data: postsData, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading: postsLoading } = useHashtagPosts(tag)
  const navigate = useNavigate()

  const posts = postsData?.pages.flatMap((p) => p.data) ?? []

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-surface-800 px-4 py-3">
        <button
          onClick={() => navigate({ to: '/explore' })}
          className="rounded-full p-1 text-white hover:bg-surface-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">#{tag}</h1>
          {hashtag && (
            <p className="text-xs text-gray-500">
              {hashtag.postCount.toLocaleString('id-ID')} kiriman
            </p>
          )}
        </div>
      </div>

      {postsLoading ? (
        <div className="divide-y divide-surface-800">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 px-4 py-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Hash className="h-12 w-12 mb-3" />
          <p className="text-sm">Belum ada kiriman dengan tag #{tag}</p>
        </div>
      ) : (
        <div className="divide-y divide-surface-800">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}