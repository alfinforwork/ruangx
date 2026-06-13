package dto

type SendMessageRequest struct {
	ConversationID *string `json:"conversation_id" validate:"omitempty,uuid"`
	RecipientID    string  `json:"recipient_id" validate:"required,uuid"`
	Content        string  `json:"content" validate:"required,min=1,max=5000"`
	ReplyTo        *string `json:"reply_to" validate:"omitempty,uuid"`
}

type ConversationResponse struct {
	ID           string             `json:"id"`
	Participants []UserResponse     `json:"participants,omitempty"`
	LastMessage  *MessageResponse   `json:"last_message,omitempty"`
	CreatedAt    string             `json:"created_at"`
	UpdatedAt    string             `json:"updated_at"`
}

type MessageResponse struct {
	ID        string    `json:"id"`
	SenderID  string    `json:"sender_id"`
	Content   string    `json:"content"`
	ReplyTo   *string   `json:"reply_to,omitempty"`
	CreatedAt string    `json:"created_at"`
	Sender    *UserResponse `json:"sender,omitempty"`
}