# go-fiber-clean — Backend Architecture Skill

## Tech Stack
- **Framework:** Go Fiber v3 (`github.com/gofiber/fiber/v3`)
- **Language:** Go 1.24+
- **Database:** PostgreSQL (via `pgx` or `bun` ORM)
- **Cache:** Redis
- **Auth:** JWT (access + refresh tokens)
- **Migration:** `golang-migrate`
- **Validation:** `go-playground/validator`
- **Test:** Go stdlib testing + `testify`
- **API Spec:** OpenAPI 3.1 (`swaggo` or `ogen`)

## Architecture — Clean (Uncle Bob)

```
cmd/api/           → entrypoint, wire everything
internal/
  domain/          → entities, value objects, repository interfaces
  usecase/         → application business logic, depends only on domain
  handler/         → HTTP handlers (Fiber handlers), thin layer
  repository/      → implementations of domain repos (postgres, redis)
  infrastructure/  → concrete infra: DB conn, cache, JWT, S3, broker
  middleware/       → Fiber middleware (auth, logging, ratelimit, cors)
  dto/             → request/response DTOs, mapping
pkg/               → shared utilities: validator, response helpers, errors
config/            → env/config loading
migrations/        → SQL migration files
```

## Dependency Rule
- **Domain** knows nothing about any other layer
- **Usecase** depends on domain interfaces only
- **Handler** depends on usecase interfaces
- **Repository** implements domain interfaces
- **Infrastructure** provides concrete implementations

## Code Pattern: New Feature

When creating a new feature (e.g., "Bookmark"):

1. **Domain entity** — `internal/domain/bookmark/bookmark.go`
```go
package bookmark

type Bookmark struct {
    ID        string    `json:"id"`
    UserID    string    `json:"user_id"`
    PostID    string    `json:"post_id"`
    CreatedAt time.Time `json:"created_at"`
}

type Repository interface {
    Create(ctx context.Context, b *Bookmark) error
    Delete(ctx context.Context, userID, postID string) error
    FindByUser(ctx context.Context, userID string, cursor string, limit int) ([]Bookmark, string, error)
    Exists(ctx context.Context, userID, postID string) (bool, error)
}
```

2. **Usecase** — `internal/usecase/bookmark/usecase.go`
```go
package bookmark

type UseCase struct {
    repo   domain.BookmarkRepository
    posts  domain.PostRepository
}

func (uc *UseCase) Toggle(ctx context.Context, userID, postID string) (*dto.BookmarkToggleResponse, error) {
    // business logic: check post exists, toggle bookmark, return state
}
```

3. **DTO** — `internal/dto/bookmark.go`
```go
type BookmarkToggleRequest struct {
    PostID string `json:"post_id" validate:"required,uuid"`
}

type BookmarkToggleResponse struct {
    Bookmarked bool `json:"bookmarked"`
}
```

4. **Handler** — `internal/handler/bookmark/handler.go`
```go
func (h *Handler) Toggle(c fiber.Ctx) error {
    userID := middleware.GetUserID(c)
    var req dto.BookmarkToggleRequest
    if err := c.BodyParser(&req); err != nil {
        return response.BadRequest(c, "invalid body")
    }
    res, err := h.uc.Toggle(c.Context(), userID, req.PostID)
    if err != nil {
        return response.HandleError(c, err)
    }
    return c.Status(fiber.StatusOK).JSON(res)
}
```

5. **Register route** in `cmd/api/main.go`

## Handler Rules
- NEVER put business logic in handlers
- Handlers: parse request → call usecase → return response
- Use `pkg/response` for consistent JSON responses
- Use `pkg/validator` for input validation
- Context propagation: always pass `c.Context()` not `context.Background()`

## Repository Rules
- Repos take `context.Context` as first argument
- Use `pgx` for raw SQL when complex queries needed
- Use `bun` ORM for simple CRUD
- Always use parameterized queries
- Return domain entities, not DB models

## Error Handling
```go
// pkg/errors/apperror.go
type AppError struct {
    Code    int    `json:"code"`
    Message string `json:"message"`
    Err     error  `json:"-"`
}

func (e *AppError) Error() string { return e.Message }

// Predefined errors
var (
    ErrNotFound     = &AppError{Code: 404, Message: "resource not found"}
    ErrUnauthorized = &AppError{Code: 401, Message: "unauthorized"}
    ErrForbidden    = &AppError{Code: 403, Message: "forbidden"}
    ErrConflict     = &AppError{Code: 409, Message: "conflict"}
    ErrValidation   = &AppError{Code: 422, Message: "validation failed"}
)
```

## Testing
- Unit tests at usecase level (mock domain repos)
- Integration tests at handler level (test Fiber app with real DB)
- Use `testify/mock` for repository mocks
- Test file alongside source: `usecase_test.go`

## Fiber v3 Specifics
- Use `fiber.Ctx` — it's a context.Context
- Middleware order: recovery → logging → cors → auth → handler
- Group routes: `api := app.Group("/api/v1")`
- Use `fiber.Storage` for Redis session store
- Body parser: `c.BodyParser(&req)` handles JSON automatically

## File Naming
- `*_test.go` for tests
- One file per type/structure, named after the primary type
- Lowercase, no underscores in package names
