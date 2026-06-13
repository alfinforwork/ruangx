package room

import (
	"context"

	"github.com/alfinokio/ruangx/internal/domain/room"
	"github.com/alfinokio/ruangx/internal/dto"
	apperrors "github.com/alfinokio/ruangx/pkg/errors"
)

type RoomRepository interface {
	Create(ctx context.Context, r *room.Room) error
	FindByID(ctx context.Context, id string) (*room.Room, error)
	FindByName(ctx context.Context, name string) (*room.Room, error)
	FindPopular(ctx context.Context, cursor string, limit int) ([]*room.Room, string, error)
	Join(ctx context.Context, roomID, userID string) error
	Leave(ctx context.Context, roomID, userID string) error
	Update(ctx context.Context, r *room.Room) error
}

type UseCase struct {
	roomRepo RoomRepository
}

func NewUseCase(roomRepo RoomRepository) *UseCase {
	return &UseCase{roomRepo: roomRepo}
}

func (uc *UseCase) Create(ctx context.Context, userID string, req dto.CreateRoomRequest) (*dto.RoomResponse, error) {
	existing, _ := uc.roomRepo.FindByName(ctx, req.Name)
	if existing != nil {
		return nil, apperrors.NewAppError(409, "Room name already taken")
	}

	r := &room.Room{
		Name:        req.Name,
		Description: req.Description,
		Icon:        req.Icon,
		Color:       req.Color,
		IsPrivate:   req.IsPrivate,
		IsNSFW:      req.IsNSFW,
		CreatedBy:   &userID,
	}

	if err := uc.roomRepo.Create(ctx, r); err != nil {
		return nil, apperrors.Wrap(err, "Failed to create room")
	}

	// Auto-join creator as owner
	uc.roomRepo.Join(ctx, r.ID, userID)

	resp := dto.RoomToResponse(r)
	resp.IsMember = true
	return &resp, nil
}

func (uc *UseCase) GetPopular(ctx context.Context, cursor string, limit int) ([]dto.RoomResponse, string, error) {
	rooms, nextCursor, err := uc.roomRepo.FindPopular(ctx, cursor, limit)
	if err != nil {
		return nil, "", apperrors.Wrap(err, "Failed to get popular rooms")
	}

	responses := make([]dto.RoomResponse, len(rooms))
	for i, r := range rooms {
		responses[i] = dto.RoomToResponse(r)
	}

	return responses, nextCursor, nil
}

func (uc *UseCase) GetByID(ctx context.Context, roomID, userID string) (*dto.RoomResponse, error) {
	r, err := uc.roomRepo.FindByID(ctx, roomID)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to find room")
	}
	if r == nil {
		return nil, apperrors.ErrNotFound
	}

	resp := dto.RoomToResponse(r)
	return &resp, nil
}

func (uc *UseCase) Join(ctx context.Context, roomID, userID string) (*dto.JoinRoomResponse, error) {
	r, err := uc.roomRepo.FindByID(ctx, roomID)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to find room")
	}
	if r == nil {
		return nil, apperrors.ErrNotFound
	}

	if err := uc.roomRepo.Join(ctx, roomID, userID); err != nil {
		return nil, apperrors.Wrap(err, "Failed to join room")
	}

	return &dto.JoinRoomResponse{Joined: true}, nil
}

func (uc *UseCase) Leave(ctx context.Context, roomID, userID string) (*dto.JoinRoomResponse, error) {
	if err := uc.roomRepo.Leave(ctx, roomID, userID); err != nil {
		return nil, apperrors.Wrap(err, "Failed to leave room")
	}

	return &dto.JoinRoomResponse{Joined: false}, nil
}