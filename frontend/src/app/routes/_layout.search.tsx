import { createFileRoute } from '@tanstack/react-router'
import SearchRoute from '@/pages/search'

export const Route = createFileRoute('/_layout/search')({
  component: SearchRoute,
})