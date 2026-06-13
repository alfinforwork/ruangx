import { createFileRoute } from '@tanstack/react-router'
import PostDetailRoute from '@/pages/post-detail'

export const Route = createFileRoute('/_layout/post/$id')({
  component: PostDetailRoute,
})