import { createFileRoute } from '@tanstack/react-router'
import HashtagRoute from '@/pages/hashtag'

export const Route = createFileRoute('/_layout/hashtag/$tag')({
  component: HashtagRoute,
})