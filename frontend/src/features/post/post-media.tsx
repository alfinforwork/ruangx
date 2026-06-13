import type { PostMedia as PostMediaType } from '@/types/api'
import { cn } from '@/libs/utils/cn'

interface PostMediaProps {
  media: PostMediaType[]
}

export function PostMedia({ media }: PostMediaProps) {
  if (media.length === 0) return null

  const gridClass = cn(
    'overflow-hidden rounded-xl',
    media.length === 1 && 'max-h-72',
    media.length === 2 && 'grid grid-cols-2 gap-0.5',
    media.length === 3 && 'grid grid-cols-2 gap-0.5',
    media.length >= 4 && 'grid grid-cols-2 gap-0.5',
  )

  return (
    <div className={gridClass}>
      {media.slice(0, 4).map((m, i) => (
        <div
          key={m.id}
          className={cn(
            'relative overflow-hidden',
            media.length === 1 && 'rounded-xl',
            media.length === 2 && i === 0 && 'rounded-l-xl',
            media.length === 2 && i === 1 && 'rounded-r-xl',
            media.length === 3 && i === 0 && 'row-span-2 rounded-l-xl',
            media.length === 3 && i === 1 && 'rounded-tr-xl',
            media.length === 3 && i === 2 && 'rounded-br-xl',
            media.length === 4 && i === 0 && 'rounded-tl-xl',
            media.length === 4 && i === 1 && 'rounded-tr-xl',
            media.length === 4 && i === 2 && 'rounded-bl-xl',
            media.length === 4 && i === 3 && 'rounded-br-xl',
          )}
        >
          {m.type === 'video' ? (
            <video
              src={m.url}
              poster={m.thumbnailUrl}
              controls
              className="h-full w-full object-cover"
            />
          ) : (
            <img
              src={m.url}
              alt={m.alt ?? ''}
              loading="lazy"
              className="h-full w-full object-cover"
            />
          )}
        </div>
      ))}
    </div>
  )
}