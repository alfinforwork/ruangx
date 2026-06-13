import { createFileRoute } from '@tanstack/react-router'
import LoginPage from '@/pages/login'
import { GuestGuard } from '@/features/auth/auth-guard'

export const Route = createFileRoute('/(auth)/login')({
  component: LoginRoute,
})

function LoginRoute() {
  return (
    <GuestGuard>
      <LoginPage />
    </GuestGuard>
  )
}