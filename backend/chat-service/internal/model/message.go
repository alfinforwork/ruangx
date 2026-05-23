package model

import "time"

type Message struct {
	ID         string     `json:"id" db:"id"`
	SenderID   string     `json:"senderId" db:"sender_id"`
	ReceiverID string     `json:"receiverId" db:"receiver_id"`
	Content    string     `json:"content" db:"content"`
	ReadAt     *time.Time `json:"readAt" db:"read_at"`
	CreatedAt  time.Time  `json:"createdAt" db:"created_at"`
}

type User struct {
	ID        string  `json:"id" db:"id"`
	Name      string  `json:"name" db:"name"`
	AvatarURL *string `json:"avatarUrl" db:"avatar_url"`
}