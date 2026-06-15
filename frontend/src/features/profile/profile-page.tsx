import { useState } from 'react'
import { useParams, useNavigate } from '@tanstack/react-router'
import { useUser, useUserPosts } from '@/hooks/user/use-user'
import { useAuthStore } from '@/stores/auth'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { PostCard } from '@/features/post/post-card'
import { FollowButton } from '@/features/profile/follow-button'
import { BadgeCheck, Calendar, MapPin, Link as LinkIcon } from 'lucide-react'
import { format } from 'date-fns'
import { id as idLocale } from 'date-fns/locale'
import type { User } from '@/types/api'

const COVER = 'linear-gradient(120deg,#3b2a6b,#5b3b9e 55%,#8b5cf6)'

const TABS = [
  { key: 'posts', label: 'Thread' },
  { key: 'replies', label: 'Balasan' },
  { key: 'media', label: 'Media' },
  { key: 'likes', label: 'Suka' },
] as const

function fmt(n: number) {
  if (n < 1000) return String(n)
  return `${(Math.round((n / 1000) * 10) / 10).toString().replace('.', ',')}K`
}

export function ProfilePage() {
  const { username } = useParams({ from: '/_layout/profile/$username' })
  const { data: user, isLoading } = useUser(username)
  const currentUser = useAuthStore((s) => s.user)
  const navigate = useNavigate()
  const isOwn = currentUser?.username === username

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-24 pt-4 lg:px-7 lg:pb-16 lg:pt-7">
      {isLoading || !user ? (
        <div className="space-y-4">
          <Skeleton className="h-[130px] w-full rounded-[20px]" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : (
        <>
          <ProfileHeader
            user={user}
            isOwn={isOwn}
            onEdit={() => navigate({ to: '/settings' })}
          />
          <ProfileTabs username={username} />
        </>
      )}
    </div>
  )
}

function ProfileHeader({
  user,
  isOwn,
  onEdit,
}: {
  user: User
  isOwn: boolean
  onEdit: () => void
}) {
  return (
    <div className="mb-[18px] overflow-hidden rounded-[20px] border border-line">
      <div className="h-[130px]" style={{ backgroundImage: user.bannerUrl ? undefined : COVER }}>
        {user.bannerUrl && <img src={user.bannerUrl} alt="" className="h-full w-full object-cover" />}
      </div>
      <div className="bg-card px-[22px] pb-5">
        <div className="-mt-10 flex items-end justify-between">
          <Avatar
            src={user.avatarUrl}
            alt={user.displayName}
            seed={user.username}
            size="2xl"
            className="border-4 border-card"
          />
          {isOwn ? (
            <button
              onClick={onEdit}
              className="rounded-xl border border-line-strong px-5 py-2.5 text-[14px] font-bold text-ink transition hover:bg-white/[0.05]"
            >
              Edit profil
            </button>
          ) : (
            <FollowButton user={user} />
          )}
        </div>

        <div className="mt-3.5 flex items-center gap-1.5">
          <span className="text-[22px] font-extrabold tracking-[-0.4px]">{user.displayName}</span>
          {user.isVerified && <BadgeCheck className="h-[19px] w-[19px] fill-brand-500 text-card" />}
        </div>
        <div className="text-[14.5px] text-muted">@{user.username}</div>

        {user.bio && (
          <div className="mt-3 max-w-[520px] whitespace-pre-wrap text-[14.5px] leading-relaxed text-ink-soft">
            {user.bio}
          </div>
        )}

        <div className="mt-3.5 flex flex-wrap items-center gap-4 text-[13.5px] text-muted-4">
          {user.location && (
            <span className="flex items-center gap-1.5">
              <MapPin className="h-[15px] w-[15px]" strokeWidth={2} />
              {user.location}
            </span>
          )}
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-violet-soft hover:underline"
            >
              <LinkIcon className="h-[15px] w-[15px]" strokeWidth={2} />
              {user.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          <span className="flex items-center gap-1.5">
            <Calendar className="h-[15px] w-[15px]" strokeWidth={2} />
            Bergabung {format(new Date(user.createdAt), 'MMMM yyyy', { locale: idLocale })}
          </span>
        </div>

        <div className="mt-4 flex gap-[22px] text-[14.5px] text-muted-4">
          <span>
            <strong className="text-[15.5px] text-ink-bright">{fmt(user.followingCount)}</strong>{' '}
            Mengikuti
          </span>
          <span>
            <strong className="text-[15.5px] text-ink-bright">{fmt(user.followerCount)}</strong>{' '}
            Pengikut
          </span>
          <span>
            <strong className="text-[15.5px] text-ink-bright">{fmt(user.postCount)}</strong> Thread
          </span>
        </div>
      </div>
    </div>
  )
}

function ProfileTabs({ username }: { username: string }) {
  const [tab, setTab] = useState<string>('posts')
  const { data, isLoading } = useUserPosts(username, tab)
  const posts = data?.pages.flatMap((p) => p.data) ?? []

  return (
    <>
      <div className="mb-4 flex overflow-hidden rounded-[16px] border border-line bg-card">
        {TABS.map((t) => {
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 border-b-[2.5px] py-4 text-[15px] transition ${
                active
                  ? 'border-brand-500 font-bold text-ink-bright'
                  : 'border-transparent font-semibold text-muted'
              }`}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-3.5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-[18px] border border-line bg-card p-5">
              <div className="flex gap-3">
                <Skeleton className="h-11 w-11 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-[18px] border border-line bg-card py-14 text-center text-muted">
          Belum ada {TABS.find((t) => t.key === tab)?.label.toLowerCase()}
        </div>
      ) : (
        <div className="flex flex-col gap-3.5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </>
  )
}
