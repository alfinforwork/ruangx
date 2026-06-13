package hashtag

import (
	"context"

	"github.com/alfinokio/ruangx/internal/domain/hashtag"
	"github.com/alfinokio/ruangx/internal/dto"
	apperrors "github.com/alfinokio/ruangx/pkg/errors"
)

type HashtagRepository interface {
	FindTrending(ctx context.Context, limit int) ([]*hashtag.Hashtag, error)
}

type UseCase struct {
	hashtagRepo HashtagRepository
}

func NewUseCase(hashtagRepo HashtagRepository) *UseCase {
	return &UseCase{hashtagRepo: hashtagRepo}
}

func (uc *UseCase) GetTrending(ctx context.Context, limit int) ([]dto.TrendResponse, error) {
	tags, err := uc.hashtagRepo.FindTrending(ctx, limit)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to get trending hashtags")
	}

	responses := make([]dto.TrendResponse, len(tags))
	for i, t := range tags {
		responses[i] = dto.TrendResponse{
			ID:        t.ID,
			TrendType: "hashtag",
			Name:      "#" + t.Tag,
			PostCount: t.PostCount,
			Score:     float64(t.PostCount),
			Category:  "trending",
			Region:    "ID",
		}
	}

	return responses, nil
}