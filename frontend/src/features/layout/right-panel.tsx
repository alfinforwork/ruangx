import { Link } from '@tanstack/react-router'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useTrendingHashtags } from '@/hooks/hashtag/use-hashtag'
import { useTrends } from '@/hooks/trend/use-trend'
import { usePopularRooms } from '@/hooks/room/use-room'
import { Search, TrendingUp, Hash, Users } from 'lucide-react'

export function RightPanel() {
  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto px-4 py-4">
      {/* Search */}
      <Link
        to="/search"
        className="flex items-center gap-3 rounded-full bg-surface-800 px-4 py-2.5 text-sm text-gray-400 transition-colors hover:bg-surface-700 hover:text-white"
      >
        <Search className="h-4 w-4" />
        <span>Cari di ruangx</span>
      </Link>

      {/* Trending */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-white">Trending</h3>
        </div>
        <TrendingList />
      </Card>

      {/* Popular Rooms */}
      <Card>
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-brand-500" />
          <h3 className="text-sm font-semibold text-white">Ruang Populer</h3>
        </div>
        <PopularRooms />
      </Card>
    </div>
  )
}

function TrendingList() {
  const { data: trends, isLoading } = useTrends()
  const { data: hashtags } = useTrendingHashtags()

  // Merge trends + hashtags
  const items = [
    ...(hashtags?.map((h) => ({
      id: `#${h.tag}`,
      name: `#${h.tag}`,
      postCount: h.postCount,
    })) ?? []),
    ...((trends ?? []).map((t) => ({
      id: t.name,
      name: t.name,
      postCount: t.postCount,
    }))),
  ].slice(0, 5)

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <Link
          key={item.id}
          to={item.id.startsWith('#') ? ('/hashtag/$tag' as const) : '/search'} params={item.id.startsWith('#') ? { tag: item.id.slice(1) } : undefined}
          className="group block rounded-lg px-1 py-2 transition-colors hover:bg-surface-800"
        >
          <p className="text-sm font-medium text-white group-hover:text-brand-400">
            {item.name}
          </p>
          <p className="text-xs text-gray-500">{item.postCount.toLocaleString('id-ID')} kiriman</p>
        </Link>
      ))}
    </div>
  )
}

function PopularRooms() {
  const { data: rooms, isLoading } = usePopularRooms()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1 flex-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {rooms?.slice(0, 4).map((room) => (
        <Link
          key={room.id}
          to="/rooms/$id" params={{ id: room.id }}
          className="flex items-center gap-3 rounded-lg px-1 py-2 transition-colors hover:bg-surface-800"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600/20 text-brand-400">
            {room.icon?.[0]?.toUpperCase() ?? room.name[0].toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-white">
              {room.name}
            </p>
            <p className="text-xs text-gray-500">
              {room.memberCount.toLocaleString('id-ID')} anggota
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}