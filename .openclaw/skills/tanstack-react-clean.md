# tanstack-react-clean — Frontend Architecture Skill

## Tech Stack
- **Framework:** React 19+ with TypeScript 5.8+
- **Build:** Vite 6+
- **Router:** TanStack React Router v1 (file-based routing via `@tanstack/react-router` with `@tanstack/router-plugin`)
- **State Server:** TanStack Query v5 (`@tanstack/react-query`)
- **State Form:** TanStack Form (`@tanstack/react-form`)
- **State Table:** TanStack Table (for admin/data-heavy views)
- **State Client:** Zustand for UI-only state (theme, composer drafts)
- **Styling:** Tailwind CSS v4 + `tailwind-merge` + `clsx`
- **UI Primitives:** Radix UI (no component library, compose from primitives)
- **Types:** Generated from OpenAPI spec (shared contract with backend)
- **Testing:** Vitest + React Testing Library + MSW for API mocking

## Architecture — Feature-Based Clean

```
src/
  app/            → router config, root layout, global providers
  pages/          → page components (thin — delegate to features)
  features/       → feature modules (auth, post, thread, feed, etc.)
  components/     → shared UI components
  hooks/          → shared hooks (auth, post, util hooks)
  libs/           → API client, TanStack Query setups, utilities
  stores/         → Zustand stores (UI-only state)
  types/          → TypeScript types (API responses, domain, props)
  styles/         → global styles, Tailwind config
```

## Dependency Rule
- **Pages** are thin — they compose features and layouts
- **Features** own their logic, components, and hooks
- **Components/ui** are pure/presentational (no API calls, no business logic)
- **Hooks** encapsulate API + cache logic via TanStack Query
- **libs/api** is the single source for HTTP calls
- **Stores** hold UI-only transient state (never cache server state)
- Never import features from features — shared code goes up to hooks/libs/components

## TanStack Query Patterns

### Query Hook (data fetching)
```ts
// hooks/use-post.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { postsApi } from '@/libs/api/posts'

const postKeys = {
  all:   ['posts'] as const,
  list:  (filter: PostFilter) => [...postKeys.all, 'list', filter] as const,
  detail: (id: string) => [...postKeys.all, 'detail', id] as const,
}

export function usePostList(filter: PostFilter) {
  return useQuery({
    queryKey: postKeys.list(filter),
    queryFn: () => postsApi.list(filter),
    staleTime: 30_000, // 30s for feeds
  })
}

export function usePost(id: string) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postsApi.get(id),
    enabled: !!id,
  })
}
```

### Mutation Hook (data modification)
```ts
export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.all })
      // invalidate feed queries too
      queryClient.invalidateQueries({ queryKey: ['feed'] })
    },
  })
}
```

### Optimistic Update (for like/repost/bookmark)
```ts
export function useToggleLike() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: likesApi.toggle,
    onMutate: async ({ postId }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) })
      // Snapshot previous
      const prev = queryClient.getQueryData(postKeys.detail(postId))
      // Optimistic update
      queryClient.setQueryData(postKeys.detail(postId), (old) => ({
        ...old, liked: !old.liked, likeCount: old.liked ? old.likeCount - 1 : old.likeCount + 1
      }))
      return { prev }
    },
    onError: (_err, { postId }, context) => {
      queryClient.setQueryData(postKeys.detail(postId), context?.prev)
    },
    onSettled: (_, __, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) })
    },
  })
}
```

## React Router v1 Patterns

### File-based routing
```
app/routes/
  __root.tsx                → root layout with providers
  _layout.tsx               → authenticated layout (sidebar + shell)
  _layout.home.tsx          → home feed (index route)
  _layout.thread.$threadId.tsx  → thread detail
  _layout.profile.$username.tsx → user profile
  (auth).login.tsx          → login page (no layout)
  (auth).register.tsx       → register page (no layout)
```

### Route loader pattern (server data before render)
```ts
// app/routes/_layout.thread.$threadId.tsx
export const Route = createFileRoute('/_layout/thread/$threadId')({
  loader: ({ params, context: { queryClient } }) => {
    return queryClient.ensureQueryData({
      queryKey: postKeys.detail(params.threadId),
      queryFn: () => postsApi.get(params.threadId),
    })
  },
  component: ThreadPage,
})
```

### Router context with QueryClient
```tsx
// app/providers.tsx
export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 30_000, retry: 1 },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

## Component Patterns

### Feature component structure
```
features/post/
  editor/         → PostEditor, PostEditorToolbar, PostEditorPreview
  card/           → PostCard, PostHeader, PostBody, PostMedia, PostActions
  list/           → PostList (virtualized for large lists)
  index.ts        → barrel export
```

### Shared UI components
```tsx
// components/ui/avatar.tsx
import * as AvatarPrimitive from '@radix-ui/react-avatar'
import { cn } from '@/libs/utils/cn'

export function Avatar({ src, alt, size = 'md', className, ...props }: AvatarProps) {
  const sizes = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-12 w-12' }
  return (
    <AvatarPrimitive.Root className={cn('relative inline-flex shrink-0 overflow-hidden rounded-full', sizes[size], className)} {...props}>
      <AvatarPrimitive.Image src={src} alt={alt} className="aspect-square h-full w-full" />
      <AvatarPrimitive.Fallback className="flex h-full w-full items-center justify-center bg-muted">
        {alt?.[0]?.toUpperCase() ?? '?'}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  )
}
```

## API Client (libs/api/)

```ts
// libs/api/client.ts
import { ofetch } from 'ofetch'

export const api = ofetch.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  onRequest({ options }) {
    const token = useAuthStore.getState().accessToken
    if (token) options.headers = { ...options.headers, Authorization: `Bearer ${token}` }
  },
  onResponseError({ response }) {
    if (response.status === 401) {
      useAuthStore.getState().logout()
    }
  },
})
```

### Per-resource API modules
```ts
// libs/api/posts.ts
import type { Post, PostListParams, CreatePostRequest, PaginatedResponse } from '@/types/api'
import { api } from './client'

export const postsApi = {
  list:    (params: PostListParams) => api<PaginatedResponse<Post>>('/posts', { params }),
  get:     (id: string)            => api<Post>(`/posts/${id}`),
  create:  (data: CreatePostRequest) => api<Post>('/posts', { method: 'POST', body: data }),
  delete:  (id: string)            => api<void>(`/posts/${id}`, { method: 'DELETE' }),
}
```

## Zustand Stores (UI-only state)
```ts
// stores/composer.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ComposerState {
  draft: string
  isOpen: boolean
  replyTo: string | null
  setDraft: (d: string) => void
  open: (replyTo?: string) => void
  close: () => void
}

export const useComposerStore = create<ComposerState>()(
  persist(
    (set) => ({
      draft: '', isOpen: false, replyTo: null,
      setDraft: (draft) => set({ draft }),
      open: (replyTo) => set({ isOpen: true, replyTo: replyTo ?? null }),
      close: () => set({ isOpen: false, replyTo: null, draft: '' }),
    }),
    { name: 'composer' }
  )
)
```

## Rules of the Road

### DO
- Use `@tanstack/react-query` for ALL server state
- Use Zustand ONLY for UI state (never cache API data in Zustand)
- Place API calls in `libs/api/` — feature hooks call these
- Use optimistic updates for instant-feedback actions (like, bookmark)
- Use `React.lazy` + `Suspense` for route-level code splitting
- Use `ofetch` as HTTP client (lightweight, typed)
- All routes use `createFileRoute` from React Router plugin
- Tailwind with `cn()` utility for conditional classes

### DON'T
- Don't put API calls in components — extract to hooks
- Don't use `useEffect` for data fetching — use TanStack Query
- Don't share state between features directly — use props, URL params, or query keys
- Don't store form state in Zustand — use TanStack Form
- Don't import from `@/features` inside another feature
- Don't use `any` — generate types from OpenAPI

### File Naming
- kebab-case for files and folders: `use-post-card.ts`, `post-editor.tsx`
- CamelCase for components: `PostEditor`, `PostCard`
- camelCase for hooks: `usePost`, `useCreatePost`
- `index.ts` barrel files for clean imports from features
