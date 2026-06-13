package dto

type LikeToggleRequest struct {
	PostID string `json:"post_id" validate:"required,uuid"`
}

type LikeToggleResponse struct {
	Liked   bool `json:"liked"`
	NewCount int `json:"new_count"`
}