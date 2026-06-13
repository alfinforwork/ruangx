package message

import (
	"context"
	"time"

	msgdomain "github.com/alfinokio/ruangx/internal/domain/message"
	"github.com/alfinokio/ruangx/internal/domain/user"
	"github.com/alfinokio/ruangx/internal/dto"
	apperrors "github.com/alfinokio/ruangx/pkg/errors"
)

type ConversationRepository interface {
	Create(ctx context.Context, conv *msgdomain.Conversation) error
	FindByUser(ctx context.Context, userID string, cursor string, limit int) ([]*msgdomain.Conversation, string, error)
	FindByID(ctx context.Context, id string) (*msgdomain.Conversation, error)
	FindExisting(ctx context.Context, userID1, userID2 string) (*msgdomain.Conversation, error)
	AddParticipant(ctx context.Context, convID, userID string) error
}

type MessageRepository interface {
	Create(ctx context.Context, msg *msgdomain.Message) error
	FindByConversation(ctx context.Context, convID string, cursor string, limit int) ([]*msgdomain.Message, string, error)
}

type UserRepository interface {
	FindByID(ctx context.Context, id string) (*user.User, error)
}

type UseCase struct {
	convRepo ConversationRepository
	msgRepo  MessageRepository
	userRepo UserRepository
}

func NewUseCase(convRepo ConversationRepository, msgRepo MessageRepository, userRepo UserRepository) *UseCase {
	return &UseCase{
		convRepo: convRepo,
		msgRepo:  msgRepo,
		userRepo: userRepo,
	}
}

func (uc *UseCase) Send(ctx context.Context, senderID string, req dto.SendMessageRequest) (*dto.MessageResponse, error) {
	var convID string

	if req.ConversationID != nil && *req.ConversationID != "" {
		convID = *req.ConversationID
	} else {
		// Find or create conversation
		existing, err := uc.convRepo.FindExisting(ctx, senderID, req.RecipientID)
		if err != nil {
			return nil, apperrors.Wrap(err, "Failed to find existing conversation")
		}
		if existing != nil {
			convID = existing.ID
		} else {
			conv := &msgdomain.Conversation{}
			if err := uc.convRepo.Create(ctx, conv); err != nil {
				return nil, apperrors.Wrap(err, "Failed to create conversation")
			}
			convID = conv.ID
			uc.convRepo.AddParticipant(ctx, convID, senderID)
			uc.convRepo.AddParticipant(ctx, convID, req.RecipientID)
		}
	}

	msg := &msgdomain.Message{
		ConversationID: convID,
		SenderID:       senderID,
		Content:        req.Content,
		ReplyTo:        req.ReplyTo,
	}

	if err := uc.msgRepo.Create(ctx, msg); err != nil {
		return nil, apperrors.Wrap(err, "Failed to send message")
	}

	// Load sender info
	u, _ := uc.userRepo.FindByID(ctx, senderID)
	if u != nil {
		msg.Sender = &msgdomain.MessageSender{
			ID:          u.ID,
			Username:    u.Username,
			DisplayName: u.DisplayName,
			AvatarURL:   u.AvatarURL,
		}
	}

	return &dto.MessageResponse{
		ID:        msg.ID,
		SenderID:  msg.SenderID,
		Content:   msg.Content,
		ReplyTo:   msg.ReplyTo,
		CreatedAt: msg.CreatedAt.Format(time.RFC3339),
	}, nil
}

func (uc *UseCase) GetConversations(ctx context.Context, userID, cursor string, limit int) ([]dto.ConversationResponse, string, error) {
	convs, nextCursor, err := uc.convRepo.FindByUser(ctx, userID, cursor, limit)
	if err != nil {
		return nil, "", apperrors.Wrap(err, "Failed to get conversations")
	}

	responses := make([]dto.ConversationResponse, len(convs))
	for i, conv := range convs {
		responses[i] = dto.ConversationResponse{
			ID:        conv.ID,
			CreatedAt: conv.CreatedAt.Format(time.RFC3339),
			UpdatedAt: conv.UpdatedAt.Format(time.RFC3339),
		}
	}

	return responses, nextCursor, nil
}

func (uc *UseCase) GetMessages(ctx context.Context, convID, cursor string, limit int) ([]dto.MessageResponse, string, error) {
	messages, nextCursor, err := uc.msgRepo.FindByConversation(ctx, convID, cursor, limit)
	if err != nil {
		return nil, "", apperrors.Wrap(err, "Failed to get messages")
	}

	responses := make([]dto.MessageResponse, len(messages))
	for i, msg := range messages {
		responses[i] = dto.MessageResponse{
			ID:        msg.ID,
			SenderID:  msg.SenderID,
			Content:   msg.Content,
			ReplyTo:   msg.ReplyTo,
			CreatedAt: msg.CreatedAt.Format(time.RFC3339),
		}
		if msg.Sender != nil {
			responses[i].Sender = &dto.UserResponse{
				ID:          msg.Sender.ID,
				Username:    msg.Sender.Username,
				DisplayName: msg.Sender.DisplayName,
				AvatarURL:   msg.Sender.AvatarURL,
			}
		}
	}

	return responses, nextCursor, nil
}