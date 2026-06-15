import type { Post } from '@/types/api'
import { useToggleLike } from '@/hooks/like/use-like'
import { useToggleBookmark } from '@/hooks/bookmark/use-bookmark'
import { useComposerStore } from '@/stores/composer'
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share,
} from 'lucide-react'

export function formatCount(n: number): string {
  if (!n) return '0'
  if (n < 1000) return String(n)
  const k = n / 1000
  return `${(Math.round(k * 10) / 10).toString().replace('.', ',')}K`
}

interface PostActionsProps {
  post: Post
}

export function PostActions({ post }: PostActionsProps) {
  const toggleLike = useToggleLike()
  const toggleBookmark = useToggleBookmark()
  const openComposer = useComposerStore((s) => s.open)

  const stop = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleReply = (e: React.MouseEvent) => {
    stop(e)
    openComposer({ postId: post.id, username: post.author.username })
  }
  const handleLike = (e: React.MouseEvent) => {
    stop(e)
    toggleLike.mutate(post.id)
  }
  const handleBookmark = (e: React.MouseEvent) => {
    stop(e)
    toggleBookmark.mutate(post.id)
  }
  const handleShare = async (e: React.MouseEvent) => {
    stop(e)
    const url = `${window.location.origin}/post/${post.id}`
    if (navigator.share) {
      await navigator.share({ title: 'ruangx', text: post.content, url })
    } else {
      await navigator.clipboard.writeText(url)
    }
  }

  return (
    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
      <ActionButton
        onClick={handleReply}
        icon={<MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.9} />}
        label={formatCount(post.replyCount)}
        hover="hover:bg-brand-500/[0.12] hover:text-violet-soft"
        color="text-muted"
      />
      <ActionButton
        onClick={stop}
        icon={<Repeat2 className="h-[18px] w-[18px]" strokeWidth={1.9} />}
        label={formatCount(post.repostCount)}
        hover="hover:bg-[#2ecf8f]/[0.12]"
        color={post.isReposted ? 'text-[#2ecf8f]' : 'text-muted'}
      />
      <ActionButton
        onClick={handleLike}
        icon={
          <Heart
            className="h-[18px] w-[18px]"
            strokeWidth={1.9}
            fill={post.isLiked ? 'currentColor' : 'none'}
          />
        }
        label={formatCount(post.likeCount)}
        hover="hover:bg-[#fb5a7e]/[0.12]"
        color={post.isLiked ? 'text-[#fb5a7e]' : 'text-muted'}
      />

      <div className="flex-1" />

      <ActionButton
        onClick={handleBookmark}
        icon={
          <Bookmark
            className="h-[18px] w-[18px]"
            strokeWidth={1.9}
            fill={post.isBookmarked ? 'currentColor' : 'none'}
          />
        }
        hover="hover:bg-brand-500/[0.12]"
        color={post.isBookmarked ? 'text-brand-500' : 'text-muted'}
      />
      <ActionButton
        onClick={handleShare}
        icon={<Share className="h-[18px] w-[18px]" strokeWidth={1.9} />}
        hover="hover:bg-brand-500/[0.12] hover:text-violet-soft"
        color="text-muted"
      />
    </div>
  )
}

function ActionButton({
  onClick,
  icon,
  label,
  hover,
  color,
}: {
  onClick: (e: React.MouseEvent) => void
  icon: React.ReactNode
  label?: string
  hover: string
  color: string
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-[7px] rounded-[9px] px-[9px] py-1.5 text-[13.5px] transition-all ${color} ${hover}`}
    >
      {icon}
      {label !== undefined && <span>{label}</span>}
    </button>
  )
}
