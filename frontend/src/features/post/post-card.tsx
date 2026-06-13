import { Link } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Post } from '@/types/api'
import { PostMedia } from './post-media'
import { PostActions } from './post-actions'

interface PostCardProps {
  post: Post
  showThreadLine?: boolean
}

export function PostCard({ post, showThreadLine }: PostCardProps) {
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: id,
  })

  return (
    <div className="group border-b border-surface-800 px-4 py-3 transition-colors hover:bg-surface-900/50">
      <div className="flex gap-3">
        {/* Thread line + avatar */}
        <div className="flex flex-col items-center">
          <Link to="/profile/$username" params={{ username: post.author.username }}>
            <Avatar
              src={post.author.avatarUrl}
              alt={post.author.displayName}
              size="md"
            />
          </Link>
          {showThreadLine && (
            <div className="mt-1 w-px flex-1 bg-surface-700" />
          )}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-center gap-2 text-sm">
            <Link
              to="/profile/$username" params={{ username: post.author.username }}
              className="flex items-center gap-1"
            >
              <span className="font-semibold text-white hover:underline">
                {post.author.displayName}
              </span>
              {post.author.isVerified && (
                <Badge variant="brand" className="h-4 px-1 text-[10px]">
                  ✓
                </Badge>
              )}
            </Link>
            <span className="text-gray-500">
              @{post.author.username}
            </span>
            <span className="text-gray-500">·</span>
            <Link to="/post/$id" params={{ id: post.id }} className="text-gray-500 hover:underline">
              {timeAgo}
            </Link>
          </div>

          {/* Content text */}
          <Link to="/post/$id" params={{ id: post.id }} className="block">
            <div className="mt-1 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-100">
              {post.content}
            </div>
          </Link>

          {/* Hashtags */}
          {post.hashtags.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {post.hashtags.map((tag) => (
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

          {/* Media */}
          {post.media.length > 0 && (
            <div className="mt-2">
              <PostMedia media={post.media} />
            </div>
          )}

          {/* Actions */}
          <div className="mt-2">
            <PostActions post={post} compact />
          </div>
        </div>
      </div>
    </div>
  )
}