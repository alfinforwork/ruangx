package follow

import (
	"context"
	"time"
)

type Follow struct {
	ID          string    `json:"id"`
	FollowerID  string    `json:"follower_id"`
	FollowingID string    `json:"following_id"`
	CreatedAt   time.Time `json:"created_at"`
}

type Repository interface {
	Follow(ctx context.Context, followerID, followingID string) error
	Unfollow(ctx context.Context, followerID, followingID string) error
	GetFollowers(ctx context.Context, userID string, cursor string, limit int) ([]*Follow, string, error)
	GetFollowing(ctx context.Context, userID string, cursor string, limit int) ([]*Follow, string, error)
	IsFollowing(ctx context.Context, followerID, followingID string) (bool, error)
}