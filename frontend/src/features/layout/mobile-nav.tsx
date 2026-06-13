import { Link, useLocation } from '@tanstack/react-router'
import { useNotificationStore } from '@/stores/notification'
import { useComposerStore } from '@/stores/composer'
import { Home, Search, Bell, Mail, Feather, User as UserIcon } from 'lucide-react'

export function MobileNav() {
  const location = useLocation()
  const unreadCount = useNotificationStore((s) => s.unreadCount)
  const openComposer = useComposerStore((s) => s.open)

  const pathname = location.pathname

  const items = [
    { href: '/', icon: Home, label: 'Beranda' },
    { href: '/explore', icon: Search, label: 'Cari' },
    { href: '/notifications', icon: Bell, label: 'Notif', badge: unreadCount },
    { href: '/messages', icon: Mail, label: 'Pesan' },
    { href: '/profile', icon: UserIcon, label: 'Profil' },
  ]

  return (
    <>
      {/* Floating post button */}
      <button
        onClick={() => openComposer()}
        className="fixed bottom-20 right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-colors hover:bg-brand-700 md:hidden"
      >
        <Feather className="h-6 w-6" />
      </button>

      {/* Bottom nav bar */}
      <nav className="fixed bottom-0 z-40 flex w-full items-center justify-around border-t border-surface-800 bg-surface-950/95 backdrop-blur-lg md:hidden">
        {items.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              to={item.href}
              className="relative flex flex-col items-center gap-0.5 px-3 py-2"
            >
              <span className="relative">
                <Icon
                  className={`h-5 w-5 ${
                    isActive ? 'text-brand-500' : 'text-gray-500'
                  }`}
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -right-2 -top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </span>
              <span
                className={`text-[10px] ${
                  isActive ? 'text-brand-500 font-medium' : 'text-gray-500'
                }`}
              >
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </>
  )
}