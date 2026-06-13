import { Link, useLocation } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { Avatar } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useLogout } from '@/hooks/auth/use-auth'
import { useComposerStore } from '@/stores/composer'
import {
  Home,
  Search,
  Bell,
  Mail,
  User as UserIcon,
  Hash,
  HashIcon,
  MessagesSquare,
  Settings,
  LogOut,
  Feather,
  MoreHorizontal,
} from 'lucide-react'

interface NavItemProps {
  href: string
  icon: React.ReactNode
  label: string
  badge?: number
  isActive: boolean
}

function NavItem({ href, icon, label, badge, isActive }: NavItemProps) {
  return (
    <Link
      to={href}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-base transition-colors ${
        isActive
          ? 'text-white font-semibold bg-surface-800'
          : 'text-gray-400 hover:text-white hover:bg-surface-800/60'
      }`}
    >
      <span className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>
      <span className="hidden lg:inline">{label}</span>
    </Link>
  )
}

export function LayoutSidebar({ user: _user }: { user?: import('@/types/api').User | null } = {}) {
  const authUser = useAuthStore((s) => s.user)
  const user = _user ?? authUser
  const location = useLocation()
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const openComposer = useComposerStore((s) => s.open)
  const logout = useLogout()

  const navItems = [
    { href: '/', icon: <Home className="h-5 w-5" />, label: 'Beranda' },
    { href: '/explore', icon: <Search className="h-5 w-5" />, label: 'Jelajahi' },
    { href: '/notifications', icon: <Bell className="h-5 w-5" />, label: 'Notifikasi', badge: unreadCount },
    { href: '/messages', icon: <Mail className="h-5 w-5" />, label: 'Pesan' },
    { href: '/rooms', icon: <MessagesSquare className="h-5 w-5" />, label: 'Ruang' },
    { href: '/settings', icon: <Settings className="h-5 w-5" />, label: 'Pengaturan' },
  ]

  const pathname = location.pathname

  return (
    <div className="flex h-full flex-col px-3 py-4">
      {/* Logo */}
      <div className="mb-6 flex items-center gap-2 px-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600">
          <span className="text-lg font-bold text-white">r</span>
        </div>
        <span className="hidden text-xl font-bold text-white lg:inline">
          ruangx
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavItem
            key={item.href}
            {...item}
            isActive={
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href)
            }
          />
        ))}
      </nav>

      {/* Post button */}
      <Button
        onClick={() => openComposer()}
        className="mb-4 w-full"
        size="lg"
      >
        <Feather className="h-5 w-5 lg:hidden" />
        <span className="hidden lg:inline">Kirim</span>
      </Button>

      {/* User menu */}
      {user && (
        <div className="rounded-xl p-2 hover:bg-surface-800 transition-colors">
          <Link to="/profile/$username" params={{ username: user.username }} className="flex items-center gap-3">
            <Avatar src={user.avatarUrl} alt={user.displayName} size="sm" />
            <div className="hidden min-w-0 flex-1 lg:block">
              <p className="truncate text-sm font-medium text-white">
                {user.displayName}
              </p>
              <p className="truncate text-xs text-gray-500">@{user.username}</p>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault()
                logout.mutate()
              }}
              className="hidden rounded-full p-1 text-gray-400 hover:text-white lg:block"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </Link>
        </div>
      )}
    </div>
  )
}