import { useState } from 'react'
import { useSearchUsers } from '@/hooks/user/use-user'
import { Input } from '@/components/ui/input'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'
import { Search, TrendingUp, Hash } from 'lucide-react'
import { useTrendingHashtags } from '@/hooks/hashtag/use-hashtag'

export function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data: searchResults, isLoading: searchLoading } = useSearchUsers(searchQuery)
  const { data: trending } = useTrendingHashtags()

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-surface-800 bg-[#0f0f0f]/80 backdrop-blur-lg px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari di ruangx"
            className="w-full rounded-full bg-surface-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
          />
        </div>
      </div>

      {/* Search results */}
      {searchQuery.length >= 2 && searchResults && (
        <div className="divide-y divide-surface-800">
          {searchResults.data.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <p className="text-sm">Tidak ada hasil untuk "{searchQuery}"</p>
            </div>
          ) : (
            searchResults.data.map((user) => (
              <Link
                key={user.id}
                to="/profile/$username" params={{ username: user.username }}
                className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-800/50"
              >
                <Avatar
                  src={user.avatarUrl}
                  alt={user.displayName}
                  size="md"
                />
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-white text-sm">
                      {user.displayName}
                    </span>
                    {user.isVerified && (
                      <Badge variant="brand" className="h-4 px-1 text-[10px]">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                  {user.bio && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">
                      {user.bio}
                    </p>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {/* Trending section (shown when no search) */}
      {searchQuery.length < 2 && (
        <div className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-brand-500" />
            <h2 className="text-sm font-semibold text-white">
              Trending Topik
            </h2>
          </div>
          <div className="space-y-2">
            {trending?.map((tag) => (
              <Link
                key={tag.id}
                to="/hashtag/$tag" params={{ tag: tag.tag }}
                className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-surface-800"
              >
                <Hash className="h-5 w-5 text-brand-500" />
                <div>
                  <p className="text-sm font-medium text-white">#{tag.tag}</p>
                  <p className="text-xs text-gray-500">
                    {tag.postCount.toLocaleString('id-ID')} kiriman
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}