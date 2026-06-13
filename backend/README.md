# ruangx — Backend

Go Fiber v3 REST API — Clean Architecture

## Quick Start

```bash
# prerequisites: Go 1.24+, PostgreSQL 16+, Redis 7+

cp config/.env.example config/.env
# edit config/.env with your DB/Redis URLs

make migrate-up
make dev        # starts with air (hot reload)
```

## Stack

- **Go 1.24+** / **Fiber v3** — HTTP framework
- **PostgreSQL 16+** — primary database
- **Redis 7+** — caching, rate limiting, session
- **JWT** — auth tokens (access + refresh)
- **S3-compatible** — media storage (MinIO local, any S3 in prod)

## Architecture

```
cmd/api/              → main.go, DI wiring, server start
internal/
  domain/             → entities + repository interfaces (zero deps)
  usecase/            → business logic (depends on domain)
  handler/            → HTTP handlers (depends on usecase)
  repository/         → postgres + redis impl of domain repos
  infrastructure/     → DB pool, cache client, JWT, S3, broker
  middleware/         → auth, ratelimit, cors, logging
  dto/                → request/response shapes
pkg/                  → validator, response helpers, error types
config/               → env loader (caarlos0/env)
migrations/           → golang-migrate SQL files
docs/                 → OpenAPI 3.1 spec
test/                 → integration tests
```

## Dependency Rule

`domain ← usecase ← handler → dto`
`domain → repository ← infrastructure`

## API Convention

See [api-design skill](../.openclaw/skills/api-design.md) for full spec.

## Commands

```bash
make dev            # air (hot reload)
make build          # build binary
make test           # go test ./...
make lint           # golangci-lint
make migrate-up     # apply migrations
make migrate-down   # rollback
make migrate-new    # create migration pair
make openapi        # generate OpenAPI spec
```
