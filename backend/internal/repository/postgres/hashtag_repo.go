package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/alfinokio/ruangx/internal/domain/hashtag"
)

type HashtagRepository struct {
	pool *pgxpool.Pool
}

func NewHashtagRepository(pool *pgxpool.Pool) *HashtagRepository {
	return &HashtagRepository{pool: pool}
}

func (r *HashtagRepository) FindOrCreate(ctx context.Context, tag string) (*hashtag.Hashtag, error) {
	h := &hashtag.Hashtag{}

	err := r.pool.QueryRow(ctx,
		`INSERT INTO hashtags (tag) VALUES ($1)
		ON CONFLICT (tag) DO UPDATE SET last_trending = NOW()
		RETURNING id, tag, post_count, last_trending, created_at`,
		tag,
	).Scan(&h.ID, &h.Tag, &h.PostCount, &h.LastTrending, &h.CreatedAt)

	if err != nil {
		return nil, fmt.Errorf("failed to find or create hashtag: %w", err)
	}

	return h, nil
}

func (r *HashtagRepository) FindTrending(ctx context.Context, limit int) ([]*hashtag.Hashtag, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	rows, err := r.pool.Query(ctx,
		`SELECT id, tag, post_count, last_trending, created_at
		FROM hashtags ORDER BY post_count DESC LIMIT $1`, limit,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to find trending hashtags: %w", err)
	}
	defer rows.Close()

	var hashtags []*hashtag.Hashtag
	for rows.Next() {
		h := &hashtag.Hashtag{}
		if err := rows.Scan(&h.ID, &h.Tag, &h.PostCount, &h.LastTrending, &h.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan hashtag: %w", err)
		}
		hashtags = append(hashtags, h)
	}

	return hashtags, nil
}

func (r *HashtagRepository) LinkToPost(ctx context.Context, postID, hashtagID string) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO post_hashtags (post_id, hashtag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
		postID, hashtagID,
	)
	if err != nil {
		return fmt.Errorf("failed to link hashtag to post: %w", err)
	}

	_, err = r.pool.Exec(ctx, `UPDATE hashtags SET post_count = post_count + 1 WHERE id = $1`, hashtagID)
	if err != nil {
		return fmt.Errorf("failed to update hashtag post count: %w", err)
	}

	return nil
}

func (r *HashtagRepository) GetForPost(ctx context.Context, postID string) ([]*hashtag.Hashtag, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT h.id, h.tag, h.post_count, h.last_trending, h.created_at
		FROM hashtags h
		JOIN post_hashtags ph ON ph.hashtag_id = h.id
		WHERE ph.post_id = $1`, postID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get hashtags for post: %w", err)
	}
	defer rows.Close()

	var hashtags []*hashtag.Hashtag
	for rows.Next() {
		h := &hashtag.Hashtag{}
		if err := rows.Scan(&h.ID, &h.Tag, &h.PostCount, &h.LastTrending, &h.CreatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan hashtag: %w", err)
		}
		hashtags = append(hashtags, h)
	}

	return hashtags, nil
}