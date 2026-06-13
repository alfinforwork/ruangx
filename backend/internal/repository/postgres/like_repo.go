package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/alfinokio/ruangx/internal/domain/like"
)

type LikeRepository struct {
	pool *pgxpool.Pool
}

func NewLikeRepository(pool *pgxpool.Pool) *LikeRepository {
	return &LikeRepository{pool: pool}
}

func (r *LikeRepository) Toggle(ctx context.Context, userID, postID string) (bool, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return false, fmt.Errorf("failed to begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var exists bool
	err = tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM likes WHERE user_id = $1 AND post_id = $2)`, userID, postID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check like: %w", err)
	}

	if exists {
		_, err = tx.Exec(ctx, `DELETE FROM likes WHERE user_id = $1 AND post_id = $2`, userID, postID)
		if err != nil {
			return false, fmt.Errorf("failed to unlike: %w", err)
		}
		_, err = tx.Exec(ctx, `UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = $1`, postID)
		if err != nil {
			return false, fmt.Errorf("failed to decrement like count: %w", err)
		}
	} else {
		_, err = tx.Exec(ctx, `INSERT INTO likes (user_id, post_id) VALUES ($1, $2)`, userID, postID)
		if err != nil {
			return false, fmt.Errorf("failed to like: %w", err)
		}
		_, err = tx.Exec(ctx, `UPDATE posts SET like_count = like_count + 1 WHERE id = $1`, postID)
		if err != nil {
			return false, fmt.Errorf("failed to increment like count: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return false, fmt.Errorf("failed to commit tx: %w", err)
	}

	return !exists, nil
}

func (r *LikeRepository) FindByUser(ctx context.Context, userID string, cursor string, limit int) ([]*like.Like, string, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	sql := `SELECT id, user_id, post_id, created_at FROM likes WHERE user_id = $1`
	args := []interface{}{userID}

	if cursor != "" {
		sql += " AND id > $2"
		args = append(args, cursor)
	}

	args = append(args, limit+1)
	sql += " ORDER BY created_at DESC LIMIT $3"

	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, "", fmt.Errorf("failed to find likes: %w", err)
	}
	defer rows.Close()

	var likes []*like.Like
	for rows.Next() {
		l := &like.Like{}
		if err := rows.Scan(&l.ID, &l.UserID, &l.PostID, &l.CreatedAt); err != nil {
			return nil, "", fmt.Errorf("failed to scan like: %w", err)
		}
		likes = append(likes, l)
	}

	var nextCursor string
	hasMore := len(likes) > limit
	if hasMore {
		likes = likes[:limit]
		nextCursor = likes[len(likes)-1].ID
	}

	return likes, nextCursor, nil
}

func (r *LikeRepository) CountByPost(ctx context.Context, postID string) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM likes WHERE post_id = $1`, postID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count likes: %w", err)
	}
	return count, nil
}