import { createFileRoute } from '@tanstack/react-router'
import NotificationsRoute from '@/pages/notifications'

export const Route = createFileRoute('/_layout/notifications')({
  component: NotificationsRoute,
})