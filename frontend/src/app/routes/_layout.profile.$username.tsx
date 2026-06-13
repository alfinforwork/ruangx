import { createFileRoute } from '@tanstack/react-router'
import ProfileRoute from '@/pages/profile'

export const Route = createFileRoute('/_layout/profile/$username')({
  component: ProfileRoute,
})