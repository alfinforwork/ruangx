import { useState } from 'react'
import { useAuthStore } from '@/stores/auth'
import { useComposerStore } from '@/stores/composer'
import { PostList } from '@/features/post/post-list'
import { Avatar } from '@/components/ui/avatar'
import { timelineApi } from '@/libs/api/timeline'

const TABS = [
  { key: 'for_you', label: 'Untuk Anda' },
  { key: 'following', label: 'Mengikuti' },
] as const

export function FeedPage() {
  const [feedType, setFeedType] = useState<string>('for_you')
  const user = useAuthStore((s) => s.user)
  const openComposer = useComposerStore((s) => s.open)

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-24 pt-4 lg:px-7 lg:pb-16 lg:pt-[34px]">
      {/* Composer trigger */}
      <button
        onClick={() => openComposer()}
        className="mb-[18px] w-full cursor-pointer rounded-[18px] border border-line bg-card p-[18px_20px] text-left transition-colors hover:border-line-strong"
      >
        <div className="flex items-center gap-3.5">
          <Avatar
            src={user?.avatarUrl}
            alt={user?.displayName ?? ''}
            seed={user?.username}
            size="lg"
          />
          <div className="flex-1 text-[17px] text-faint">Apa yang ada di pikiranmu?</div>
          <span className="rounded-[11px] bg-grad-brand px-[22px] py-[9px] text-[14.5px] font-bold text-white">
            Posting
          </span>
        </div>
      </button>

      {/* Tabs */}
      <div className="mb-[18px] flex gap-[30px] border-b border-line-soft">
        {TABS.map((tab) => {
          const active = feedType === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setFeedType(tab.key)}
              className={`-mb-px border-b-[2.5px] pb-3.5 text-[15.5px] transition-colors ${
                active
                  ? 'border-brand-500 font-bold text-ink-bright'
                  : 'border-transparent font-semibold text-muted hover:text-ink'
              }`}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Feed */}
      <PostList
        queryKey={['feed', feedType]}
        queryFn={({ pageParam }) => timelineApi.get(feedType, pageParam)}
        emptyTitle={
          feedType === 'following' ? 'Belum ada thread' : 'Belum ada thread'
        }
        emptySubtitle={
          feedType === 'following'
            ? 'Ikuti orang lain untuk melihat thread mereka di sini'
            : 'Mulai dengan membuat thread pertamamu'
        }
      />
    </div>
  )
}
