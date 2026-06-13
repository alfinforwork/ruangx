import { useParams, Link } from '@tanstack/react-router'
import { useUser, useUserPosts } from '@/hooks/user/use-user'
import { useAuthStore } from '@/stores/auth'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { PostCard } from '@/features/post/post-card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useFollow, useUnfollow } from '@/hooks/follow/use-follow'
import {
  Calendar,
  Link as LinkIcon,
  MapPin,
  ChevronLeft,
} from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export function ProfilePage() {
  const { username } = useParams({ from: '/_layout/profile/$username' })
  const { data: user, isLoading } = useUser(username)
  const currentUser = useAuthStore((s) => s.user)
  const follow = useFollow()
  const unfollow = useUnfollow()
  const navigate = useNavigate()

  const isOwnProfile = currentUser?.username === username

  const handleFollow = () => {
    if (!user) return
    if (user.isFollowing) {
      unfollow.mutate(user.id)
    } else {
      follow.mutate(user.id)
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-16 w-16 rounded-full -mt-8 ml-4" />
        <div className="space-y-2 px-4">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-500">
        <p className="text-lg">Pengguna tidak ditemukan</p>
        <Button variant="ghost" onClick={() => navigate({ to: '/' })} className="mt-4">
          Kembali ke Beranda
        </Button>
      </div>
    )
  }

  return (
    <div>
      {/* Back button */}
      <div className="sticky top-0 z-10 border-b border-surface-800 bg-[#0f0f0f]/80 backdrop-blur-lg">
        <div className="flex items-center gap-4 px-4 py-3">
          <button
            onClick={() => navigate({ to: '/' })}
            className="rounded-full p-1 text-white hover:bg-surface-800 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white">
              {user.displayName}
            </h1>
            <p className="text-xs text-gray-500">
              {user.postCount} kiriman
            </p>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="h-32 bg-surface-800">
        {user.bannerUrl && (
          <img
            src={user.bannerUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
      </div>

      {/* Profile info */}
      <div className="px-4 pb-3">
        <div className="flex items-end justify-between -mt-8 mb-3">
          <Avatar
            src={user.avatarUrl}
            alt={user.displayName}
            size="xl"
            className="border-4 border-[#0f0f0f]"
          />
          {!isOwnProfile && (
            <Button
              variant={user.isFollowing ? 'secondary' : 'primary'}
              size="sm"
              onClick={handleFollow}
              loading={follow.isPending || unfollow.isPending}
            >
              {user.isFollowing ? 'Mengikuti' : 'Ikuti'}
            </Button>
          )}
        </div>

        <h1 className="flex items-center gap-2 text-xl font-bold text-white">
          {user.displayName}
          {user.isVerified && (
            <Badge variant="brand" className="h-5 px-1 text-xs">
              ✓
            </Badge>
          )}
        </h1>
        <p className="text-sm text-gray-500">@{user.username}</p>

        {user.bio && (
          <p className="mt-2 text-sm text-gray-300 whitespace-pre-wrap">
            {user.bio}
          </p>
        )}

        <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500">
          {user.location && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {user.location}
            </span>
          )}
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-brand-400 hover:underline"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              {user.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Bergabung{' '}
            {format(new Date(user.createdAt), 'MMMM yyyy', { locale: id })}
          </span>
        </div>

        <div className="mt-3 flex gap-4 text-sm">
          <span className="text-gray-500">
            <span className="font-semibold text-white">
              {user.followingCount}
            </span>{' '}
            Mengikuti
          </span>
          <span className="text-gray-500">
            <span className="font-semibold text-white">
              {user.followerCount}
            </span>{' '}
            Pengikut
          </span>
        </div>
      </div>

      {/* Tabs */}
      <ProfileTabs username={username} />
    </div>
  )
}

function ProfileTabs({ username }: { username: string }) {
  const { data: posts, isLoading: postsLoading } = useUserPosts(username, 'posts')

  return (
    <div className="border-t border-surface-800">
      <Tabs defaultValue="posts">
        <TabsList className="w-full rounded-none bg-transparent p-0">
          {['posts', 'replies', 'likes', 'media'].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="flex-1 rounded-none border-b-2 border-transparent py-3 data-[state=active]:border-brand-500 data-[state=active]:bg-transparent"
            >
              {tab === 'posts'
                ? 'Kiriman'
                : tab === 'replies'
                  ? 'Balasan'
                  : tab === 'likes'
                    ? 'Suka'
                    : 'Media'}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="posts">
          {postsLoading ? (
            <div className="divide-y divide-surface-800">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-4 py-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="divide-y divide-surface-800">
              {posts?.pages
                .flatMap((p) => p.data)
                .map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="replies">
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <p className="text-sm">Belum ada balasan</p>
          </div>
        </TabsContent>

        <TabsContent value="likes">
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <p className="text-sm">Belum ada suka</p>
          </div>
        </TabsContent>

        <TabsContent value="media">
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <p className="text-sm">Belum ada media</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}