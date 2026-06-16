# ruangx — Claude Project Config

## Project Overview

ruangx is a social media platform built around threads — a Twitter/X-style app with threading and real-time interactions. Two codebases in one repo:

- **backend/** — Go Fiber v3 REST API with clean architecture
- **frontend/** — TanStack React (React Router + React Query) SPA with clean architecture

## Monorepo Rules

- Both codebases are independent builds, deployed separately.
- Shared contracts live in API types; no shared code between frontend/backend.
- OpenAPI spec is the source of truth for API contracts.
- Use `task` or `make` for all common operations — never raw scripts.

## Architecture Skills

**Before writing code**, read the matching skill file in `.openclaw/skills/`:

| What you're touching | Skill file |
|----------------------|------------|
| Backend Go code, new endpoints, domain logic, migrations, tests | `.claude/skills/go-fiber-clean.md` |
| Frontend React code, pages, features, hooks, components | `.claude/skills/tanstack-react-clean.md` |
| API contract changes, DTO design, OpenAPI spec | `.claude/skills/api-design.md` |
| Schema changes, migrations, seed data | `.claude/skills/db-migrations.md` |

Never mix architecture patterns between the two codebases.

## Backend Rules (Go Fiber v3 + Clean Architecture)

Layer order: `domain → usecase → handler → repository`. Each layer only depends inward.

- **Domain** (`internal/domain/`) — entities + repository interfaces, no external deps
- **Usecase** (`internal/usecase/`) — business logic, depends only on domain interfaces
- **Handler** (`internal/handler/`) — thin HTTP layer: parse → call usecase → return response
- **Repository** (`internal/repository/`) — implements domain interfaces against Postgres/Redis
- **DTO** (`internal/dto/`) — request/response shapes, never bleed domain types to HTTP

Never put business logic in handlers. Always pass `c.Context()` (not `context.Background()`). Use `pkg/response` for all JSON responses. Use parameterized queries always.

## Frontend Rules (TanStack React + Feature-Based Clean)

- **Pages** are thin — compose features, no logic
- **Features** own their logic, components, and hooks
- **hooks/** encapsulate TanStack Query calls — no API calls in components
- **libs/api/** is the single source for HTTP calls
- **Stores** (Zustand) hold UI-only transient state — never cache server state here

Use TanStack Query for ALL server state. Use optimistic updates for likes/bookmarks/reposts. Never use `useEffect` for data fetching.

## API Conventions

- Cursor-based pagination (not offset), default limit 20
- Response envelope: `{ "data": ..., "meta": { "cursor": ..., "has_more": ... } }`
- Error envelope: `{ "error": { "code": ..., "message": ... } }`
- snake_case JSON field names
- JWT Bearer token, access 15 min, refresh 7 days

## Database Rules

- Always use `TIMESTAMPTZ` for timestamps
- UUIDs via `gen_random_uuid()`, no auto-increment
- Foreign keys with `ON DELETE CASCADE` for user-owned data
- Always add indexes for query patterns
- Always provide `.down.sql` for every `.up.sql`

## Dependency Rules

- Never add a dependency that isn't directly imported in source code.
- Remove unused dependencies immediately — don't leave them "for later".
- Backend: run `go mod tidy` after adding/removing packages.
- Frontend: use `pnpm remove` to uninstall; never leave packages in `package.json` that have no `import` in `src/`.
