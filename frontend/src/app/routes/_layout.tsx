import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth'
import { Outlet } from '@tanstack/react-router'
import { LayoutSidebar } from '@/features/layout/sidebar'
import { RightPanel } from '@/features/layout/right-panel'
import { MobileNav, MobileTopBar } from '@/features/layout/mobile-nav'
import { ComposerModal } from '@/features/post/post-composer'

export const Route = createFileRoute('/_layout')({
  beforeLoad: () => {
    const { isAuthenticated, isHydrated } = useAuthStore.getState()
    if (isHydrated && !isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-[1540px] grid-cols-1 bg-bg text-ink lg:h-screen lg:grid-cols-[290px_minmax(0,1fr)_auto]">
      {/* Left sidebar (desktop) */}
      <aside className="hidden flex-col overflow-y-auto border-r border-line-soft px-[18px] pb-[18px] pt-[26px] lg:flex">
        <LayoutSidebar />
      </aside>

      {/* Mobile top bar */}
      <MobileTopBar />

      {/* Center column */}
      <main className="relative overflow-y-auto lg:border-x lg:border-line-soft">
        <Outlet />
      </main>

      {/* Right rail (desktop ≥1100px) */}
      <aside className="hidden w-[348px] overflow-y-auto border-l border-line-soft xl:block">
        <RightPanel />
      </aside>

      {/* Mobile bottom nav + drawer */}
      <MobileNav />

      {/* Global compose / reply modal */}
      <ComposerModal />
    </div>
  )
}
