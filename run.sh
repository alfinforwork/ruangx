#!/bin/bash
set -e

export AUTH_SERVICE_URL=http://localhost:8081
export POST_SERVICE_URL=http://localhost:8082
export CHAT_SERVICE_URL=http://localhost:8083
export NOTIF_SERVICE_URL=http://localhost:8084
export DATABASE_URL=postgres://ruangx:ruangx@localhost:5432/ruangx?sslmode=disable
export JWT_SECRET=ruangx-dev-secret

pkill -f /tmp/ruangx 2>/dev/null || true
sleep 1

nohup env PORT=8081 /tmp/ruangx-auth > /tmp/auth.log 2>&1 &
echo "auth: $!"
nohup env PORT=8082 /tmp/ruangx-post > /tmp/post.log 2>&1 &
echo "post: $!"
nohup env PORT=8083 /tmp/ruangx-chat > /tmp/chat.log 2>&1 &
echo "chat: $!"
nohup env PORT=8084 /tmp/ruangx-notif > /tmp/notif.log 2>&1 &
echo "notif: $!"
nohup env PORT=8080 /tmp/ruangx-gate > /tmp/gate.log 2>&1 &
echo "gate: $!"

sleep 3
echo "=== Test ==="
curl -s -X POST http://localhost:8080/api/auth/register -H "Content-Type: application/json" -d '{"name":"test","email":"t@t.com","password":"p"}'