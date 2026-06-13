package dto

type BookmarkToggleRequest struct {
	PostID string `json:"post_id" validate:"required,uuid"`
}

type BookmarkToggleResponse struct {
	Bookmarked bool `json:"bookmarked"`
}