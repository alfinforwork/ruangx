import { Link, useNavigate } from '@tanstack/react-router'
import { Avatar } from '@/components/ui/avatar'
import type { Post } from '@/types/api'
import { timeAgo } from '@/libs/utils/time'
import { PostMedia } from './post-media'
import { PostActions } from './post-actions'
import { BadgeCheck, MoreHorizontal } from 'lucide-react'

interface PostCardProps {
  post: Post
  /** Render flat inside a divided container instead of a standalone card. */
  flush?: boolean
  /** Show a connecting thread line below the avatar (reply chains). */
  showThreadLine?: boolean
}

export function PostCard({ post, flush, showThreadLine }: PostCardProps) {
  const navigate = useNavigate()
  const open = () => navigate({ to: '/post/$id', params: { id: post.id } })

  return (
    <article
      onClick={open}
      className={`cursor-pointer font-display text-ink transition-colors ${
        flush
          ? 'border-b border-line-soft px-5 py-4 hover:bg-white/[0.02]'
          : 'rounded-[18px] border border-line bg-card p-[18px_20px] hover:border-line-strong'
      }`}
    >
      {/* Header */}
      <header className="flex items-start gap-3">
        <div className="flex flex-col items-center">
          <Link
            to="/profile/$username"
            params={{ username: post.author.username }}
            onClick={(e) => e.stopPropagation()}
          >
            <Avatar
              src={post.author.avatarUrl}
              alt={post.author.displayName}
              seed={post.author.username}
              className="h-11 w-11"
            />
          </Link>
          {showThreadLine && <div className="mt-1 w-0.5 flex-1 rounded bg-brand-500/30" />}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <Link
              to="/profile/$username"
              params={{ username: post.author.username }}
              onClick={(e) => e.stopPropagation()}
              className="text-[15px] font-bold text-ink-bright hover:underline"
            >
              {post.author.displayName}
            </Link>
            {post.author.isVerified && (
              <BadgeCheck className="h-4 w-4 fill-brand-500 text-card" />
            )}
            <span className="text-[14px] text-muted">@{post.author.username}</span>
            <span className="text-[14px] text-faint-3">·</span>
            <span className="text-[14px] text-muted">{timeAgo(post.createdAt)}</span>
          </div>
        </div>

        <button
          onClick={(e) => e.stopPropagation()}
          className="rounded-lg p-1 leading-none text-faint-2 transition-colors hover:bg-white/[0.06] hover:text-[#c9c9d2]"
        >
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </header>

      {/* Body */}
      {post.content && (
        <div className="ml-14 mb-1 mt-2.5 whitespace-pre-wrap text-[15.5px] leading-relaxed text-ink-dim">
          {post.content}
        </div>
      )}

      {/* Hashtags */}
      {post.hashtags.length > 0 && (
        <div className="ml-14 mt-1 flex flex-wrap gap-1.5">
          {post.hashtags.map((tag) => (
            <Link
              key={tag}
              to="/hashtag/$tag"
              params={{ tag }}
              onClick={(e) => e.stopPropagation()}
              className="text-sm font-medium text-violet-soft hover:underline"
            >
              #{tag}
            </Link>
          ))}
        </div>
      )}

      {/* Media */}
      {post.media.length > 0 && (
        <div className="ml-14 mt-2.5">
          <PostMedia media={post.media} />
        </div>
      )}

      {/* Actions */}
      <div className="ml-14 mt-3">
        <PostActions post={post} />
      </div>
    </article>
  )
}
