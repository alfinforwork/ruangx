package follow

import (
	"context"

	"github.com/alfinokio/ruangx/internal/domain/follow"
	"github.com/alfinokio/ruangx/internal/domain/notification"
	"github.com/alfinokio/ruangx/internal/domain/user"
	"github.com/alfinokio/ruangx/internal/dto"
	apperrors "github.com/alfinokio/ruangx/pkg/errors"
)

type FollowRepository interface {
	Follow(ctx context.Context, followerID, followingID string) error
	Unfollow(ctx context.Context, followerID, followingID string) error
	GetFollowers(ctx context.Context, userID string, cursor string, limit int) ([]*follow.Follow, string, error)
	GetFollowing(ctx context.Context, userID string, cursor string, limit int) ([]*follow.Follow, string, error)
	IsFollowing(ctx context.Context, followerID, followingID string) (bool, error)
}

type UserRepository interface {
	FindByUsername(ctx context.Context, username string) (*user.User, error)
	FindByID(ctx context.Context, id string) (*user.User, error)
}

type NotificationRepository interface {
	Create(ctx context.Context, n *notification.Notification) error
}

type UseCase struct {
	followRepo FollowRepository
	userRepo   UserRepository
	notifRepo  NotificationRepository
}

func NewUseCase(followRepo FollowRepository, userRepo UserRepository, notifRepo NotificationRepository) *UseCase {
	return &UseCase{
		followRepo: followRepo,
		userRepo:   userRepo,
		notifRepo:  notifRepo,
	}
}

func (uc *UseCase) Follow(ctx context.Context, followerID, username string) (*dto.FollowResponse, error) {
	target, err := uc.userRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to find user")
	}
	if target == nil {
		return nil, apperrors.ErrNotFound
	}

	if followerID == target.ID {
		return nil, apperrors.NewAppError(400, "Cannot follow yourself")
	}

	if err := uc.followRepo.Follow(ctx, followerID, target.ID); err != nil {
		return nil, apperrors.Wrap(err, "Failed to follow")
	}

	uc.notifRepo.Create(ctx, &notification.Notification{
		UserID:  target.ID,
		ActorID: &followerID,
		Type:    "follow",
	})

	return &dto.FollowResponse{Following: true}, nil
}

func (uc *UseCase) Unfollow(ctx context.Context, followerID, username string) (*dto.FollowResponse, error) {
	target, err := uc.userRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to find user")
	}
	if target == nil {
		return nil, apperrors.ErrNotFound
	}

	if err := uc.followRepo.Unfollow(ctx, followerID, target.ID); err != nil {
		return nil, apperrors.Wrap(err, "Failed to unfollow")
	}

	return &dto.FollowResponse{Following: false}, nil
}

func (uc *UseCase) GetFollowers(ctx context.Context, username, cursor string, limit int) ([]dto.UserResponse, string, error) {
	target, err := uc.userRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, "", apperrors.Wrap(err, "Failed to find user")
	}
	if target == nil {
		return nil, "", apperrors.ErrNotFound
	}

	follows, nextCursor, err := uc.followRepo.GetFollowers(ctx, target.ID, cursor, limit)
	if err != nil {
		return nil, "", apperrors.Wrap(err, "Failed to get followers")
	}

	users := make([]dto.UserResponse, len(follows))
	for i, f := range follows {
		u, err := uc.userRepo.FindByID(ctx, f.FollowerID)
		if err == nil && u != nil {
			users[i] = dto.UserToResponse(u)
		}
	}

	return users, nextCursor, nil
}

func (uc *UseCase) GetFollowing(ctx context.Context, username, cursor string, limit int) ([]dto.UserResponse, string, error) {
	target, err := uc.userRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, "", apperrors.Wrap(err, "Failed to find user")
	}
	if target == nil {
		return nil, "", apperrors.ErrNotFound
	}

	follows, nextCursor, err := uc.followRepo.GetFollowing(ctx, target.ID, cursor, limit)
	if err != nil {
		return nil, "", apperrors.Wrap(err, "Failed to get following")
	}

	users := make([]dto.UserResponse, len(follows))
	for i, f := range follows {
		u, err := uc.userRepo.FindByID(ctx, f.FollowingID)
		if err == nil && u != nil {
			users[i] = dto.UserToResponse(u)
		}
	}

	return users, nextCursor, nil
}