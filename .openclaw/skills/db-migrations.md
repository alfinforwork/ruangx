# db-migrations — Database Schema & Migration Skill

## When to Use
- Creating new tables
- Altering existing schema
- Adding indexes
- Writing seed data
- Schema review before code

## Migration Tool: golang-migrate

Use `golang-migrate/migrate` for versioned SQL migrations.

```
migrations/
  000001_create_users.up.sql
  000001_create_users.down.sql
  000002_create_posts.up.sql
  000002_create_posts.down.sql
  ...
```

## Core Schema

### Users
```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username    VARCHAR(30) UNIQUE NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL,         -- bcrypt hash
    display_name VARCHAR(50) NOT NULL,
    bio         VARCHAR(160) DEFAULT '',
    avatar_url  TEXT,
    banner_url  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_created ON users(created_at DESC);
```

### Posts
```sql
CREATE TABLE posts (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    thread_id   UUID REFERENCES posts(id) ON DELETE CASCADE, -- null = root post
    body        TEXT NOT NULL CHECK (char_length(body) <= 500),
    parent_id   UUID REFERENCES posts(id) ON DELETE CASCADE, -- null = top-level reply
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_posts_user ON posts(user_id, created_at DESC);
CREATE INDEX idx_posts_thread ON posts(thread_id, created_at);
CREATE INDEX idx_posts_parent ON posts(parent_id, created_at);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_body_trgm ON posts USING gin(body gin_trgm_ops); -- search
```

### Post Media
```sql
CREATE TABLE post_media (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    media_type  VARCHAR(10) NOT NULL,  -- 'image','video','gif'
    position    SMALLINT NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_post_media_post ON post_media(post_id);
```

### Likes
```sql
CREATE TABLE likes (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);
CREATE INDEX idx_likes_post ON likes(post_id);
```

### Reposts
```sql
CREATE TABLE reposts (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);
```

### Bookmarks
```sql
CREATE TABLE bookmarks (
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, post_id)
);
CREATE INDEX idx_bookmarks_user ON bookmarks(user_id, created_at DESC);
```

### Follows
```sql
CREATE TABLE follows (
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (follower_id, following_id),
    CONSTRAINT chk_no_self_follow CHECK (follower_id != following_id)
);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
```

### Notifications
```sql
CREATE TABLE notifications (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type          VARCHAR(20) NOT NULL,     -- 'like','reply','repost','follow'
    actor_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    post_id       UUID REFERENCES posts(id) ON DELETE CASCADE,
    is_read       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_notifications_user ON notifications(user_id, created_at DESC);
```

### Hashtags
```sql
CREATE TABLE hashtags (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100) UNIQUE NOT NULL,
    post_count  INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE post_hashtags (
    post_id     UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    hashtag_id  UUID NOT NULL REFERENCES hashtags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, hashtag_id)
);
```

## Migration Rules
- Always provide `.down.sql` reversing `.up.sql`
- Use `TIMESTAMPTZ` for all timestamps
- Always add relevant indexes
- Use `IF NOT EXISTS` / `IF EXISTS` for idempotency
- UUIDs: `gen_random_uuid()` — no auto-increment
- Foreign keys: `ON DELETE CASCADE` for user-owned data
- Check constraints: validate string lengths at DB level too
- Use `gin_trgm_ops` on `posts.body` for search (needs `CREATE EXTENSION IF NOT EXISTS pg_trgm;` in first migration)
