import { createFileRoute } from '@tanstack/react-router'
import MessagesRoute from '@/pages/messages'

export const Route = createFileRoute('/_layout/messages')({
  component: MessagesRoute,
})