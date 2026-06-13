import { useNotifications, useMarkRead, useMarkAllRead } from '@/hooks/notification/use-notification'
import { useNotificationStore } from '@/stores/notification'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { Link } from '@tanstack/react-router'
import { Heart, Repeat2, MessageCircle, UserPlus, AtSign, CheckCheck } from 'lucide-react'
import type { Notification, NotificationType } from '@/types/api'

const iconMap: Record<NotificationType, React.ReactNode> = {
  like: <Heart className="h-4 w-4 text-red-400" />,
  repost: <Repeat2 className="h-4 w-4 text-green-400" />,
  follow: <UserPlus className="h-4 w-4 text-brand-400" />,
  reply: <MessageCircle className="h-4 w-4 text-brand-400" />,
  mention: <AtSign className="h-4 w-4 text-yellow-400" />,
  quote: <MessageCircle className="h-4 w-4 text-brand-400" />,
}

const textMap: Record<NotificationType, string> = {
  like: 'menyukai kiriman Anda',
  repost: 'membagikan ulang kiriman Anda',
  follow: 'mulai mengikuti Anda',
  reply: 'membalas kiriman Anda',
  mention: 'menyebut Anda dalam kiriman',
  quote: 'mengutip kiriman Anda',
}

function NotificationItem({ notification }: { notification: Notification }) {
  const markRead = useMarkRead()

  const handleClick = () => {
    if (!notification.read) {
      markRead.mutate(notification.id)
    }
  }

  return (
    <Link
      to={notification.postId ? ('/post/$id' as const) : '/profile/$username'} params={notification.postId ? { id: notification.postId } : { username: notification.actor.username }}
      onClick={handleClick}
      className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-800/50 ${
        !notification.read ? 'bg-brand-600/5 border-l-2 border-brand-500' : ''
      }`}
    >
      <div className="relative shrink-0">
        <Avatar
          src={notification.actor.avatarUrl}
          alt={notification.actor.displayName}
          size="sm"
        />
        <span className="absolute -bottom-1 -right-1 rounded-full bg-surface-900 p-0.5">
          {iconMap[notification.type]}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-200">
          <span className="font-semibold text-white">
            {notification.actor.displayName}
          </span>{' '}
          {textMap[notification.type]}
        </p>
        {notification.postContent && (
          <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
            {notification.postContent}
          </p>
        )}
        <p className="mt-0.5 text-xs text-gray-500">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: id,
          })}
        </p>
      </div>
    </Link>
  )
}

export function NotificationsPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useNotifications()
  const markAllRead = useMarkAllRead()
  const unreadCount = useNotificationStore((s) => s.unreadCount)

  const notifications = data?.pages.flatMap((p) => p.data) ?? []

  if (isLoading) {
    return (
      <div className="divide-y divide-surface-800">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-3 px-4 py-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-surface-800 bg-[#0f0f0f]/80 backdrop-blur-lg px-4 py-3">
        <h1 className="text-lg font-bold text-white">Notifikasi</h1>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => markAllRead.mutate()}
            loading={markAllRead.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Tandai semua dibaca
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <p className="text-sm">Belum ada notifikasi</p>
        </div>
      ) : (
        <div className="divide-y divide-surface-800">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  )
}