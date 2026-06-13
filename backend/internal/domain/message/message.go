package message

import (
	"context"
	"time"
)

type Conversation struct {
	ID        string    `json:"id"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	// Joined
	Participants []ConversationParticipant `json:"participants,omitempty"`
	LastMessage  *Message                  `json:"last_message,omitempty"`
}

type ConversationParticipant struct {
	ID             string    `json:"id"`
	ConversationID string    `json:"conversation_id"`
	UserID         string    `json:"user_id"`
	LastReadAt     time.Time `json:"last_read_at"`
}

type Message struct {
	ID             string    `json:"id"`
	ConversationID string    `json:"conversation_id"`
	SenderID       string    `json:"sender_id"`
	Content        string    `json:"content"`
	ReplyTo        *string   `json:"reply_to,omitempty"`
	CreatedAt      time.Time `json:"created_at"`
	// Joined
	Sender *MessageSender `json:"sender,omitempty"`
}

type MessageSender struct {
	ID          string `json:"id"`
	Username    string `json:"username"`
	DisplayName string `json:"display_name"`
	AvatarURL   string `json:"avatar_url"`
}

type ConversationRepository interface {
	Create(ctx context.Context, conv *Conversation) error
	FindByUser(ctx context.Context, userID string, cursor string, limit int) ([]*Conversation, string, error)
	FindByID(ctx context.Context, id string) (*Conversation, error)
	FindExisting(ctx context.Context, userID1, userID2 string) (*Conversation, error)
	AddParticipant(ctx context.Context, convID, userID string) error
}

type MessageRepository interface {
	Create(ctx context.Context, msg *Message) error
	FindByConversation(ctx context.Context, convID string, cursor string, limit int) ([]*Message, string, error)
	FindByID(ctx context.Context, id string) (*Message, error)
}