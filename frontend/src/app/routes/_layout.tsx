import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@/stores/auth'
import { Outlet } from '@tanstack/react-router'
import { LayoutSidebar } from '@/features/layout/sidebar'
import { RightPanel } from '@/features/layout/right-panel'
import { MobileNav } from '@/features/layout/mobile-nav'

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
    <div className="mx-auto flex min-h-screen max-w-7xl">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-surface-800 md:block">
        <LayoutSidebar />
      </aside>
      <main className="flex-1 border-r border-surface-800 md:max-w-2xl">
        <Outlet />
      </main>
      <aside className="sticky top-0 hidden h-screen w-80 shrink-0 lg:block">
        <RightPanel />
      </aside>
      <MobileNav />
    </div>
  )
}