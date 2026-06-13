import { createFileRoute } from '@tanstack/react-router'
import RegisterPage from '@/pages/register'
import { GuestGuard } from '@/features/auth/auth-guard'

export const Route = createFileRoute('/(auth)/register')({
  component: RegisterRoute,
})

function RegisterRoute() {
  return (
    <GuestGuard>
      <RegisterPage />
    </GuestGuard>
  )
}