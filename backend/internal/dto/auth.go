package dto

type RegisterRequest struct {
	Username    string `json:"username" validate:"required,min=3,max=30,alphanum"`
	DisplayName string `json:"display_name" validate:"required,min=1,max=60"`
	Email       string `json:"email" validate:"required,email,max=255"`
	Password    string `json:"password" validate:"required,min=8,max=128"`
}

type LoginRequest struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type AuthResponse struct {
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	User         UserResponse `json:"user"`
}

type UserResponse struct {
	ID             string `json:"id"`
	Username       string `json:"username"`
	DisplayName    string `json:"display_name"`
	Bio            string `json:"bio"`
	AvatarURL      string `json:"avatar_url"`
	BannerURL      string `json:"banner_url"`
	Website        string `json:"website"`
	Location       string `json:"location"`
	IsVerified     bool   `json:"is_verified"`
	IsPrivate      bool   `json:"is_private"`
	FollowerCount  int    `json:"follower_count"`
	FollowingCount int    `json:"following_count"`
	PostCount      int    `json:"post_count"`
	CreatedAt      string `json:"created_at"`
}

type UpdateProfileRequest struct {
	DisplayName string `json:"display_name" validate:"omitempty,min=1,max=60"`
	Bio         string `json:"bio" validate:"omitempty,max=500"`
	AvatarURL   string `json:"avatar_url"`
	BannerURL   string `json:"banner_url"`
	Website     string `json:"website" validate:"omitempty,max=255"`
	Location    string `json:"location" validate:"omitempty,max=100"`
	IsPrivate   *bool  `json:"is_private"`
}

type UserSearchParams struct {
	Query  string `json:"q" query:"q"`
	Cursor string `json:"cursor" query:"cursor"`
	Limit  int    `json:"limit" query:"limit"`
}