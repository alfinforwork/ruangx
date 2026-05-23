package model

import "time"

type Notification struct {
	ID          string    `json:"id" db:"id"`
	UserID      string    `json:"userId" db:"user_id"`
	Type        string    `json:"type" db:"type"`
	ReferenceID *string   `json:"referenceId" db:"reference_id"`
	Message     string    `json:"message" db:"message"`
	Read        bool      `json:"read" db:"read"`
	CreatedAt   time.Time `json:"createdAt" db:"created_at"`
}