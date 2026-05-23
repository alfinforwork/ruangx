package model

import "time"

type Post struct {
	ID           string    `json:"id" db:"id"`
	UserID       string    `json:"userId" db:"user_id"`
	UserName     string    `json:"userName" db:"user_name"`
	UserAvatar   *string   `json:"userAvatar" db:"user_avatar"`
	Content      string    `json:"content" db:"content"`
	MediaURLs    []string  `json:"mediaUrls" db:"media_urls"`
	ViewCount    int       `json:"viewCount" db:"view_count"`
	LikeCount    int       `json:"likeCount" db:"like_count"`
	CommentCount int       `json:"commentCount" db:"comment_count"`
	ShareCount   int       `json:"shareCount" db:"share_count"`
	IsLiked      bool      `json:"isLiked" db:"-"`
	IsBookmarked bool      `json:"isBookmarked" db:"-"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
}

type Comment struct {
	ID         string    `json:"id" db:"id"`
	PostID     string    `json:"postId" db:"post_id"`
	UserID     string    `json:"userId" db:"user_id"`
	UserName   string    `json:"userName" db:"user_name"`
	UserAvatar *string   `json:"userAvatar" db:"user_avatar"`
	ParentID   *string   `json:"parentId" db:"parent_id"`
	Content    string    `json:"content" db:"content"`
	CreatedAt  time.Time `json:"createdAt" db:"created_at"`
}