package trend

import (
	"context"

	trenddomain "github.com/alfinokio/ruangx/internal/domain/trend"
	"github.com/alfinokio/ruangx/internal/dto"
	apperrors "github.com/alfinokio/ruangx/pkg/errors"
)

type TrendRepository interface {
	GetTrending(ctx context.Context, limit int) ([]*trenddomain.Trend, error)
}

type UseCase struct {
	trendRepo TrendRepository
}

func NewUseCase(trendRepo TrendRepository) *UseCase {
	return &UseCase{trendRepo: trendRepo}
}

func (uc *UseCase) GetTrending(ctx context.Context, limit int) ([]dto.TrendResponse, error) {
	trends, err := uc.trendRepo.GetTrending(ctx, limit)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to get trends")
	}

	responses := make([]dto.TrendResponse, len(trends))
	for i, t := range trends {
		responses[i] = dto.TrendToResponse(t)
	}

	return responses, nil
}