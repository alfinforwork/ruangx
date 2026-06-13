import { createFileRoute } from '@tanstack/react-router'
import ExploreRoute from '@/pages/explore'

export const Route = createFileRoute('/_layout/explore')({
  component: ExploreRoute,
})