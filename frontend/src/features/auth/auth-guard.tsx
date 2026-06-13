import { useAuthStore } from '@/stores/auth'
import { Navigate } from '@tanstack/react-router'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)

  if (!isHydrated) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }

  return <>{children}</>
}

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const isHydrated = useAuthStore((s) => s.isHydrated)

  if (!isHydrated) return null

  if (isAuthenticated) {
    return <Navigate to="/" />
  }

  return <>{children}</>
}