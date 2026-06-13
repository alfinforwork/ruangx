import { createFileRoute } from '@tanstack/react-router'
import RoomsRoute from '@/pages/rooms'

export const Route = createFileRoute('/_layout/rooms')({
  component: RoomsRoute,
})