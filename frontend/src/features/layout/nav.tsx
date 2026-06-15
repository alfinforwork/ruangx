import { useLocation } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import {
  Home,
  Compass,
  Bell,
  Mail,
  Bookmark,
  Users,
  User as UserIcon,
} from 'lucide-react'

export interface NavItem {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  to: string
  params?: Record<string, string>
  badge?: number
  active: boolean
}

/** Shared primary navigation used by the sidebar and the mobile drawer. */
export function useNavItems(): NavItem[] {
  const location = useLocation()
  const pathname = location.pathname
  const username = useAuthStore((s) => s.user?.username)
  const unread = useNotificationStore((s) => s.unreadCount)

  const isActive = (to: string) =>
    to === '/' ? pathname === '/' : pathname.startsWith(to)

  return [
    { key: 'beranda', label: 'Beranda', icon: Home, to: '/', active: isActive('/') },
    { key: 'jelajahi', label: 'Jelajahi', icon: Compass, to: '/explore', active: isActive('/explore') },
    {
      key: 'notifikasi',
      label: 'Notifikasi',
      icon: Bell,
      to: '/notifications',
      badge: unread,
      active: isActive('/notifications'),
    },
    { key: 'pesan', label: 'Pesan', icon: Mail, to: '/messages', active: isActive('/messages') },
    { key: 'bookmark', label: 'Bookmark', icon: Bookmark, to: '/bookmarks', active: isActive('/bookmarks') },
    { key: 'ruang', label: 'Ruang', icon: Users, to: '/rooms', active: isActive('/rooms') },
    {
      key: 'profil',
      label: 'Profil',
      icon: UserIcon,
      to: '/profile/$username',
      params: username ? { username } : undefined,
      active: pathname.startsWith('/profile'),
    },
  ]
}
