import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth'
import { Avatar } from '@/components/ui/avatar'
import { useComposerStore } from '@/stores/composer'
import { useNavItems, type NavItem } from '@/features/layout/nav'
import { useLogout } from '@/hooks/auth/use-auth'
import { BadgeCheck, MoreVertical, Plus, User, Settings, LogOut } from 'lucide-react'

export function NavButton({ item }: { item: NavItem }) {
  const Icon = item.icon
  return (
    <Link
      to={item.to}
      params={item.params as never}
      className={`flex w-full items-center gap-[14px] rounded-[13px] px-[14px] py-[13px] transition-colors ${
        item.active
          ? 'border border-brand-500/25 bg-gradient-to-br from-brand-500/[0.22] to-brand-600/[0.08] text-white'
          : 'border border-transparent text-muted-2 hover:bg-white/[0.045]'
      }`}
    >
      <span className="relative leading-none">
        <Icon
          className={`h-[22px] w-[22px] ${item.active ? 'text-violet-soft-2' : 'text-[#8a8a96]'}`}
          strokeWidth={1.9}
        />
      </span>
      <span className={`flex-1 text-[16px] ${item.active ? 'font-bold' : 'font-semibold'}`}>
        {item.label}
      </span>
      {item.badge !== undefined && item.badge > 0 && (
        <span className="flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-grad-brand px-1.5 text-xs font-bold text-white">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </Link>
  )
}

export function LayoutSidebar({
  user: _user,
}: { user?: import('@/types/api').User | null } = {}) {
  const authUser = useAuthStore((s) => s.user)
  const user = _user ?? authUser
  const openComposer = useComposerStore((s) => s.open)
  const navItems = useNavItems()
  const navigate = useNavigate()
  const logout = useLogout()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function onDown(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [menuOpen])

  return (
    <>
      {/* Logo */}
      <div className="flex items-center px-3 pb-[26px] text-[30px] font-extrabold tracking-[-1px]">
        ruang<span className="text-grad-brand">x</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-[5px]">
        {navItems.map((item) => (
          <NavButton key={item.key} item={item} />
        ))}
      </nav>

      {/* Compose CTA */}
      <button
        onClick={() => openComposer()}
        className="mt-[22px] flex items-center justify-center gap-[9px] rounded-[14px] bg-grad-brand p-[15px] text-[16px] font-bold text-white shadow-brand transition hover:brightness-110"
      >
        <Plus className="h-5 w-5" strokeWidth={2.2} />
        Buat Thread
      </button>

      <div className="flex-1" />

      {/* Profile footer with popup */}
      {user && (
        <div ref={menuRef} className="relative">
          {/* Popup menu */}
          {menuOpen && (
            <div
              className="absolute bottom-[calc(100%+10px)] left-0 right-0 z-[200] overflow-hidden rounded-2xl border border-[#28282f] bg-[#18181f] shadow-[0_12px_40px_rgba(0,0,0,0.7)]"
              style={{ animation: 'rxPop 0.15s ease' }}
            >
              <button
                onClick={() => { setMenuOpen(false); navigate({ to: '/profile/$username', params: { username: user.username } }) }}
                className="flex w-full items-center gap-3 px-4 py-[13px] text-left text-[14.5px] font-semibold text-ink hover:bg-white/[0.06]"
              >
                <User className="h-[17px] w-[17px] shrink-0" strokeWidth={1.9} />
                Lihat Profil
              </button>
              <div className="mx-[14px] h-px bg-[#22222c]" />
              <button
                onClick={() => { setMenuOpen(false); navigate({ to: '/settings' }) }}
                className="flex w-full items-center gap-3 px-4 py-[13px] text-left text-[14.5px] font-semibold text-ink hover:bg-white/[0.06]"
              >
                <Settings className="h-[17px] w-[17px] shrink-0" strokeWidth={1.9} />
                Pengaturan
              </button>
              <div className="mx-[14px] h-px bg-[#22222c]" />
              <button
                onClick={() => { setMenuOpen(false); logout.mutate() }}
                className="flex w-full items-center gap-3 px-4 py-[13px] text-left text-[14.5px] font-semibold text-[#fb5a7e] hover:bg-[rgba(251,90,126,0.07)]"
              >
                <LogOut className="h-[17px] w-[17px] shrink-0" strokeWidth={1.9} />
                Keluar
              </button>
            </div>
          )}

          {/* Profile button */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex w-full items-center gap-3 rounded-[14px] border border-transparent p-[10px_12px] transition-colors hover:border-line hover:bg-white/[0.045]"
          >
            <Avatar src={user.avatarUrl} alt={user.displayName} seed={user.username} size="md" />
            <div className="min-w-0 flex-1 text-left">
              <div className="flex items-center gap-1">
                <span className="truncate text-[15px] font-bold text-ink-bright">
                  {user.displayName}
                </span>
                {user.isVerified && (
                  <BadgeCheck className="h-[15px] w-[15px] shrink-0 fill-brand-500 text-bg" />
                )}
              </div>
              <div className="truncate text-[13px] text-muted">@{user.username}</div>
            </div>
            <MoreVertical className="h-[18px] w-[18px] shrink-0 text-faint-2" />
          </button>
        </div>
      )}
    </>
  )
}
