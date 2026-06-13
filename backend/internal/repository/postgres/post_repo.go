package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/alfinokio/ruangx/internal/domain/post"
)

type PostRepository struct {
	pool *pgxpool.Pool
}

func NewPostRepository(pool *pgxpool.Pool) *PostRepository {
	return &PostRepository{pool: pool}
}

func (r *PostRepository) Create(ctx context.Context, p *post.Post) error {
	p.ID = uuid.New().String()
	now := time.Now()
	p.CreatedAt = now
	p.UpdatedAt = now

	_, err := r.pool.Exec(ctx,
		`INSERT INTO posts (id, user_id, content, content_plain, thread_id, parent_id, room_id,
			is_repost, repost_of, is_quote, quoted_post_id, is_pinned, is_deleted,
			reply_count, repost_count, like_count, bookmark_count, view_count, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
		p.ID, p.UserID, p.Content, p.ContentPlain, p.ThreadID, p.ParentID, p.RoomID,
		p.IsRepost, p.RepostOf, p.IsQuote, p.QuotedPostID, p.IsPinned, p.IsDeleted,
		p.ReplyCount, p.RepostCount, p.LikeCount, p.BookmarkCount, p.ViewCount, p.CreatedAt, p.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create post: %w", err)
	}

	r.pool.Exec(ctx, `UPDATE users SET post_count = post_count + 1 WHERE id = $1`, p.UserID)
	return nil
}

func scanRow(scanner interface{ Scan(dest ...interface{}) error }) (*post.Post, error) {
	p := &post.Post{}
	err := scanner.Scan(
		&p.ID, &p.UserID, &p.Content, &p.ContentPlain, &p.ThreadID, &p.ParentID, &p.RoomID,
		&p.IsRepost, &p.RepostOf, &p.IsQuote, &p.QuotedPostID, &p.IsPinned, &p.IsDeleted,
		&p.ReplyCount, &p.RepostCount, &p.LikeCount, &p.BookmarkCount, &p.ViewCount, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, err
	}
	return p, nil
}

func (r *PostRepository) FindByID(ctx context.Context, id string) (*post.Post, error) {
	p, err := scanRow(r.pool.QueryRow(ctx,
		`SELECT id, user_id, content, content_plain, thread_id, parent_id, room_id,
			is_repost, repost_of, is_quote, quoted_post_id, is_pinned, is_deleted,
			reply_count, repost_count, like_count, bookmark_count, view_count, created_at, updated_at
		FROM posts WHERE id = $1 AND is_deleted = false`, id,
	))
	if err != nil {
		return nil, fmt.Errorf("failed to find post by id: %w", err)
	}
	return p, nil
}

func (r *PostRepository) FindFeed(ctx context.Context, userID string, cursor string, limit int) ([]*post.Post, string, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	sql := `
		SELECT p.id, p.user_id, p.content, p.content_plain, p.thread_id, p.parent_id, p.room_id,
			p.is_repost, p.repost_of, p.is_quote, p.quoted_post_id, p.is_pinned, p.is_deleted,
			p.reply_count, p.repost_count, p.like_count, p.bookmark_count, p.view_count, p.created_at, p.updated_at,
			u.id, u.username, u.display_name, u.avatar_url, u.is_verified
		FROM posts p
		JOIN users u ON u.id = p.user_id
		JOIN follows f ON f.following_id = p.user_id
		WHERE f.follower_id = $1 AND p.is_deleted = false AND p.parent_id IS NULL`

	args := []interface{}{userID}
	argIdx := 2

	if cursor != "" {
		sql += fmt.Sprintf(" AND (p.created_at, p.id) < (SELECT created_at, id FROM posts WHERE id = $%d)", argIdx)
		args = append(args, cursor)
		argIdx++
	}

	args = append(args, limit+1)
	sql += fmt.Sprintf(" ORDER BY p.created_at DESC, p.id DESC LIMIT $%d", argIdx)

	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, "", fmt.Errorf("failed to find feed: %w", err)
	}
	defer rows.Close()

	return scanPosts(rows, limit)
}

func (r *PostRepository) FindByUser(ctx context.Context, userID string, cursor string, limit int) ([]*post.Post, string, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	sql := `
		SELECT p.id, p.user_id, p.content, p.content_plain, p.thread_id, p.parent_id, p.room_id,
			p.is_repost, p.repost_of, p.is_quote, p.quoted_post_id, p.is_pinned, p.is_deleted,
			p.reply_count, p.repost_count, p.like_count, p.bookmark_count, p.view_count, p.created_at, p.updated_at,
			u.id, u.username, u.display_name, u.avatar_url, u.is_verified
		FROM posts p
		JOIN users u ON u.id = p.user_id
		WHERE p.user_id = $1 AND p.is_deleted = false`

	args := []interface{}{userID}
	argIdx := 2

	if cursor != "" {
		sql += fmt.Sprintf(" AND (p.created_at, p.id) < (SELECT created_at, id FROM posts WHERE id = $%d)", argIdx)
		args = append(args, cursor)
		argIdx++
	}

	args = append(args, limit+1)
	sql += fmt.Sprintf(" ORDER BY p.created_at DESC, p.id DESC LIMIT $%d", argIdx)

	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, "", fmt.Errorf("failed to find user posts: %w", err)
	}
	defer rows.Close()

	return scanPosts(rows, limit)
}

func (r *PostRepository) FindByThread(ctx context.Context, threadID string) ([]*post.Post, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT p.id, p.user_id, p.content, p.content_plain, p.thread_id, p.parent_id, p.room_id,
			p.is_repost, p.repost_of, p.is_quote, p.quoted_post_id, p.is_pinned, p.is_deleted,
			p.reply_count, p.repost_count, p.like_count, p.bookmark_count, p.view_count, p.created_at, p.updated_at,
			u.id, u.username, u.display_name, u.avatar_url, u.is_verified
		FROM posts p
		JOIN users u ON u.id = p.user_id
		WHERE (p.thread_id = $1 OR p.id = $1) AND p.is_deleted = false
		ORDER BY p.created_at ASC`, threadID,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to find thread: %w", err)
	}
	defer rows.Close()

	return scanPostsRaw(rows)
}

func (r *PostRepository) FindByRoom(ctx context.Context, roomID string, cursor string, limit int) ([]*post.Post, string, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	sql := `
		SELECT p.id, p.user_id, p.content, p.content_plain, p.thread_id, p.parent_id, p.room_id,
			p.is_repost, p.repost_of, p.is_quote, p.quoted_post_id, p.is_pinned, p.is_deleted,
			p.reply_count, p.repost_count, p.like_count, p.bookmark_count, p.view_count, p.created_at, p.updated_at,
			u.id, u.username, u.display_name, u.avatar_url, u.is_verified
		FROM posts p
		JOIN users u ON u.id = p.user_id
		WHERE p.room_id = $1 AND p.is_deleted = false`

	args := []interface{}{roomID}
	argIdx := 2

	if cursor != "" {
		sql += fmt.Sprintf(" AND (p.created_at, p.id) < (SELECT created_at, id FROM posts WHERE id = $%d)", argIdx)
		args = append(args, cursor)
		argIdx++
	}

	args = append(args, limit+1)
	sql += fmt.Sprintf(" ORDER BY p.created_at DESC, p.id DESC LIMIT $%d", argIdx)

	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, "", fmt.Errorf("failed to find room posts: %w", err)
	}
	defer rows.Close()

	return scanPosts(rows, limit)
}

func (r *PostRepository) Update(ctx context.Context, p *post.Post) error {
	p.UpdatedAt = time.Now()
	_, err := r.pool.Exec(ctx,
		`UPDATE posts SET content=$2, content_plain=$3, thread_id=$4, parent_id=$5, room_id=$6,
			is_repost=$7, repost_of=$8, is_quote=$9, quoted_post_id=$10, is_pinned=$11,
			reply_count=$12, repost_count=$13, like_count=$14, bookmark_count=$15, view_count=$16, updated_at=$17
		WHERE id=$1`,
		p.ID, p.Content, p.ContentPlain, p.ThreadID, p.ParentID, p.RoomID,
		p.IsRepost, p.RepostOf, p.IsQuote, p.QuotedPostID, p.IsPinned,
		p.ReplyCount, p.RepostCount, p.LikeCount, p.BookmarkCount, p.ViewCount, p.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to update post: %w", err)
	}
	return nil
}

func (r *PostRepository) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE posts SET is_deleted = true, updated_at = NOW() WHERE id = $1`, id,
	)
	if err != nil {
		return fmt.Errorf("failed to delete post: %w", err)
	}
	return nil
}

func scanPosts(rows pgx.Rows, limit int) ([]*post.Post, string, error) {
	var posts []*post.Post
	for rows.Next() {
		p := &post.Post{}
		u := &post.PostUser{}
		err := rows.Scan(
			&p.ID, &p.UserID, &p.Content, &p.ContentPlain, &p.ThreadID, &p.ParentID, &p.RoomID,
			&p.IsRepost, &p.RepostOf, &p.IsQuote, &p.QuotedPostID, &p.IsPinned, &p.IsDeleted,
			&p.ReplyCount, &p.RepostCount, &p.LikeCount, &p.BookmarkCount, &p.ViewCount, &p.CreatedAt, &p.UpdatedAt,
			&u.ID, &u.Username, &u.DisplayName, &u.AvatarURL, &u.IsVerified,
		)
		if err != nil {
			return nil, "", fmt.Errorf("failed to scan post: %w", err)
		}
		p.User = u
		posts = append(posts, p)
	}

	var nextCursor string
	hasMore := len(posts) > limit
	if hasMore {
		posts = posts[:limit]
		nextCursor = posts[len(posts)-1].ID
	}

	return posts, nextCursor, nil
}

func scanPostsRaw(rows pgx.Rows) ([]*post.Post, error) {
	var posts []*post.Post
	for rows.Next() {
		p := &post.Post{}
		u := &post.PostUser{}
		err := rows.Scan(
			&p.ID, &p.UserID, &p.Content, &p.ContentPlain, &p.ThreadID, &p.ParentID, &p.RoomID,
			&p.IsRepost, &p.RepostOf, &p.IsQuote, &p.QuotedPostID, &p.IsPinned, &p.IsDeleted,
			&p.ReplyCount, &p.RepostCount, &p.LikeCount, &p.BookmarkCount, &p.ViewCount, &p.CreatedAt, &p.UpdatedAt,
			&u.ID, &u.Username, &u.DisplayName, &u.AvatarURL, &u.IsVerified,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan post: %w", err)
		}
		p.User = u
		posts = append(posts, p)
	}
	return posts, nil
}