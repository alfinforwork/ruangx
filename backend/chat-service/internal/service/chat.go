package service

import (
	"github.com/ruangx/chat-service/internal/model"
	"github.com/ruangx/chat-service/internal/repository"
)

type ChatService struct {
	repo *repository.ChatRepo
}

func NewChatService(repo *repository.ChatRepo) *ChatService {
	return &ChatService{repo: repo}
}

func (s *ChatService) GetConversations(userID string) ([]*model.User, error) {
	return s.repo.GetConversations(userID)
}

func (s *ChatService) GetMessages(userID, otherID string) ([]*model.Message, error) {
	return s.repo.GetMessages(userID, otherID)
}

func (s *ChatService) SendMessage(senderID, receiverID, content string) (*model.Message, error) {
	msg := &model.Message{SenderID: senderID, ReceiverID: receiverID, Content: content}
	if err := s.repo.SendMessage(msg); err != nil {
		return nil, err
	}
	return msg, nil
}