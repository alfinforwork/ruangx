import { useState } from 'react'
import type { Post } from '@/types/api'
import { useToggleLike } from '@/hooks/like/use-like'
import { useToggleBookmark } from '@/hooks/bookmark/use-bookmark'
import { useComposerStore } from '@/stores/composer'
import { Heart, MessageCircle, Repeat2, Bookmark, Share } from 'lucide-react'

interface PostActionsProps {
  post: Post
  compact?: boolean
}

export function PostActions({ post, compact = false }: PostActionsProps) {
  const toggleLike = useToggleLike()
  const toggleBookmark = useToggleBookmark()
  const openComposer = useComposerStore((s) => s.open)

  const handleReply = () => {
    openComposer({ postId: post.id, username: post.author.username })
  }

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleLike.mutate(post.id)
  }

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    toggleBookmark.mutate(post.id)
  }

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.share) {
      await navigator.share({
        title: 'ruangx',
        text: post.content,
        url: `${window.location.origin}/post/${post.id}`,
      })
    } else {
      await navigator.clipboard.writeText(
        `${window.location.origin}/post/${post.id}`,
      )
    }
  }

  const iconClass = compact ? 'h-4 w-4' : 'h-5 w-5'
  const textClass = compact ? 'text-xs' : 'text-sm'

  return (
    <div
      className={`flex items-center ${
        compact ? 'gap-3' : 'gap-6'
      } text-gray-500`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Reply */}
      <button
        onClick={handleReply}
        className="flex items-center gap-1.5 transition-colors hover:text-brand-400 group"
      >
        <div className="rounded-full p-1.5 transition-colors group-hover:bg-brand-600/20">
          <MessageCircle className={iconClass} />
        </div>
        {post.replyCount > 0 && (
          <span className={textClass}>{post.replyCount}</span>
        )}
      </button>

      {/* Repost */}
      <button className="flex items-center gap-1.5 transition-colors hover:text-green-400 group">
        <div className="rounded-full p-1.5 transition-colors group-hover:bg-green-600/20">
          <Repeat2 className={iconClass} />
        </div>
        {post.repostCount > 0 && (
          <span className={textClass}>{post.repostCount}</span>
        )}
      </button>

      {/* Like */}
      <button
        onClick={handleLike}
        className={`flex items-center gap-1.5 transition-colors group ${
          post.isLiked ? 'text-red-400' : 'hover:text-red-400'
        }`}
      >
        <div
          className={`rounded-full p-1.5 transition-colors ${
            post.isLiked
              ? 'bg-red-600/20'
              : 'group-hover:bg-red-600/20'
          }`}
        >
          <Heart
            className={`${iconClass} ${
              post.isLiked ? 'fill-red-400' : ''
            }`}
          />
        </div>
        {post.likeCount > 0 && (
          <span className={textClass}>{post.likeCount}</span>
        )}
      </button>

      {/* Bookmark */}
      <button
        onClick={handleBookmark}
        className={`flex items-center gap-1.5 transition-colors group ${
          post.isBookmarked ? 'text-brand-400' : 'hover:text-brand-400'
        }`}
      >
        <div
          className={`rounded-full p-1.5 transition-colors ${
            post.isBookmarked
              ? 'bg-brand-600/20'
              : 'group-hover:bg-brand-600/20'
          }`}
        >
          <Bookmark
            className={`${iconClass} ${
              post.isBookmarked ? 'fill-brand-400' : ''
            }`}
          />
        </div>
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 transition-colors hover:text-brand-400 group"
      >
        <div className="rounded-full p-1.5 transition-colors group-hover:bg-brand-600/20">
          <Share className={iconClass} />
        </div>
      </button>
    </div>
  )
}