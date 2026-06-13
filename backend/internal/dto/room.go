package dto

type CreateRoomRequest struct {
	Name        string `json:"name" validate:"required,min=2,max=60"`
	Description string `json:"description" validate:"max=500"`
	Icon        string `json:"icon"`
	Color       string `json:"color"`
	IsPrivate   bool   `json:"is_private"`
	IsNSFW      bool   `json:"is_nsfw"`
}

type RoomResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	BannerURL   string `json:"banner_url"`
	Color       string `json:"color"`
	MemberCount int    `json:"member_count"`
	PostCount   int    `json:"post_count"`
	IsPrivate   bool   `json:"is_private"`
	IsNSFW      bool   `json:"is_nsfw"`
	IsMember    bool   `json:"is_member"`
	CreatedAt   string `json:"created_at"`
}

type JoinRoomResponse struct {
	Joined bool `json:"joined"`
}