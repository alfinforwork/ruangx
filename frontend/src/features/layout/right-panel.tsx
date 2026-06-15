import { Link } from '@tanstack/react-router'
import { Skeleton } from '@/components/ui/skeleton'
import { useTrendingHashtags } from '@/hooks/hashtag/use-hashtag'
import { useTrends } from '@/hooks/trend/use-trend'
import { usePopularRooms } from '@/hooks/room/use-room'
import { gradientFor, initialsFor } from '@/libs/utils/gradient'
import { MoreHorizontal } from 'lucide-react'

function fmtCount(n: number) {
  return n.toLocaleString('id-ID')
}

export function RightPanel() {
  return (
    <div className="flex h-full flex-col gap-[18px] overflow-y-auto px-5 py-[22px]">
      {/* Ruang Populer */}
      <section className="rounded-[18px] border border-line bg-card p-[18px]">
        <div className="mb-3.5 flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-ink">Ruang Populer</h3>
          <Link to="/rooms" className="text-[13.5px] font-semibold text-violet-soft">
            Lihat semua
          </Link>
        </div>
        <PopularRooms />
      </section>

      {/* Tren untuk Anda */}
      <section className="rounded-[18px] border border-line bg-card p-[18px]">
        <div className="mb-3.5 flex items-center justify-between">
          <h3 className="text-[17px] font-bold text-ink">Tren untuk Anda</h3>
          <Link to="/explore" className="text-[13.5px] font-semibold text-violet-soft">
            Lihat semua
          </Link>
        </div>
        <TrendingList />
      </section>

      {/* Footer */}
      <div className="px-2 py-1">
        <div className="mb-2.5 flex flex-wrap gap-3.5 text-[13px] text-faint-2">
          <span className="cursor-pointer hover:underline">Tentang</span>
          <span className="cursor-pointer hover:underline">Bantuan</span>
          <span className="cursor-pointer hover:underline">Privasi</span>
          <span className="cursor-pointer hover:underline">Ketentuan</span>
          <span className="cursor-pointer hover:underline">Kontak</span>
        </div>
        <div className="text-[12.5px] text-[#4e4e58]">
          © 2026 ruangx. Semua hak dilindungi.
        </div>
      </div>
    </div>
  )
}

function PopularRooms() {
  const { data: rooms, isLoading } = usePopularRooms()

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-1.5 py-2">
            <Skeleton className="h-[42px] w-[42px] rounded-[13px]" />
            <div className="flex-1 space-y-1">
              <Skeleton className="h-3.5 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!rooms?.length) {
    return <p className="px-1.5 py-2 text-sm text-muted">Belum ada ruang populer.</p>
  }

  return (
    <div className="flex flex-col gap-1">
      {rooms.slice(0, 6).map((room) => (
        <Link
          key={room.id}
          to="/rooms/$id"
          params={{ id: room.id }}
          className="flex items-center gap-3 rounded-[11px] px-1.5 py-2 transition-colors hover:bg-white/[0.04]"
        >
          <div
            className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[13px] text-[15px] font-bold text-white"
            style={{ backgroundImage: gradientFor(room.id) }}
          >
            {initialsFor(room.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14.5px] font-bold text-[#f0f0f4]">{room.name}</p>
            <p className="text-[13px] text-muted">{fmtCount(room.memberCount)} anggota</p>
          </div>
          <span className="h-[9px] w-[9px] shrink-0 rounded-full bg-brand-500" />
        </Link>
      ))}
    </div>
  )
}

function TrendingList() {
  const { data: trends, isLoading } = useTrends()
  const { data: hashtags } = useTrendingHashtags()

  const items = [
    ...(hashtags?.map((h) => ({
      id: `#${h.tag}`,
      tag: `#${h.tag}`,
      to: '/hashtag/$tag' as const,
      params: { tag: h.tag },
      posts: h.postCount,
    })) ?? []),
    ...((trends ?? []).map((t) => ({
      id: t.name,
      tag: t.name,
      to: '/explore' as const,
      params: undefined,
      posts: t.postCount,
    }))),
  ].slice(0, 5)

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1 px-1.5 py-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (!items.length) {
    return <p className="px-1.5 py-2 text-sm text-muted">Belum ada tren.</p>
  }

  return (
    <div className="flex flex-col">
      {items.map((item) => (
        <Link
          key={item.id}
          to={item.to}
          params={item.params as never}
          className="flex items-center justify-between rounded-[10px] px-1.5 py-2.5 transition-colors hover:bg-white/[0.04]"
        >
          <div className="min-w-0">
            <div className="truncate text-[14.5px] font-bold text-[#e8e8ee]">{item.tag}</div>
            <div className="mt-px text-[13px] text-muted">{fmtCount(item.posts)} posts</div>
          </div>
          <MoreHorizontal className="h-4 w-4 shrink-0 text-faint-3" />
        </Link>
      ))}
    </div>
  )
}
