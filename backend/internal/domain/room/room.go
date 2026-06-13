package room

import (
	"context"
	"time"
)

type Room struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"`
	BannerURL   string    `json:"banner_url"`
	Color       string    `json:"color"`
	CreatedBy   *string   `json:"created_by,omitempty"`
	MemberCount int       `json:"member_count"`
	PostCount   int       `json:"post_count"`
	IsPrivate   bool      `json:"is_private"`
	IsNSFW      bool      `json:"is_nsfw"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	// Joined
	IsMember bool `json:"is_member,omitempty"`
}

type RoomMember struct {
	ID       string    `json:"id"`
	RoomID   string    `json:"room_id"`
	UserID   string    `json:"user_id"`
	Role     string    `json:"role"`
	JoinedAt time.Time `json:"joined_at"`
}

type Repository interface {
	Create(ctx context.Context, r *Room) error
	FindByID(ctx context.Context, id string) (*Room, error)
	FindByName(ctx context.Context, name string) (*Room, error)
	FindPopular(ctx context.Context, cursor string, limit int) ([]*Room, string, error)
	Join(ctx context.Context, roomID, userID string) error
	Leave(ctx context.Context, roomID, userID string) error
	Update(ctx context.Context, r *Room) error
}