package service

import (
	"github.com/ruangx/notification-service/internal/model"
	"github.com/ruangx/notification-service/internal/repository"
)

type NotifService struct {
	repo *repository.NotifRepo
}

func NewNotifService(repo *repository.NotifRepo) *NotifService {
	return &NotifService{repo: repo}
}

func (s *NotifService) GetAll(userID string) ([]*model.Notification, error) {
	return s.repo.GetAll(userID)
}

func (s *NotifService) MarkRead(id string) error {
	return s.repo.MarkRead(id)
}

func (s *NotifService) Create(userID, notifType, message string, referenceID *string) error {
	n := &model.Notification{
		UserID: userID, Type: notifType, Message: message, ReferenceID: referenceID,
	}
	return s.repo.Create(n)
}