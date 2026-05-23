'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuthStore } from '@/presentation/store'
import { Button } from '@/components/ui/button'

const navItems = [
  { href: '/home', label: 'Home', icon: '🏠' },
  { href: '/short', label: 'Shorts', icon: '📱' },
  { href: '/notification', label: 'Notifications', icon: '🔔' },
  { href: '/message', label: 'Messages', icon: '💬' },
]

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { user, logout } = useAuthStore()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r p-4 hidden md:flex flex-col gap-2">
        <h1 className="text-2xl font-bold mb-6">RuangX</h1>
        {navItems.map(item => (
          <Link key={item.href} href={item.href}
            className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors ${pathname === item.href ? 'bg-muted font-semibold' : ''}`}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        {user && (
          <Link href="/profile"
            className={`flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors mt-auto ${pathname === '/profile' ? 'bg-muted font-semibold' : ''}`}>
            <span>👤</span>
            <span>Profile</span>
          </Link>
        )}
        {user && <Button variant="outline" onClick={logout} className="mt-2">Logout</Button>}
      </aside>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-background border-t flex justify-around p-2 z-50">
        {navItems.concat(user ? { href: '/profile', label: 'Profile', icon: '👤' } : []).map(item => (
          <Link key={item.href} href={item.href} className={`flex flex-col items-center text-xs p-2 ${pathname === item.href ? 'text-primary' : ''}`}>
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Main content */}
      <main className="flex-1 p-4 max-w-2xl mx-auto w-full pb-20 md:pb-4">
        {children}
      </main>
    </div>
  )
}