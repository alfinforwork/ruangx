package dto

type CreatePostRequest struct {
	Content     string   `json:"content" validate:"required,min=1,max=2000"`
	ContentHTML string   `json:"content_html"` // optional rich text
	ThreadID    *string  `json:"thread_id" validate:"omitempty,uuid"`
	ParentID    *string  `json:"parent_id" validate:"omitempty,uuid"`
	RoomID      *string  `json:"room_id" validate:"omitempty,uuid"`
	MediaURLs   []string `json:"media_urls"`
}

type PostListParams struct {
	Cursor string `json:"cursor" query:"cursor"`
	Limit  int    `json:"limit" query:"limit"`
}

type PostResponse struct {
	ID            string            `json:"id"`
	Content       string            `json:"content"`
	ContentPlain  string            `json:"content_plain"`
	ThreadID      *string           `json:"thread_id,omitempty"`
	ParentID      *string           `json:"parent_id,omitempty"`
	RoomID        *string           `json:"room_id,omitempty"`
	ReplyCount    int               `json:"reply_count"`
	LikeCount     int               `json:"like_count"`
	BookmarkCount int               `json:"bookmark_count"`
	ViewCount     int               `json:"view_count"`
	IsLiked       bool              `json:"is_liked"`
	IsBookmarked  bool              `json:"is_bookmarked"`
	CreatedAt     string            `json:"created_at"`
	User          *UserResponse     `json:"user,omitempty"`
	Media         []PostMediaResponse `json:"media,omitempty"`
	Hashtags      []string          `json:"hashtags,omitempty"`
}

type PostMediaResponse struct {
	ID           string `json:"id"`
	URL          string `json:"url"`
	ThumbnailURL string `json:"thumbnail_url"`
	MediaType    string `json:"media_type"`
	Width        int    `json:"width"`
	Height       int    `json:"height"`
	AltText      string `json:"alt_text"`
}

type FeedResponse struct {
	Posts      []PostResponse `json:"posts"`
	Cursor     string         `json:"cursor"`
	HasMore    bool           `json:"has_more"`
	Limit      int            `json:"limit"`
}