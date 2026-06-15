import { useParams, useNavigate } from '@tanstack/react-router'
import { usePost, usePostThread } from '@/hooks/post/use-post'
import { PostCard } from '@/features/post/post-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar } from '@/components/ui/avatar'
import { useAuthStore } from '@/stores/auth'
import { useComposerStore } from '@/stores/composer'
import { ChevronLeft } from 'lucide-react'
import type { Post } from '@/types/api'

export function PostDetailPage() {
  const { id } = useParams({ from: '/_layout/post/$id' })
  const { data: post, isLoading } = usePost(id)
  const { data: thread } = usePostThread(id)
  const navigate = useNavigate()

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-24 pt-4 lg:px-7 lg:pb-16 lg:pt-7">
      <button
        onClick={() => window.history.length > 1 ? window.history.back() : navigate({ to: '/' })}
        className="mb-4 flex items-center gap-1.5 text-[15px] font-semibold text-muted-2 hover:text-ink"
      >
        <ChevronLeft className="h-5 w-5" />
        Kembali
      </button>

      {isLoading || !post ? (
        <div className="rounded-[18px] border border-line bg-card p-5">
          <div className="flex gap-3">
            <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      ) : (
        <ThreadBody
          post={post}
          ancestors={thread?.ancestors ?? []}
          replies={thread?.descendants ?? []}
        />
      )}
    </div>
  )
}

function ThreadBody({
  post,
  ancestors,
  replies,
}: {
  post: Post
  ancestors: Post[]
  replies: Post[]
}) {
  const user = useAuthStore((s) => s.user)
  const openComposer = useComposerStore((s) => s.open)

  const openReply = () =>
    openComposer({
      postId: post.id,
      username: post.author.username,
      displayName: post.author.displayName,
      content: post.content,
      avatarUrl: post.author.avatarUrl,
      verified: post.author.isVerified,
    })

  return (
    <div className="flex flex-col gap-3.5">
      {/* Parent chain */}
      {ancestors.map((p) => (
        <PostCard key={p.id} post={p} showThreadLine />
      ))}

      {/* Lead post */}
      <PostCard post={post} />

      {/* Reply trigger */}
      <button
        onClick={openReply}
        className="flex items-center gap-3.5 rounded-[18px] border border-line bg-card p-[16px_20px] text-left transition-colors hover:border-line-strong"
      >
        <Avatar src={user?.avatarUrl} alt={user?.displayName ?? ''} seed={user?.username} size="md" />
        <div className="flex-1 text-[15.5px] text-faint">Tulis balasan kamu...</div>
        <span className="rounded-[11px] bg-grad-brand px-5 py-[9px] text-[14px] font-bold text-white">
          Balas
        </span>
      </button>

      {/* Replies */}
      <div className="mx-0.5 mt-1.5 flex items-center gap-2.5">
        <span className="text-[15px] font-bold text-[#c9c9d2]">Balasan</span>
        <span className="h-px flex-1 bg-line-mid" />
      </div>

      {replies.length > 0 ? (
        replies.map((p) => <PostCard key={p.id} post={p} />)
      ) : (
        <div className="py-12 text-center text-sm text-muted">
          Belum ada balasan. Jadilah yang pertama membalas.
        </div>
      )}
    </div>
  )
}
