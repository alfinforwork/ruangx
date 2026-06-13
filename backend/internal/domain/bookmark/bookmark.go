package bookmark

import (
	"context"
	"time"
)

type Bookmark struct {
	ID        string    `json:"id"`
	UserID    string    `json:"user_id"`
	PostID    string    `json:"post_id"`
	CreatedAt time.Time `json:"created_at"`
}

type Repository interface {
	Toggle(ctx context.Context, userID, postID string) (bool, error)
	FindByUser(ctx context.Context, userID string, cursor string, limit int) ([]*Bookmark, string, error)
}