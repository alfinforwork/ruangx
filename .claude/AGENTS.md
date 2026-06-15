# ruangx — AGENTS.md

## Project Overview
ruangx is a social media platform built around threads — a Twitter/X-style app with threading and real-time interactions. Two codebases in one repo:

- **backend/** — Go Fiber v3 REST API with clean architecture
- **frontend/** — TanStack React (React Router + React Query) SPA with clean architecture

## Monorepo Rules
- Both codebases are independent builds, deployed separately.
- Shared contracts live in API types; no shared code between frontend/backend.
- OpenAPI spec is the source of truth for API contracts.
- Use `task` or `make` for all common operations — never raw scripts.

## Active Skills
Apply these skills based on what you're working on:

| Skill | When to use |
|-------|-------------|
| `go-fiber-clean` | Backend Go code, new endpoints, domain logic, migrations, tests |
| `tanstack-react-clean` | Frontend React code, pages, features, hooks, components |
| `api-design` | API contract changes, DTO design, OpenAPI spec |
| `db-migrations` | Schema changes, migrations, seed data |

Read skill file before coding. Don't mix architecture patterns between the two.
