package notification

import (
	"context"
	"time"
)

type Notification struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	ActorID   *string   `json:"actor_id,omitempty"`
	Type      string    `json:"type"`
	PostID    *string   `json:"post_id,omitempty"`
	RoomID    *string   `json:"room_id,omitempty"`
	Message   string    `json:"message"`
	IsRead    bool      `json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
	// Joined
	Actor *NotifActor `json:"actor,omitempty"`
}

type NotifActor struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	DisplayName string `json:"display_name"`
	AvatarURL   string `json:"avatar_url"`
}

type Repository interface {
	Create(ctx context.Context, n *Notification) error
	FindByUser(ctx context.Context, userID string, cursor string, limit int) ([]*Notification, string, error)
	MarkRead(ctx context.Context, notifID, userID string) error
	MarkAllRead(ctx context.Context, userID string) error
	CountUnread(ctx context.Context, userID string) (int, error)
}