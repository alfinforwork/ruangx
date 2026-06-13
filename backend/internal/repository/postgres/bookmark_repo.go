package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/alfinokio/ruangx/internal/domain/bookmark"
)

type BookmarkRepository struct {
	pool *pgxpool.Pool
}

func NewBookmarkRepository(pool *pgxpool.Pool) *BookmarkRepository {
	return &BookmarkRepository{pool: pool}
}

func (r *BookmarkRepository) Toggle(ctx context.Context, userID, postID string) (bool, error) {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return false, fmt.Errorf("failed to begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	var exists bool
	err = tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM bookmarks WHERE user_id = $1 AND post_id = $2)`, userID, postID).Scan(&exists)
	if err != nil {
		return false, fmt.Errorf("failed to check bookmark: %w", err)
	}

	if exists {
		_, err = tx.Exec(ctx, `DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2`, userID, postID)
		if err != nil {
			return false, fmt.Errorf("failed to unbookmark: %w", err)
		}
		_, err = tx.Exec(ctx, `UPDATE posts SET bookmark_count = GREATEST(bookmark_count - 1, 0) WHERE id = $1`, postID)
		if err != nil {
			return false, fmt.Errorf("failed to decrement bookmark count: %w", err)
		}
	} else {
		_, err = tx.Exec(ctx, `INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2)`, userID, postID)
		if err != nil {
			return false, fmt.Errorf("failed to bookmark: %w", err)
		}
		_, err = tx.Exec(ctx, `UPDATE posts SET bookmark_count = bookmark_count + 1 WHERE id = $1`, postID)
		if err != nil {
			return false, fmt.Errorf("failed to increment bookmark count: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return false, fmt.Errorf("failed to commit tx: %w", err)
	}

	return !exists, nil
}

func (r *BookmarkRepository) FindByUser(ctx context.Context, userID string, cursor string, limit int) ([]*bookmark.Bookmark, string, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	sql := `SELECT b.id, b.user_id, b.post_id, b.created_at
		FROM bookmarks b
		JOIN posts p ON p.id = b.post_id
		WHERE b.user_id = $1 AND p.is_deleted = false`

	args := []interface{}{userID}

	if cursor != "" {
		sql += " AND (b.created_at, b.id) < (SELECT created_at, id FROM bookmarks WHERE id = $2)"
		args = append(args, cursor)
	}

	args = append(args, limit+1)
	sql += " ORDER BY b.created_at DESC LIMIT $3"

	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, "", fmt.Errorf("failed to find bookmarks: %w", err)
	}
	defer rows.Close()

	var bookmarks []*bookmark.Bookmark
	for rows.Next() {
		b := &bookmark.Bookmark{}
		if err := rows.Scan(&b.ID, &b.UserID, &b.PostID, &b.CreatedAt); err != nil {
			return nil, "", fmt.Errorf("failed to scan bookmark: %w", err)
		}
		bookmarks = append(bookmarks, b)
	}

	var nextCursor string
	hasMore := len(bookmarks) > limit
	if hasMore {
		bookmarks = bookmarks[:limit]
		nextCursor = bookmarks[len(bookmarks)-1].ID
	}

	return bookmarks, nextCursor, nil
}