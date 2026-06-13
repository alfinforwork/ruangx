import { createFileRoute } from '@tanstack/react-router'
import MessageThreadRoute from '@/pages/message-thread'

export const Route = createFileRoute('/_layout/messages/$id')({
  component: MessageThreadRoute,
})