# api-design — API Contract Design Skill

## When to Use
- Designing new endpoints
- Changing request/response shapes
- Updating the OpenAPI spec
- Cross-team handoff between backend and frontend

## REST API Design Conventions

### URL Structure
```
GET    /api/v1/posts                 → list posts (cursor pagination)
GET    /api/v1/posts/:id             → get single post
POST   /api/v1/posts                 → create post
DELETE /api/v1/posts/:id             → delete post

GET    /api/v1/posts/:id/replies     → list replies on a post
POST   /api/v1/posts/:id/replies     → create reply

POST   /api/v1/posts/:id/like        → like post
DELETE /api/v1/posts/:id/like        → unlike post

POST   /api/v1/posts/:id/repost      → repost
DELETE /api/v1/posts/:id/repost      → unrepost

POST   /api/v1/posts/:id/bookmark    → bookmark
DELETE /api/v1/posts/:id/bookmark    → unbookmark

GET    /api/v1/users/:username       → get user profile
GET    /api/v1/users/:username/posts → user's posts
GET    /api/v1/users/:username/likes → user's liked posts

POST   /api/v1/users/:username/follow  → follow user
DELETE /api/v1/users/:username/follow  → unfollow

GET    /api/v1/feed/for-you          → personalized feed
GET    /api/v1/feed/following        → following-only feed

GET    /api/v1/notifications         → list notifications

GET    /api/v1/trends                → trending hashtags

POST   /api/v1/upload                → upload media

POST   /api/v1/auth/register         → register
POST   /api/v1/auth/login            → login
POST   /api/v1/auth/refresh          → refresh token
POST   /api/v1/auth/logout           → logout
```

### Response Envelope
```json
{
  "data": { ... },
  "meta": {
    "cursor": "next_page_token",
    "has_more": true
  }
}
```

Error response:
```json
{
  "error": {
    "code": 404,
    "message": "post not found"
  }
}
```

### Pagination
- Use cursor-based pagination (not offset)
- Cursor is the created_at or ID of the last item
- Return `has_more` boolean + `next_cursor` string
- Default limit: 20

### Naming Conventions
- Snake_case in JSON (match database convention, Go convention)
- Plural resource names
- Use verbs for actions: `like`, `repost`, `bookmark`, `follow`
- Sub-resources nested under parents

### Auth
- JWT Bearer token in `Authorization` header
- Access token: 15 min expiry
- Refresh token: 7 days expiry, httpOnly cookie preferred or stored securely
- Register/login returns both tokens

### Validation
- Posts: max 500 characters + optional media (max 4 images)
- Replies: max 500 characters + optional media
- Bio: max 160 characters
- Display name: 1-50 characters
- Username: 3-30 characters, alphanumeric + underscore
