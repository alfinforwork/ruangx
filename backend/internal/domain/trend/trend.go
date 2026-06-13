package trend

import (
	"context"
	"time"
)

type Trend struct {
	ID          string    `json:"id"`
	TrendType   string    `json:"trend_type"`
	Name        string    `json:"name"`
	PostCount   int       `json:"post_count"`
	Score       float64   `json:"score"`
	Category    string    `json:"category"`
	Region      string    `json:"region"`
	LastUpdated time.Time `json:"last_updated"`
	CreatedAt   time.Time `json:"created_at"`
}

type Repository interface {
	GetTrending(ctx context.Context, limit int) ([]*Trend, error)
	Increment(ctx context.Context, trendType, name string, count int) error
}