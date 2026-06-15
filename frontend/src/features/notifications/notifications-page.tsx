import { useNotifications, useMarkRead, useMarkAllRead } from '@/hooks/notification/use-notification'
import { useNotificationStore } from '@/stores/notification'
import { Avatar } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Link } from '@tanstack/react-router'
import { timeAgo } from '@/libs/utils/time'
import { Heart, Repeat2, MessageCircle, UserPlus, AtSign, CheckCheck } from 'lucide-react'
import type { Notification, NotificationType } from '@/types/api'

const meta: Record<NotificationType, { icon: React.ReactNode; color: string; text: string }> = {
  like: { icon: <Heart className="h-4 w-4" fill="currentColor" />, color: '#fb5a7e', text: 'menyukai thread kamu' },
  repost: { icon: <Repeat2 className="h-4 w-4" />, color: '#2ecf8f', text: 'me-repost thread kamu' },
  follow: { icon: <UserPlus className="h-4 w-4" />, color: '#8b5cf6', text: 'mulai mengikuti kamu' },
  reply: { icon: <MessageCircle className="h-4 w-4" fill="currentColor" />, color: '#3b82f6', text: 'membalas thread kamu' },
  mention: { icon: <AtSign className="h-4 w-4" />, color: '#f59e0b', text: 'menyebut kamu dalam thread' },
  quote: { icon: <MessageCircle className="h-4 w-4" />, color: '#3b82f6', text: 'mengutip thread kamu' },
}

function NotificationItem({ notification }: { notification: Notification }) {
  const markRead = useMarkRead()
  const m = meta[notification.type]

  return (
    <Link
      to={notification.postId ? ('/post/$id' as const) : '/profile/$username'}
      params={
        notification.postId
          ? { id: notification.postId }
          : { username: notification.actor.username }
      }
      onClick={() => !notification.read && markRead.mutate(notification.id)}
      className={`flex gap-3.5 border-b border-line-row p-[16px_18px] transition-colors hover:bg-white/[0.03] ${
        !notification.read ? 'bg-brand-500/[0.06]' : ''
      }`}
    >
      <div
        className="flex w-[34px] shrink-0 justify-center pt-1 leading-none"
        style={{ color: m.color }}
      >
        {m.icon}
      </div>
      <div className="min-w-0 flex-1">
        <Avatar
          src={notification.actor.avatarUrl}
          alt={notification.actor.displayName}
          seed={notification.actor.username}
          size="xs"
          className="mb-2 h-[38px] w-[38px]"
        />
        <div className="text-[14.5px] leading-relaxed text-ink-dim">
          <span className="font-bold text-ink-bright">{notification.actor.displayName}</span>{' '}
          {m.text} · <span className="text-muted">{timeAgo(notification.createdAt)}</span>
        </div>
        {notification.postContent && (
          <div className="mt-1.5 line-clamp-2 text-[14px] leading-relaxed text-muted-4">
            {notification.postContent}
          </div>
        )}
      </div>
    </Link>
  )
}

export function NotificationsPage() {
  const { data, isLoading } = useNotifications()
  const markAllRead = useMarkAllRead()
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const notifications = data?.pages.flatMap((p) => p.data) ?? []

  return (
    <div className="mx-auto w-full max-w-[640px] px-4 pb-24 pt-4 lg:px-7 lg:pb-16 lg:pt-7">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-[20px] font-extrabold tracking-[-0.3px]">Notifikasi</h1>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllRead.mutate()}
            className="flex items-center gap-1.5 text-[13.5px] font-semibold text-violet-soft hover:underline"
          >
            <CheckCheck className="h-4 w-4" />
            Tandai semua dibaca
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="overflow-hidden rounded-[18px] border border-line bg-card">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex gap-3.5 border-b border-line-row p-[16px_18px]">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-[18px] border border-line bg-card py-16 text-center text-muted">
          <p className="text-[15px] font-semibold text-ink">Belum ada notifikasi</p>
          <p className="mt-1 text-sm">Aktivitas tentang thread kamu akan muncul di sini.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-[18px] border border-line bg-card">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  )
}
