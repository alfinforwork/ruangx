# RuangX

Social media threads web app. Micro-blogging + short video + real-time chat.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js, Shadcn/ui, Tailwind |
| Backend | Go Fiber v3, PostgreSQL, Kafka |
| Infra | Docker, Docker Compose |

## Quick Start

```bash
docker compose up -d
```

Frontend: http://localhost:3000
API Gateway: http://localhost:8080

## Structure

```
ruangx/
├── frontend/          # Next.js app
│   └── src/
│       ├── core/          # Domain, usecases, repos
│       ├── infrastructure # API, WS, DB
│       └── presentation   # UI, pages, hooks
├── backend/
│   ├── api-gateway/       # Fiber gateway
│   ├── auth-service/      # Auth microservice
│   ├── post-service/      # Posts, likes, comments
│   ├── chat-service/      # Real-time chat (WS)
│   ├── notification-service/ # Kafka → notifications
│   └── short-service/     # Short video (upcoming)
├── docker-compose.yml
└── PRD.md
```

## Docs

See [PRD.md](./PRD.md) for full product requirements.