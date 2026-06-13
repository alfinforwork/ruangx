package post

import (
	"context"
	"time"
)

type Post struct {
	ID            string    `json:"id"`
	UserID        string    `json:"user_id"`
	Content       string    `json:"content"`
	ContentPlain  string    `json:"content_plain"`
	ThreadID      *string   `json:"thread_id,omitempty"`
	ParentID      *string   `json:"parent_id,omitempty"`
	RoomID        *string   `json:"room_id,omitempty"`
	IsRepost      bool      `json:"is_repost"`
	RepostOf      *string   `json:"repost_of,omitempty"`
	IsQuote       bool      `json:"is_quote"`
	QuotedPostID  *string   `json:"quoted_post_id,omitempty"`
	IsPinned      bool      `json:"is_pinned"`
	IsDeleted     bool      `json:"-"`
	ReplyCount    int       `json:"reply_count"`
	RepostCount   int       `json:"repost_count"`
	LikeCount     int       `json:"like_count"`
	BookmarkCount int       `json:"bookmark_count"`
	ViewCount     int       `json:"view_count"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	// Joined fields
	User        *PostUser   `json:"user,omitempty"`
	Media       []PostMedia `json:"media,omitempty"`
	IsLiked     bool        `json:"is_liked,omitempty"`
	IsBookmarked bool       `json:"is_bookmarked,omitempty"`
	Hashtags    []string    `json:"hashtags,omitempty"`
}

type PostUser struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	DisplayName string `json:"display_name"`
	AvatarURL   string `json:"avatar_url"`
	IsVerified  bool   `json:"is_verified"`
}

type PostMedia struct {
	ID           string    `json:"id"`
	PostID       string    `json:"post_id"`
	URL          string    `json:"url"`
	ThumbnailURL string    `json:"thumbnail_url"`
	MediaType    string    `json:"media_type"`
	Width        int       `json:"width"`
	Height       int       `json:"height"`
	AltText      string    `json:"alt_text"`
	FileSize     int64     `json:"file_size"`
	Position     int       `json:"position"`
	CreatedAt    time.Time `json:"created_at"`
}

type Repository interface {
	Create(ctx context.Context, p *Post) error
	FindByID(ctx context.Context, id string) (*Post, error)
	FindFeed(ctx context.Context, userID string, cursor string, limit int) ([]*Post, string, error)
	FindByUser(ctx context.Context, userID string, cursor string, limit int) ([]*Post, string, error)
	FindByThread(ctx context.Context, threadID string) ([]*Post, error)
	FindByRoom(ctx context.Context, roomID string, cursor string, limit int) ([]*Post, string, error)
	Update(ctx context.Context, p *Post) error
	Delete(ctx context.Context, id string) error
}