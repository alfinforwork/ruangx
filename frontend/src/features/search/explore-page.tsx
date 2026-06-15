import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useSearchUsers, useSuggestions } from '@/hooks/user/use-user'
import { useTrendingHashtags } from '@/hooks/hashtag/use-hashtag'
import { usePopularRooms } from '@/hooks/room/use-room'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { FollowButton } from '@/features/profile/follow-button'
import { gradientFor, initialsFor } from '@/libs/utils/gradient'
import { BadgeCheck, Search } from 'lucide-react'

const CATEGORIES = ['Untuk Anda', 'Tren', 'Berita', 'Olahraga', 'Hiburan', 'Teknologi']

function fmt(n: number) {
  return n.toLocaleString('id-ID')
}

export function ExplorePage() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('Untuk Anda')
  const { data: searchResults } = useSearchUsers(query)
  const { data: trending } = useTrendingHashtags()
  const { data: rooms } = usePopularRooms()
  const { data: suggestions, isLoading: suggestionsLoading } = useSuggestions()

  const searching = query.trim().length >= 2

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-24 pt-4 lg:px-7 lg:pb-16 lg:pt-7">
      {/* Search */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint-2" strokeWidth={2} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari orang & topik"
          className="w-full rounded-[13px] border border-line-input bg-input py-3 pl-10 pr-4 text-[14px] text-ink outline-none placeholder:text-faint-2 focus:border-brand-500"
        />
      </div>

      {searching ? (
        <SearchResults users={searchResults?.data ?? []} query={query} />
      ) : (
        <>
          {/* Category chips */}
          <div className="mb-5 flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-hide">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`whitespace-nowrap rounded-full px-[18px] py-2.5 text-[14px] font-semibold transition ${
                  cat === c
                    ? 'bg-grad-brand text-white'
                    : 'border border-line-input bg-card text-muted-2 hover:text-ink'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Trending topics */}
          <h2 className="mb-3 text-[18px] font-extrabold tracking-[-0.3px]">
            Topik yang sedang tren
          </h2>
          <div className="mb-7 grid grid-cols-2 gap-3">
            {(trending ?? []).slice(0, 6).map((t, i) => (
              <Link
                key={t.id}
                to="/hashtag/$tag"
                params={{ tag: t.tag }}
                className="rounded-[16px] border border-line bg-card p-4 transition-colors hover:border-line-strong"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12.5px] text-muted">Tren</span>
                  <span className="text-[13px] font-extrabold text-faint-3">#{i + 1}</span>
                </div>
                <div className="my-1 text-[16px] font-bold text-[#f0f0f4]">#{t.tag}</div>
                <div className="text-[13px] text-muted">{fmt(t.postCount)} posts</div>
              </Link>
            ))}
          </div>

          {/* Rooms */}
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[18px] font-extrabold tracking-[-0.3px]">Ruang untuk kamu</h2>
            <Link to="/rooms" className="text-[13.5px] font-semibold text-violet-soft">
              Lihat semua
            </Link>
          </div>
          <div className="mb-7 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {(rooms ?? []).slice(0, 4).map((r) => (
              <Link
                key={r.id}
                to="/rooms/$id"
                params={{ id: r.id }}
                className="flex items-start gap-3 rounded-[16px] border border-line bg-card p-4 transition-colors hover:border-line-strong"
              >
                <div
                  className="flex h-[46px] w-[46px] shrink-0 items-center justify-center rounded-[14px] text-[15px] font-bold text-white"
                  style={{ backgroundImage: gradientFor(r.id) }}
                >
                  {initialsFor(r.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-bold text-[#f0f0f4]">{r.name}</div>
                  <div className="my-0.5 text-[12.5px] text-muted">{fmt(r.memberCount)} anggota</div>
                  {r.description && (
                    <div className="line-clamp-2 text-[13px] leading-snug text-muted-3">
                      {r.description}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* People to follow */}
          <h2 className="mb-3 text-[18px] font-extrabold tracking-[-0.3px]">Orang untuk diikuti</h2>
          <div className="overflow-hidden rounded-[18px] border border-line bg-card">
            {suggestionsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 border-b border-line-row p-[15px_18px]">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-1/3" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))
            ) : (suggestions ?? []).length === 0 ? (
              <p className="p-5 text-sm text-muted">Belum ada saran untuk saat ini.</p>
            ) : (
              (suggestions ?? []).slice(0, 5).map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3.5 border-b border-line-row p-[15px_18px] last:border-b-0"
                >
                  <Link to="/profile/$username" params={{ username: u.username }}>
                    <Avatar src={u.avatarUrl} alt={u.displayName} seed={u.username} className="h-12 w-12" />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      to="/profile/$username"
                      params={{ username: u.username }}
                      className="flex items-center gap-1.5"
                    >
                      <span className="text-[15px] font-bold">{u.displayName}</span>
                      {u.isVerified && <BadgeCheck className="h-4 w-4 fill-brand-500 text-card" />}
                      <span className="text-[13.5px] text-muted">@{u.username}</span>
                    </Link>
                    {u.bio && <div className="mt-0.5 line-clamp-1 text-[13.5px] text-muted-4">{u.bio}</div>}
                  </div>
                  <FollowButton user={u} variant="pill" />
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

function SearchResults({
  users,
  query,
}: {
  users: import('@/types/api').User[]
  query: string
}) {
  if (users.length === 0) {
    return (
      <div className="rounded-[18px] border border-line bg-card py-16 text-center text-muted">
        Tidak ada hasil untuk "{query}"
      </div>
    )
  }
  return (
    <div className="overflow-hidden rounded-[18px] border border-line bg-card">
      {users.map((u) => (
        <div
          key={u.id}
          className="flex items-center gap-3.5 border-b border-line-row p-[15px_18px] last:border-b-0"
        >
          <Link to="/profile/$username" params={{ username: u.username }}>
            <Avatar src={u.avatarUrl} alt={u.displayName} seed={u.username} className="h-12 w-12" />
          </Link>
          <div className="min-w-0 flex-1">
            <Link
              to="/profile/$username"
              params={{ username: u.username }}
              className="flex items-center gap-1.5"
            >
              <span className="text-[15px] font-bold">{u.displayName}</span>
              {u.isVerified && <BadgeCheck className="h-4 w-4 fill-brand-500 text-card" />}
              <span className="text-[13.5px] text-muted">@{u.username}</span>
            </Link>
            {u.bio && <div className="mt-0.5 line-clamp-1 text-[13.5px] text-muted-4">{u.bio}</div>}
          </div>
          <FollowButton user={u} variant="pill" />
        </div>
      ))}
    </div>
  )
}
