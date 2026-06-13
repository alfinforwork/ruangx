package bookmark

import (
	"context"

	"github.com/alfinokio/ruangx/internal/domain/post"
	"github.com/alfinokio/ruangx/internal/dto"
	apperrors "github.com/alfinokio/ruangx/pkg/errors"
)

type BookmarkRepository interface {
	Toggle(ctx context.Context, userID, postID string) (bool, error)
}

type PostRepository interface {
	FindByID(ctx context.Context, id string) (*post.Post, error)
}

type UseCase struct {
	bookmarkRepo BookmarkRepository
	postRepo     PostRepository
}

func NewUseCase(bookmarkRepo BookmarkRepository, postRepo PostRepository) *UseCase {
	return &UseCase{
		bookmarkRepo: bookmarkRepo,
		postRepo:     postRepo,
	}
}

func (uc *UseCase) ToggleBookmark(ctx context.Context, userID, postID string) (*dto.BookmarkToggleResponse, error) {
	p, err := uc.postRepo.FindByID(ctx, postID)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to find post")
	}
	if p == nil {
		return nil, apperrors.ErrNotFound
	}

	bookmarked, err := uc.bookmarkRepo.Toggle(ctx, userID, postID)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to toggle bookmark")
	}

	return &dto.BookmarkToggleResponse{
		Bookmarked: bookmarked,
	}, nil
}