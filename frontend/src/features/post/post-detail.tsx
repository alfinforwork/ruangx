import { useParams, Link } from '@tanstack/react-router'
import { usePost, usePostThread } from '@/hooks/post/use-post'
import { PostCard } from '@/features/post/post-card'
import { PostActions } from '@/features/post/post-actions'
import { PostMedia } from '@/features/post/post-media'
import { PostThread } from '@/features/post/post-thread'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ComposerModal, PostComposer } from '@/features/post/post-composer'
import { ChevronLeft } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { useComposerStore } from '@/stores/composer'

export function PostDetailPage() {
  const { id } = useParams({ from: '/_layout/post/$id' })
  const { data: post, isLoading } = usePost(id)
  const { data: thread, isLoading: threadLoading } = usePostThread(id)
  const navigate = useNavigate()
  const openComposer = useComposerStore((s) => s.open)

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p className="text-lg">Kiriman tidak ditemukan</p>
        <button
          onClick={() => navigate({ to: '/' })}
          className="mt-4 text-sm text-brand-400 hover:underline"
        >
          Kembali
        </button>
      </div>
    )
  }

  if (thread) {
    return <ThreadView post={post} thread={thread} />
  }

  return <SinglePostView post={post} />
}

function SinglePostView({ post }: { post: any }) {
  const navigate = useNavigate()
  const openComposer = useComposerStore((s) => s.open)

  return (
    <div>
      <div className="flex items-center gap-3 border-b border-surface-800 px-4 py-3">
        <button
          onClick={() => navigate({ to: '/' })}
          className="rounded-full p-1 text-white hover:bg-surface-800"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className="text-lg font-bold text-white">Kiriman</h1>
      </div>

      <div className="px-4 py-4">
        <div className="flex gap-3">
          <Link to="/profile/$username" params={{ username: post.author.username }}>
            <Avatar
              src={post.author.avatarUrl}
              alt={post.author.displayName}
              size="lg"
            />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Link
                to="/profile/$username" params={{ username: post.author.username }}
                className="font-semibold text-white hover:underline"
              >
                {post.author.displayName}
              </Link>
              {post.author.isVerified && (
                <Badge variant="brand" className="h-4 px-1 text-[10px]">
                  ✓
                </Badge>
              )}
              <span className="text-sm text-gray-500">
                @{post.author.username}
              </span>
            </div>

            <p className="mt-2 whitespace-pre-wrap text-lg leading-relaxed text-gray-100">
              {post.content}
            </p>

            {post.hashtags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {post.hashtags.map((tag: string) => (
                  <Link
                    key={tag}
                    to="/hashtag/$tag" params={{ tag }}
                    className="text-sm text-brand-400 hover:underline"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {post.media.length > 0 && (
              <div className="mt-3">
                <PostMedia media={post.media} />
              </div>
            )}

            <p className="mt-3 text-sm text-gray-500">
              {formatDistanceToNow(new Date(post.createdAt), {
                addSuffix: true,
                locale: id,
              })}
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-b border-surface-800 py-3">
          <PostActions post={post} />
        </div>

        <div className="mt-3">
          <PostComposer />
        </div>
      </div>
    </div>
  )
}

function ThreadView({
  post,
  thread,
}: {
  post: any
  thread: { ancestors: any[]; post: any; descendants: any[] }
}) {
  return (
    <div>
      <PostThread
        ancestors={thread.ancestors}
        post={thread.post}
        descendants={thread.descendants}
      />
    </div>
  )
}