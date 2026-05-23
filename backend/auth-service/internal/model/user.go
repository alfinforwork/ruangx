package model

import "time"

type User struct {
	ID           string    `json:"id" db:"id"`
	Name         string    `json:"name" db:"name"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	AvatarURL    *string   `json:"avatarUrl" db:"avatar_url"`
	BannerURL    *string   `json:"bannerUrl" db:"banner_url"`
	Bio          *string   `json:"bio" db:"bio"`
	CreatedAt    time.Time `json:"createdAt" db:"created_at"`
	UpdatedAt    time.Time `json:"updatedAt" db:"updated_at"`
}