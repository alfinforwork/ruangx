import { createRouter } from '@tanstack/react-router'
import { routeTree } from '../routeTree.gen.ts'

export const router = createRouter({
  routeTree,
  context: {
    queryClient: undefined as any, // injected at runtime via provider
  },
  defaultPreload: 'intent',
  defaultStaleTime: 30_000,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
