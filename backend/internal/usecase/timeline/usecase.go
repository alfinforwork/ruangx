package timeline

import (
	"context"

	"github.com/alfinokio/ruangx/internal/domain/follow"
	"github.com/alfinokio/ruangx/internal/domain/post"
	"github.com/alfinokio/ruangx/internal/domain/user"
	"github.com/alfinokio/ruangx/internal/dto"
	apperrors "github.com/alfinokio/ruangx/pkg/errors"
)

type FollowRepository interface {
	GetFollowing(ctx context.Context, userID string, cursor string, limit int) ([]*follow.Follow, string, error)
}

type PostRepository interface {
	FindByUser(ctx context.Context, userID string, cursor string, limit int) ([]*post.Post, string, error)
	FindFeed(ctx context.Context, userID string, cursor string, limit int) ([]*post.Post, string, error)
}

type UserRepository interface {
	FindByID(ctx context.Context, id string) (*user.User, error)
}

type UseCase struct {
	followRepo  FollowRepository
	postRepo    PostRepository
	userRepo    UserRepository
}

func NewUseCase(followRepo FollowRepository, postRepo PostRepository, userRepo UserRepository) *UseCase {
	return &UseCase{
		followRepo: followRepo,
		postRepo:   postRepo,
		userRepo:   userRepo,
	}
}

func (uc *UseCase) BuildFeed(ctx context.Context, userID, cursor string, limit int) (*dto.FeedResponse, error) {
	// Use the postRepository.FindFeed which already has the join
	posts, nextCursor, err := uc.postRepo.FindFeed(ctx, userID, cursor, limit)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to build feed")
	}

	responses := make([]dto.PostResponse, len(posts))
	for i, p := range posts {
		responses[i] = dto.PostToResponseWithUser(p)
	}

	hasMore := nextCursor != ""
	return &dto.FeedResponse{
		Posts:   responses,
		Cursor:  nextCursor,
		HasMore: hasMore,
		Limit:   limit,
	}, nil
}