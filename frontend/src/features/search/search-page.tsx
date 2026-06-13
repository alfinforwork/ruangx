import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useSearchUsers } from '@/hooks/user/use-user'
import { PostCard } from '@/features/post/post-card'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from '@tanstack/react-router'
import { Search } from 'lucide-react'

export function SearchPage() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState('top')
  const { data: userResults, isLoading: isSearching } = useSearchUsers(query)

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-surface-800 bg-[#0f0f0f]/80 backdrop-blur-lg px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pengguna, kiriman, tagar..."
            className="w-full rounded-full bg-surface-800 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500/50"
            autoFocus
          />
        </div>
      </div>

      {query.length < 2 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <Search className="h-12 w-12 mb-3" />
          <p className="text-sm">Ketik untuk mencari</p>
        </div>
      ) : (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full rounded-none bg-transparent p-0 border-b border-surface-800">
            <TabsTrigger
              value="top"
              className="flex-1 rounded-none border-b-2 border-transparent py-3 data-[state=active]:border-brand-500 data-[state=active]:bg-transparent"
            >
              Teratas
            </TabsTrigger>
            <TabsTrigger
              value="latest"
              className="flex-1 rounded-none border-b-2 border-transparent py-3 data-[state=active]:border-brand-500 data-[state=active]:bg-transparent"
            >
              Terbaru
            </TabsTrigger>
            <TabsTrigger
              value="people"
              className="flex-1 rounded-none border-b-2 border-transparent py-3 data-[state=active]:border-brand-500 data-[state=active]:bg-transparent"
            >
              Orang
            </TabsTrigger>
          </TabsList>

          <TabsContent value="people">
            {isSearching ? (
              <div className="divide-y divide-surface-800">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="divide-y divide-surface-800">
                {userResults?.data.map((user) => (
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
                      <p className="text-xs text-gray-500">
                        @{user.username}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="top">
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <p className="text-sm">Hasil pencarian kiriman</p>
            </div>
          </TabsContent>

          <TabsContent value="latest">
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <p className="text-sm">Hasil pencarian terbaru</p>
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}