import { createFileRoute } from '@tanstack/react-router'
import BookmarksRoute from '@/pages/bookmarks'

export const Route = createFileRoute('/_layout/bookmarks')({
  component: BookmarksRoute,
})
