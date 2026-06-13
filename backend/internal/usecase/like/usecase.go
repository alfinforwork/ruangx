package like

import (
	"context"

	"github.com/alfinokio/ruangx/internal/domain/notification"
	"github.com/alfinokio/ruangx/internal/domain/post"
	"github.com/alfinokio/ruangx/internal/dto"
	apperrors "github.com/alfinokio/ruangx/pkg/errors"
)

type LikeRepository interface {
	Toggle(ctx context.Context, userID, postID string) (bool, error)
}

type PostRepository interface {
	FindByID(ctx context.Context, id string) (*post.Post, error)
	Update(ctx context.Context, p *post.Post) error
}

type NotificationRepository interface {
	Create(ctx context.Context, n *notification.Notification) error
}

type UseCase struct {
	likeRepo LikeRepository
	postRepo PostRepository
	notifRepo NotificationRepository
}

func NewUseCase(likeRepo LikeRepository, postRepo PostRepository, notifRepo NotificationRepository) *UseCase {
	return &UseCase{
		likeRepo:  likeRepo,
		postRepo:  postRepo,
		notifRepo: notifRepo,
	}
}

func (uc *UseCase) ToggleLike(ctx context.Context, userID, postID string) (*dto.LikeToggleResponse, error) {
	p, err := uc.postRepo.FindByID(ctx, postID)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to find post")
	}
	if p == nil {
		return nil, apperrors.ErrNotFound
	}

	liked, err := uc.likeRepo.Toggle(ctx, userID, postID)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to toggle like")
	}

	// Re-fetch to get updated count
	p, _ = uc.postRepo.FindByID(ctx, postID)
	newCount := 0
	if p != nil {
		newCount = p.LikeCount
	}

	// Notify post owner
	if liked && p.UserID != userID {
		uc.notifRepo.Create(ctx, &notification.Notification{
			UserID:  p.UserID,
			ActorID: &userID,
			Type:    "like",
			PostID:  &postID,
		})
	}

	return &dto.LikeToggleResponse{
		Liked:    liked,
		NewCount: newCount,
	}, nil
}