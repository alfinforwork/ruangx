package user

import (
	"context"

	"github.com/alfinokio/ruangx/internal/domain/user"
	"github.com/alfinokio/ruangx/internal/dto"
	apperrors "github.com/alfinokio/ruangx/pkg/errors"
)

type UserRepository interface {
	FindByID(ctx context.Context, id string) (*user.User, error)
	FindByUsername(ctx context.Context, username string) (*user.User, error)
	Update(ctx context.Context, u *user.User) error
	Search(ctx context.Context, query string, cursor string, limit int) ([]*user.User, string, error)
}

type UseCase struct {
	userRepo UserRepository
}

func NewUseCase(userRepo UserRepository) *UseCase {
	return &UseCase{userRepo: userRepo}
}

func (uc *UseCase) GetProfile(ctx context.Context, username string) (*dto.UserResponse, error) {
	u, err := uc.userRepo.FindByUsername(ctx, username)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to find user")
	}
	if u == nil {
		return nil, apperrors.ErrNotFound
	}

	resp := dto.UserToResponse(u)
	return &resp, nil
}

func (uc *UseCase) UpdateProfile(ctx context.Context, userID string, req dto.UpdateProfileRequest) (*dto.UserResponse, error) {
	u, err := uc.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to find user")
	}
	if u == nil {
		return nil, apperrors.ErrNotFound
	}

	if req.DisplayName != "" {
		u.DisplayName = req.DisplayName
	}
	if req.Bio != "" {
		u.Bio = req.Bio
	}
	if req.AvatarURL != "" {
		u.AvatarURL = req.AvatarURL
	}
	if req.BannerURL != "" {
		u.BannerURL = req.BannerURL
	}
	if req.Website != "" {
		u.Website = req.Website
	}
	if req.Location != "" {
		u.Location = req.Location
	}
	if req.IsPrivate != nil {
		u.IsPrivate = *req.IsPrivate
	}

	if err := uc.userRepo.Update(ctx, u); err != nil {
		return nil, apperrors.Wrap(err, "Failed to update profile")
	}

	resp := dto.UserToResponse(u)
	return &resp, nil
}

func (uc *UseCase) SearchUsers(ctx context.Context, query, cursor string, limit int) ([]dto.UserResponse, string, error) {
	users, nextCursor, err := uc.userRepo.Search(ctx, query, cursor, limit)
	if err != nil {
		return nil, "", apperrors.Wrap(err, "Failed to search users")
	}

	responses := make([]dto.UserResponse, len(users))
	for i, u := range users {
		responses[i] = dto.UserToResponse(u)
	}

	return responses, nextCursor, nil
}