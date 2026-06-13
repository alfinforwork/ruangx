package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/alfinokio/ruangx/internal/domain/trend"
)

type TrendRepository struct {
	pool *pgxpool.Pool
}

func NewTrendRepository(pool *pgxpool.Pool) *TrendRepository {
	return &TrendRepository{pool: pool}
}

func (r *TrendRepository) GetTrending(ctx context.Context, limit int) ([]*trend.Trend, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	rows, err := r.pool.Query(ctx,
		`SELECT id, trend_type, name, post_count, score, category, region, last_updated, created_at
		FROM trends ORDER BY score DESC LIMIT $1`, limit,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get trending: %w", err)
	}
	defer rows.Close()

	var trends []*trend.Trend
	for rows.Next() {
		t := &trend.Trend{}
		if err := rows.Scan(&t.ID, &t.TrendType, &t.Name, &t.PostCount, &t.Score, &t.Category, &t.Region, &t.LastUpdated, &t.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan trend: %w", err)
		}
		trends = append(trends, t)
	}

	return trends, nil
}

func (r *TrendRepository) Increment(ctx context.Context, trendType, name string, count int) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO trends (trend_type, name, post_count, score)
		VALUES ($1, $2, $3, $3::decimal * 1.0)
		ON CONFLICT (trend_type, name) DO UPDATE SET
			post_count = trends.post_count + $3,
			score = (trends.post_count + $3)::decimal * 1.0,
			last_updated = NOW()`,
		trendType, name, count,
	)
	if err != nil {
		return fmt.Errorf("failed to increment trend: %w", err)
	}
	return nil
}