import { Link, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notification'
import { useComposerStore } from '@/stores/composer'
import { useSidebarStore } from '@/stores/sidebar'
import { Avatar } from '@/components/ui/avatar'
import { NavButton } from '@/features/layout/sidebar'
import { useNavItems } from '@/features/layout/nav'
import {
  Home,
  Compass,
  Bell,
  User as UserIcon,
  Menu,
  X,
  Plus,
  Settings,
} from 'lucide-react'
import { useLocation } from '@tanstack/react-router'

export function MobileTopBar() {
  const openDrawer = useSidebarStore((s) => s.open)
  const user = useAuthStore((s) => s.user)
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-line-soft bg-bg/90 px-4 py-3.5 backdrop-blur-[14px] lg:hidden">
      <button
        onClick={openDrawer}
        className="-ml-1.5 p-1.5 leading-none text-ink"
        aria-label="Menu"
      >
        <Menu className="h-6 w-6" strokeWidth={2} />
      </button>
      <div className="text-[23px] font-extrabold tracking-[-1px]">
        ruang<span className="text-brand-500">x</span>
      </div>
      <div className="flex-1" />
      <Link
        to="/notifications"
        className="flex h-10 w-10 items-center justify-center rounded-[11px] border border-line-input bg-card text-[#c9c9d2]"
      >
        <Bell className="h-[19px] w-[19px]" strokeWidth={1.9} />
      </Link>
      {user && (
        <Link to="/profile/$username" params={{ username: user.username }}>
          <Avatar src={user.avatarUrl} alt={user.displayName} seed={user.username} size="xs" />
        </Link>
      )}
    </header>
  )
}

export function MobileNav() {
  const location = useLocation()
  const pathname = location.pathname
  const unread = useNotificationStore((s) => s.unreadCount)
  const openComposer = useComposerStore((s) => s.open)

  const items = [
    { to: '/', icon: Home, exact: true },
    { to: '/explore', icon: Compass, exact: false },
    { to: '/notifications', icon: Bell, badge: unread, exact: false },
    { to: '/profile', icon: UserIcon, exact: false, link: '/profile/$username' as const },
  ]
  const user = useAuthStore((s) => s.user)

  return (
    <>
      <MobileDrawer />

      {/* Bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-line-mid bg-[#0d0d12]/95 px-2 pb-[calc(10px+env(safe-area-inset-bottom))] pt-2.5 backdrop-blur-[16px] lg:hidden">
        {items.slice(0, 2).map((item) => (
          <TabIcon key={item.to} item={item} active={isActive(pathname, item)} />
        ))}

        {/* Center compose FAB */}
        <button
          onClick={() => openComposer()}
          className="flex h-[46px] w-[46px] items-center justify-center rounded-[14px] bg-grad-brand shadow-brand"
          aria-label="Buat Thread"
        >
          <Plus className="h-6 w-6 text-white" strokeWidth={2.4} />
        </button>

        {items.slice(2).map((item) => (
          <TabIcon
            key={item.to}
            item={item}
            active={isActive(pathname, item)}
            username={user?.username}
          />
        ))}
      </nav>
    </>
  )
}

function isActive(pathname: string, item: { to: string; exact?: boolean }) {
  return item.exact ? pathname === item.to : pathname.startsWith(item.to)
}

function TabIcon({
  item,
  active,
  username,
}: {
  item: {
    to: string
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
    badge?: number
    link?: '/profile/$username'
  }
  active: boolean
  username?: string
}) {
  const Icon = item.icon
  const to = item.link ?? item.to
  const params = item.link && username ? { username } : undefined
  return (
    <Link
      to={to as never}
      params={params as never}
      className="relative rounded-xl p-2 leading-none"
    >
      <Icon
        className={`h-[25px] w-[25px] ${active ? 'text-violet-soft' : 'text-muted'}`}
        strokeWidth={1.9}
      />
      {item.badge !== undefined && item.badge > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-grad-brand px-1 text-[10px] font-bold text-white">
          {item.badge > 9 ? '9+' : item.badge}
        </span>
      )}
    </Link>
  )
}

function MobileDrawer() {
  const isOpen = useSidebarStore((s) => s.isOpen)
  const close = useSidebarStore((s) => s.close)
  const openComposer = useComposerStore((s) => s.open)
  const navItems = useNavItems()
  const navigate = useNavigate()

  if (!isOpen) return null

  return (
    <div
      onClick={close}
      className="fixed inset-0 z-[90] animate-rx-fade bg-[#050509]/60 backdrop-blur-[3px] lg:hidden"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute inset-y-0 left-0 flex w-[280px] animate-rx-pop flex-col overflow-y-auto border-r border-line-mid bg-[#0d0d12] px-[18px] pb-[18px] pt-6"
      >
        <div className="flex items-center justify-between px-2 pb-[22px]">
          <div className="text-[28px] font-extrabold tracking-[-1px]">
            ruang<span className="text-brand-500">x</span>
          </div>
          <button onClick={close} className="p-1 leading-none text-muted">
            <X className="h-[22px] w-[22px]" strokeWidth={2} />
          </button>
        </div>

        <nav className="flex flex-col gap-[5px]" onClick={close}>
          {navItems.map((item) => (
            <NavButton key={item.key} item={item} />
          ))}
        </nav>

        <button
          onClick={() => {
            close()
            openComposer()
          }}
          className="mt-[18px] flex items-center justify-center gap-[9px] rounded-[14px] bg-grad-brand p-3.5 text-[15.5px] font-bold text-white"
        >
          <Plus className="h-5 w-5" strokeWidth={2.2} />
          Buat Thread
        </button>

        <div className="flex-1" />

        <button
          onClick={() => {
            close()
            navigate({ to: '/settings' })
          }}
          className="flex items-center gap-3 rounded-[14px] border border-line p-[11px_12px] text-left text-[#c9c9d2]"
        >
          <Settings className="h-5 w-5" strokeWidth={1.9} />
          <span className="text-[15px] font-semibold">Pengaturan</span>
        </button>
      </div>
    </div>
  )
}
