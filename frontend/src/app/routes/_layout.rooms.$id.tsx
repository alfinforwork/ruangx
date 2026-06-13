import { createFileRoute } from '@tanstack/react-router'
import RoomDetailRoute from '@/pages/room-detail'

export const Route = createFileRoute('/_layout/rooms/$id')({
  component: RoomDetailRoute,
})