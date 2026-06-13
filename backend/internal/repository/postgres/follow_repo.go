package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/alfinokio/ruangx/internal/domain/follow"
)

type FollowRepository struct {
	pool *pgxpool.Pool
}

func NewFollowRepository(pool *pgxpool.Pool) *FollowRepository {
	return &FollowRepository{pool: pool}
}

func (r *FollowRepository) Follow(ctx context.Context, followerID, followingID string) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
		followerID, followingID)
	if err != nil {
		return fmt.Errorf("failed to follow: %w", err)
	}

	_, err = tx.Exec(ctx, `UPDATE users SET following_count = following_count + 1 WHERE id = $1`, followerID)
	if err != nil {
		return fmt.Errorf("failed to update following count: %w", err)
	}
	_, err = tx.Exec(ctx, `UPDATE users SET follower_count = follower_count + 1 WHERE id = $1`, followingID)
	if err != nil {
		return fmt.Errorf("failed to update follower count: %w", err)
	}

	return tx.Commit(ctx)
}

func (r *FollowRepository) Unfollow(ctx context.Context, followerID, followingID string) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	result, err := tx.Exec(ctx, `DELETE FROM follows WHERE follower_id = $1 AND following_id = $2`,
		followerID, followingID)
	if err != nil {
		return fmt.Errorf("failed to unfollow: %w", err)
	}

	if result.RowsAffected() > 0 {
		_, err = tx.Exec(ctx, `UPDATE users SET following_count = GREATEST(following_count - 1, 0) WHERE id = $1`, followerID)
		if err != nil {
			return fmt.Errorf("failed to update following count: %w", err)
		}
		_, err = tx.Exec(ctx, `UPDATE users SET follower_count = GREATEST(follower_count - 1, 0) WHERE id = $1`, followingID)
		if err != nil {
			return fmt.Errorf("failed to update follower count: %w", err)
		}
	}

	return tx.Commit(ctx)
}

func (r *FollowRepository) GetFollowers(ctx context.Context, userID string, cursor string, limit int) ([]*follow.Follow, string, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	sql := `SELECT f.id, f.follower_id, f.following_id, f.created_at
		FROM follows f WHERE f.following_id = $1`

	args := []interface{}{userID}

	if cursor != "" {
		sql += " AND (f.created_at, f.id) < (SELECT created_at, id FROM follows WHERE id = $2)"
		args = append(args, cursor)
	}

	args = append(args, limit+1)
	sql += " ORDER BY f.created_at DESC LIMIT $3"

	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, "", fmt.Errorf("failed to get followers: %w", err)
	}
	defer rows.Close()

	var follows []*follow.Follow
	for rows.Next() {
		f := &follow.Follow{}
		if err := rows.Scan(&f.ID, &f.FollowerID, &f.FollowingID, &f.CreatedAt); err != nil {
			return nil, "", fmt.Errorf("failed to scan follow: %w", err)
		}
		follows = append(follows, f)
	}

	var nextCursor string
	hasMore := len(follows) > limit
	if hasMore {
		follows = follows[:limit]
		nextCursor = follows[len(follows)-1].ID
	}

	return follows, nextCursor, nil
}

func (r *FollowRepository) GetFollowing(ctx context.Context, userID string, cursor string, limit int) ([]*follow.Follow, string, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	sql := `SELECT f.id, f.follower_id, f.following_id, f.created_at
		FROM follows f WHERE f.follower_id = $1`

	args := []interface{}{userID}

	if cursor != "" {
		sql += " AND (f.created_at, f.id) < (SELECT created_at, id FROM follows WHERE id = $2)"
		args = append(args, cursor)
	}

	args = append(args, limit+1)
	sql += " ORDER BY f.created_at DESC LIMIT $3"

	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, "", fmt.Errorf("failed to get following: %w", err)
	}
	defer rows.Close()

	var follows []*follow.Follow
	for rows.Next() {
		f := &follow.Follow{}
		if err := rows.Scan(&f.ID, &f.FollowerID, &f.FollowingID, &f.CreatedAt); err != nil {
			return nil, "", fmt.Errorf("failed to scan follow: %w", err)
		}
		follows = append(follows, f)
	}

	var nextCursor string
	hasMore := len(follows) > limit
	if hasMore {
		follows = follows[:limit]
		nextCursor = follows[len(follows)-1].ID
	}

	return follows, nextCursor, nil
}

func (r *FollowRepository) IsFollowing(ctx context.Context, followerID, followingID string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = $2)`,
		followerID, followingID,
	).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check following: %w", err)
	}
	return exists, nil
}

func (r *FollowRepository) GetFollowerIDs(ctx context.Context, userID string) ([]string, error) {
	rows, err := r.pool.Query(ctx, `SELECT follower_id FROM follows WHERE following_id = $1`, userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get follower ids: %w", err)
	}
	defer rows.Close()

	var ids []string
	for rows.Next() {
		var id string
		if err := rows.Scan(&id); err != nil {
			return nil, fmt.Errorf("failed to scan follower id: %w", err)
		}
		ids = append(ids, id)
	}
	return ids, nil
}