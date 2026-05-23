package repository

import (
	"database/sql"

	"github.com/ruangx/post-service/internal/model"
)

type PostRepo struct {
	db *sql.DB
}

func NewPostRepo(db *sql.DB) *PostRepo {
	return &PostRepo{db: db}
}

func (r *PostRepo) Create(p *model.Post) error {
	return r.db.QueryRow(
		`INSERT INTO posts (user_id, content, media_urls) VALUES ($1, $2, $3)
		 RETURNING id, view_count, created_at, updated_at`,
		p.UserID, p.Content, p.MediaURLs,
	).Scan(&p.ID, &p.ViewCount, &p.CreatedAt, &p.UpdatedAt)
}

func (r *PostRepo) GetFeed(page, limit int) ([]*model.Post, error) {
	offset := (page - 1) * limit
	rows, err := r.db.Query(
		`SELECT p.id, p.user_id, u.name, u.avatar_url, p.content, p.media_urls,
		        p.view_count, p.created_at, p.updated_at,
		        COALESCE(l.cnt,0), COALESCE(c.cnt,0), COALESCE(s.cnt,0)
		 FROM posts p
		 JOIN users u ON u.id = p.user_id
		 LEFT JOIN (SELECT post_id, COUNT(*) cnt FROM likes GROUP BY post_id) l ON l.post_id = p.id
		 LEFT JOIN (SELECT post_id, COUNT(*) cnt FROM comments GROUP BY post_id) c ON c.post_id = p.id
		 LEFT JOIN (SELECT reference_id, COUNT(*) cnt FROM shares GROUP BY reference_id) s ON s.reference_id = p.id
		 ORDER BY p.created_at DESC LIMIT $1 OFFSET $2`, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []*model.Post
	for rows.Next() {
		p := &model.Post{}
		err := rows.Scan(&p.ID, &p.UserID, &p.UserName, &p.UserAvatar, &p.Content, &p.MediaURLs,
			&p.ViewCount, &p.CreatedAt, &p.UpdatedAt, &p.LikeCount, &p.CommentCount, &p.ShareCount)
		if err != nil {
			return nil, err
		}
		posts = append(posts, p)
	}
	return posts, nil
}

func (r *PostRepo) GetByID(id string) (*model.Post, error) {
	p := &model.Post{}
	err := r.db.QueryRow(
		`SELECT p.id, p.user_id, u.name, u.avatar_url, p.content, p.media_urls,
		        p.view_count, p.created_at, p.updated_at,
		        COALESCE(l.cnt,0), COALESCE(c.cnt,0), COALESCE(s.cnt,0)
		 FROM posts p
		 JOIN users u ON u.id = p.user_id
		 LEFT JOIN (SELECT post_id, COUNT(*) cnt FROM likes GROUP BY post_id) l ON l.post_id = p.id
		 LEFT JOIN (SELECT post_id, COUNT(*) cnt FROM comments GROUP BY post_id) c ON c.post_id = p.id
		 LEFT JOIN (SELECT reference_id, COUNT(*) cnt FROM shares GROUP BY reference_id) s ON s.reference_id = p.id
		 WHERE p.id = $1`, id,
	).Scan(&p.ID, &p.UserID, &p.UserName, &p.UserAvatar, &p.Content, &p.MediaURLs,
		&p.ViewCount, &p.CreatedAt, &p.UpdatedAt, &p.LikeCount, &p.CommentCount, &p.ShareCount)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return p, err
}

func (r *PostRepo) IncrementView(id string) error {
	_, err := r.db.Exec(`UPDATE posts SET view_count = view_count + 1 WHERE id = $1`, id)
	return err
}

func (r *PostRepo) Like(userID, postID string) error {
	_, err := r.db.Exec(`INSERT INTO likes (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, userID, postID)
	return err
}

func (r *PostRepo) Unlike(userID, postID string) error {
	_, err := r.db.Exec(`DELETE FROM likes WHERE user_id = $1 AND post_id = $2`, userID, postID)
	return err
}

func (r *PostRepo) IsLiked(userID, postID string) (bool, error) {
	var cnt int
	err := r.db.QueryRow(`SELECT COUNT(*) FROM likes WHERE user_id = $1 AND post_id = $2`, userID, postID).Scan(&cnt)
	return cnt > 0, err
}

func (r *PostRepo) Bookmark(userID, postID string) error {
	_, err := r.db.Exec(`INSERT INTO bookmarks (user_id, post_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`, userID, postID)
	return err
}

func (r *PostRepo) Unbookmark(userID, postID string) error {
	_, err := r.db.Exec(`DELETE FROM bookmarks WHERE user_id = $1 AND post_id = $2`, userID, postID)
	return err
}

func (r *PostRepo) IsBookmarked(userID, postID string) (bool, error) {
	var cnt int
	err := r.db.QueryRow(`SELECT COUNT(*) FROM bookmarks WHERE user_id = $1 AND post_id = $2`, userID, postID).Scan(&cnt)
	return cnt > 0, err
}

func (r *PostRepo) GetComments(postID string) ([]*model.Comment, error) {
	rows, err := r.db.Query(
		`SELECT c.id, c.post_id, c.user_id, u.name, u.avatar_url, c.parent_id, c.content, c.created_at
		 FROM comments c JOIN users u ON u.id = c.user_id
		 WHERE c.post_id = $1 ORDER BY c.created_at`, postID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var comments []*model.Comment
	for rows.Next() {
		cm := &model.Comment{}
		if err := rows.Scan(&cm.ID, &cm.PostID, &cm.UserID, &cm.UserName, &cm.UserAvatar, &cm.ParentID, &cm.Content, &cm.CreatedAt); err != nil {
			return nil, err
		}
		comments = append(comments, cm)
	}
	return comments, nil
}

func (r *PostRepo) AddComment(c *model.Comment) error {
	return r.db.QueryRow(
		`INSERT INTO comments (post_id, user_id, parent_id, content) VALUES ($1, $2, $3, $4)
		 RETURNING id, created_at`,
		c.PostID, c.UserID, c.ParentID, c.Content,
	).Scan(&c.ID, &c.CreatedAt)
}

func (r *PostRepo) GetTrendingTags(limit int) ([]string, error) {
	rows, err := r.db.Query(`SELECT name FROM tags ORDER BY count DESC LIMIT $1`, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var tags []string
	for rows.Next() {
		var t string
		if err := rows.Scan(&t); err != nil {
			return nil, err
		}
		tags = append(tags, t)
	}
	return tags, nil
}

func (r *PostRepo) GetUserPosts(userID string) ([]*model.Post, error) {
	rows, err := r.db.Query(
		`SELECT p.id, p.user_id, u.name, u.avatar_url, p.content, p.media_urls,
		        p.view_count, p.created_at, p.updated_at,
		        COALESCE(l.cnt,0), COALESCE(c.cnt,0), COALESCE(s.cnt,0)
		 FROM posts p
		 JOIN users u ON u.id = p.user_id
		 LEFT JOIN (SELECT post_id, COUNT(*) cnt FROM likes GROUP BY post_id) l ON l.post_id = p.id
		 LEFT JOIN (SELECT post_id, COUNT(*) cnt FROM comments GROUP BY post_id) c ON c.post_id = p.id
		 LEFT JOIN (SELECT reference_id, COUNT(*) cnt FROM shares GROUP BY reference_id) s ON s.reference_id = p.id
		 WHERE p.user_id = $1 ORDER BY p.created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var posts []*model.Post
	for rows.Next() {
		p := &model.Post{}
		if err := rows.Scan(&p.ID, &p.UserID, &p.UserName, &p.UserAvatar, &p.Content, &p.MediaURLs,
			&p.ViewCount, &p.CreatedAt, &p.UpdatedAt, &p.LikeCount, &p.CommentCount, &p.ShareCount); err != nil {
			return nil, err
		}
		posts = append(posts, p)
	}
	return posts, nil
}

func (r *PostRepo) GetUserBookmarks(userID string) ([]*model.Post, error) {
	rows, err := r.db.Query(
		`SELECT p.id, p.user_id, u.name, u.avatar_url, p.content, p.media_urls,
		        p.view_count, p.created_at, p.updated_at,
		        COALESCE(l.cnt,0), COALESCE(c.cnt,0), COALESCE(s.cnt,0)
		 FROM bookmarks b
		 JOIN posts p ON p.id = b.post_id
		 JOIN users u ON u.id = p.user_id
		 LEFT JOIN (SELECT post_id, COUNT(*) cnt FROM likes GROUP BY post_id) l ON l.post_id = p.id
		 LEFT JOIN (SELECT post_id, COUNT(*) cnt FROM comments GROUP BY post_id) c ON c.post_id = p.id
		 LEFT JOIN (SELECT reference_id, COUNT(*) cnt FROM shares GROUP BY reference_id) s ON s.reference_id = p.id
		 WHERE b.user_id = $1 ORDER BY b.created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var posts []*model.Post
	for rows.Next() {
		p := &model.Post{}
		if err := rows.Scan(&p.ID, &p.UserID, &p.UserName, &p.UserAvatar, &p.Content, &p.MediaURLs,
			&p.ViewCount, &p.CreatedAt, &p.UpdatedAt, &p.LikeCount, &p.CommentCount, &p.ShareCount); err != nil {
			return nil, err
		}
		posts = append(posts, p)
	}
	return posts, nil
}