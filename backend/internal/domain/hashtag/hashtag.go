package hashtag

import (
	"context"
	"time"
)

type Hashtag struct {
	ID           string    `json:"id"`
	Tag          string    `json:"tag"`
	PostCount    int       `json:"post_count"`
	LastTrending time.Time `json:"last_trending"`
	CreatedAt    time.Time `json:"created_at"`
}

type Repository interface {
	FindOrCreate(ctx context.Context, tag string) (*Hashtag, error)
	FindTrending(ctx context.Context, limit int) ([]*Hashtag, error)
	LinkToPost(ctx context.Context, postID, hashtagID string) error
	GetForPost(ctx context.Context, postID string) ([]*Hashtag, error)
}