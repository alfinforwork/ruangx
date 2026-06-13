# ruangx — Frontend

TanStack React SPA — Clean Architecture

## Quick Start

```bash
# prerequisites: Node.js 22+, pnpm

cp .env.example .env
# edit .env with VITE_API_URL

pnpm install
pnpm dev            # Vite dev server
```

## Stack

- **React 19+** / **TypeScript 5.8+**
- **TanStack React Router v1** — type-safe routing (file-based)
- **TanStack React Query v5** — server state & caching
- **TanStack React Form** — form state
- **Zustand** — UI-only local state
- **Tailwind CSS v4** + **Radix UI** — styling & primitives
- **ofetch** — HTTP client
- **Vitest** + **React Testing Library** + **MSW** — testing

## Architecture

```
src/
  app/            → router, root layout, providers
  pages/          → page components (thin — compose features)
  features/       → feature modules (auth, post, feed, etc.)
  components/     → shared UI (avatars, buttons, layouts)
  hooks/          → TanStack Query hooks, shared hooks
  libs/           → API client, query key factories, utilities
  stores/         → Zustand stores (theme, composer)
  types/          → TypeScript types (from OpenAPI spec)
  styles/         → Tailwind config, globals
```

## Dependency Rule

`pages → features → hooks → libs/api`
`components ← features` (features import shared UI)
`stores ← components` (Zustand used in hooks/components)

## Key Patterns

See [tanstack-react-clean skill](../.openclaw/skills/tanstack-react-clean.md) for:
- TanStack Query key factories & optimistic updates
- File-based routing patterns
- API client setup
- Zustand store conventions
- Component composition rules

## Commands

```bash
pnpm dev          # Vite dev server
pnpm build        # production build
pnpm preview      # preview production build
pnpm test         # vitest
pnpm lint         # biome lint
pnpm format       # biome format
pnpm typecheck    # tsc --noEmit
```
