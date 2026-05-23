# PRD — RuangX

Social media threads web app. Short-form content, video, real-time chat.

---

## 1. Vision

RuangX = "Space X" — digital space for people to share thoughts, short videos, connect in real-time. Thread-based social platform with micro-blogging + short video feed.

---

## 2. Features

### 2.1 Auth

| Feature | Desc |
|---------|------|
| Login | Email/password, JWT session |
| Register | Name, email, password |
| Forgot Password | Send reset link via email |

### 2.2 Main Pages

| Page | Desc |
|------|------|
| Home | Post feed, viral tags, user recs |
| Shorts | Short video feed (upcoming — placeholder for now) |
| Notifications | Comment notifications only (v1) |
| Messages | Real-time chat between users |
| Profile | User profile hub |

#### Home
- Post feed (chronological / algorithmic TBD)
- Viral tags — top 10 trending hashtags
- Following recommendations — suggest users to follow

#### Shorts
- Short-form vertical video
- v1: upcoming / coming soon screen

#### Notifications
- v1 scope: comment notifications only
- Future: likes, follows, shares

#### Messages
- Real-time 1-on-1 chat via WebSocket
- Message history stored in DB
- Future: group chat, read receipts

#### Profile
| Section | Desc |
|---------|------|
| Settings | Edit account info, change password |
| Avatar | Profile picture |
| Banner | Cover image |
| Posts | User's posts |
| Replies | User's replies/comments |
| Media | User's media attachments |
| Likes | Posts user liked |
| Post Shares | Shared posts |
| Bookmarks | Saved/bookmarked posts |

### 2.3 Post Detail

| Feature | Desc |
|---------|------|
| Like | Heart/toggle |
| Comment/Reply | Threaded comments |
| Share | Share post |
| Total Views | Increment on post detail view |
| Bookmark | Save post |

### 2.4 Settings

| Feature | Desc |
|---------|------|
| Change Account Info | Name, email, bio, avatar, banner |
| Change Password | Current + new password |

---

## 3. Tech Stack

### Global
- Docker (containerization)
- Docker Compose (local dev orchestration)

### Frontend
- Next.js (latest)
- Yarn (latest)
- Shadcn/ui + Tailwind CSS
- Clean architecture
- WebSocket + REST API

### Backend
- Go (latest)
- Go Fiber v3
- PostgreSQL
- Microservices
- Apache Kafka (event bus)
- WebSocket + REST API

---

## 4. Architecture (High-Level)

```
┌─────────────┐
│   Frontend   │  Next.js + WebSocket
│  (Next.js)   │
└──────┬──────┘
       │ REST / WS
       ▼
┌──────────────┐
│  API Gateway  │  Go Fiber — route, auth middleware, rate limit
│  (Go Fiber)   │
└───┬───┬───┬──┘
    │   │   │   │
    ▼   ▼   ▼   ▼
┌───┐ ┌───┐ ┌───┐ ┌───┐
│A  │ │P  │ │C  │ │N  │
│u  │ │o  │ │h  │ │o  │
│t  │ │st │ │at │ │ti │
│h  │ │   │ │   │ │f  │
└───┘ └───┘ └───┘ └───┘
 │     │     │     │
 └─────┴─────┴─────┘
        │
        ▼
    ┌────────┐
    │ Kafka  │  Event bus
    └───┬────┘
        │
        ▼
    ┌────────┐
    │  PG DB  │  PostgreSQL per service / shared (TBD)
    └────────┘
```

Microservices:
- **auth-service**: register, login, JWT, forgot password
- **post-service**: posts, likes, comments, shares, views, bookmarks
- **chat-service**: WebSocket — real-time messaging
- **notification-service**: consume Kafka events → send notifications
- **short-service**: short video CRUD (upcoming)

---

## 5. Data Models (v1)

### User
```
id, name, email, password_hash, avatar_url, banner_url,
bio, created_at, updated_at
```

### Post
```
id, user_id, content, media_urls[], view_count,
created_at, updated_at
```

### Comment
```
id, post_id, user_id, parent_id (nullable for threading),
content, created_at
```

### Like
```
id, user_id, post_id, created_at
```

### Bookmark
```
id, user_id, post_id, created_at
```

### Message
```
id, sender_id, receiver_id, content, read_at, created_at
```

### Notification
```
id, user_id, type, reference_id (post/comment), read,
created_at
```

---

## 6. Milestones

| Phase | Scope |
|-------|-------|
| **P0** | Auth (login/register/forgot) + Home feed + Post CRUD |
| **P1** | Profile + Settings + Like/Comment/Share/Bookmark |
| **P2** | Notifications + Messages (WebSocket) |
| **P3** | Shorts (video feed) |
| **P4** | Viral tags algo, recs, search |

---

## 7. Non-Goals (v1)
- No group chat
- No AI feed ranking
- No video upload/transcoding
- No push notifications (in-app only)
- No admin panel

---

## 8. Future Ideas
- Hashtag / tag pages
- Trending topics
- Stories (24h content)
- User follow / unfollow
- Feed algorithm (ML)
- Content moderation
- Mobile app (React Native / Flutter)