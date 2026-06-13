import { createFileRoute } from '@tanstack/react-router'
import SettingsRoute from '@/pages/settings'

export const Route = createFileRoute('/_layout/settings')({
  component: SettingsRoute,
})