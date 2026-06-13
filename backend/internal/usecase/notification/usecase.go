package notification

import (
	"context"

	notifdomain "github.com/alfinokio/ruangx/internal/domain/notification"
	"github.com/alfinokio/ruangx/internal/dto"
	apperrors "github.com/alfinokio/ruangx/pkg/errors"
)

type NotificationRepository interface {
	FindByUser(ctx context.Context, userID string, cursor string, limit int) ([]*notifdomain.Notification, string, error)
	MarkRead(ctx context.Context, notifID, userID string) error
	MarkAllRead(ctx context.Context, userID string) error
	CountUnread(ctx context.Context, userID string) (int, error)
}

type UseCase struct {
	notifRepo NotificationRepository
}

func NewUseCase(notifRepo NotificationRepository) *UseCase {
	return &UseCase{notifRepo: notifRepo}
}

func (uc *UseCase) GetNotifications(ctx context.Context, userID, cursor string, limit int) ([]dto.NotificationResponse, string, error) {
	notifs, nextCursor, err := uc.notifRepo.FindByUser(ctx, userID, cursor, limit)
	if err != nil {
		return nil, "", apperrors.Wrap(err, "Failed to get notifications")
	}

	responses := make([]dto.NotificationResponse, len(notifs))
	for i, n := range notifs {
		responses[i] = dto.NotifToResponse(n)
	}

	return responses, nextCursor, nil
}

func (uc *UseCase) MarkRead(ctx context.Context, notifID, userID string) error {
	if err := uc.notifRepo.MarkRead(ctx, notifID, userID); err != nil {
		return apperrors.Wrap(err, "Failed to mark notification read")
	}
	return nil
}

func (uc *UseCase) MarkAllRead(ctx context.Context, userID string) error {
	if err := uc.notifRepo.MarkAllRead(ctx, userID); err != nil {
		return apperrors.Wrap(err, "Failed to mark all notifications read")
	}
	return nil
}

func (uc *UseCase) CountUnread(ctx context.Context, userID string) (*dto.UnreadCountResponse, error) {
	count, err := uc.notifRepo.CountUnread(ctx, userID)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to count unread")
	}

	return &dto.UnreadCountResponse{Count: count}, nil
}