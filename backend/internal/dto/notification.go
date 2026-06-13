package dto

type NotificationResponse struct {
	ID        string       `json:"id"`
	Type      string       `json:"type"`
	Message   string       `json:"message"`
	PostID    *string      `json:"post_id,omitempty"`
	RoomID    *string      `json:"room_id,omitempty"`
	IsRead    bool         `json:"is_read"`
	CreatedAt string       `json:"created_at"`
	Actor     *UserResponse `json:"actor,omitempty"`
}

type UnreadCountResponse struct {
	Count int `json:"count"`
}