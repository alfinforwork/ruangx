import type { Post } from '@/types/api'
import { PostCard } from './post-card'

interface PostThreadProps {
  ancestors: Post[]
  post: Post
  descendants: Post[]
}

export function PostThread({ ancestors, post, descendants }: PostThreadProps) {
  return (
    <div>
      {/* Ancestors (parent chain) */}
      {ancestors.map((p) => (
        <PostCard key={p.id} post={p} showThreadLine />
      ))}

      {/* Main post */}
      <div className="border-b border-surface-800">
        <PostCard post={post} />
      </div>

      {/* Replies */}
      {descendants.length > 0 ? (
        <div>
          {descendants.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <p className="text-sm">Belum ada balasan</p>
        </div>
      )}
    </div>
  )
}