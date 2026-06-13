package dto

type FollowRequest struct {
	Username string `json:"username" validate:"required"`
}

type FollowResponse struct {
	Following bool `json:"following"`
}