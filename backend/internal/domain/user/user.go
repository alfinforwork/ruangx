package user

import (
	"context"
	"time"
)

type User struct {
	ID             string    `json:"id"`
	Username       string    `json:"username"`
	DisplayName    string    `json:"display_name"`
	Email          string    `json:"email,omitempty"`
	PasswordHash   string    `json:"-"`
	Bio            string    `json:"bio"`
	AvatarURL      string    `json:"avatar_url"`
	BannerURL      string    `json:"banner_url"`
	Website        string    `json:"website"`
	Location       string    `json:"location"`
	IsVerified     bool      `json:"is_verified"`
	IsPrivate      bool      `json:"is_private"`
	FollowerCount  int       `json:"follower_count"`
	FollowingCount int       `json:"following_count"`
	PostCount      int       `json:"post_count"`
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

type Repository interface {
	Create(ctx context.Context, u *User) error
	FindByID(ctx context.Context, id string) (*User, error)
	FindByUsername(ctx context.Context, username string) (*User, error)
	FindByEmail(ctx context.Context, email string) (*User, error)
	Update(ctx context.Context, u *User) error
	Search(ctx context.Context, query string, cursor string, limit int) ([]*User, string, error)
}