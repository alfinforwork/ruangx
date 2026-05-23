package repository

import (
	"database/sql"
	"time"

	"github.com/ruangx/auth-service/internal/model"
)

type AuthRepo struct {
	db *sql.DB
}

func NewAuthRepo(db *sql.DB) *AuthRepo {
	return &AuthRepo{db: db}
}

func (r *AuthRepo) Create(user *model.User) error {
	return r.db.QueryRow(
		`INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)
		 RETURNING id, created_at, updated_at`,
		user.Name, user.Email, user.PasswordHash,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

func (r *AuthRepo) FindByEmail(email string) (*model.User, error) {
	u := &model.User{}
	err := r.db.QueryRow(
		`SELECT id, name, email, password_hash, avatar_url, banner_url, bio, created_at, updated_at
		 FROM users WHERE email = $1`, email,
	).Scan(&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.AvatarURL, &u.BannerURL, &u.Bio, &u.CreatedAt, &u.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return u, err
}

func (r *AuthRepo) FindByID(id string) (*model.User, error) {
	u := &model.User{}
	err := r.db.QueryRow(
		`SELECT id, name, email, password_hash, avatar_url, banner_url, bio, created_at, updated_at
		 FROM users WHERE id = $1`, id,
	).Scan(&u.ID, &u.Name, &u.Email, &u.PasswordHash, &u.AvatarURL, &u.BannerURL, &u.Bio, &u.CreatedAt, &u.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	return u, err
}

func (r *AuthRepo) Update(id string, updates map[string]any) error {
	updates["updated_at"] = time.Now()
	// simplified — in production use dynamic query builder
	_, err := r.db.Exec(
		`UPDATE users SET name = COALESCE($2, name), bio = COALESCE($3, bio),
		 avatar_url = COALESCE($4, avatar_url), banner_url = COALESCE($5, banner_url),
		 updated_at = now() WHERE id = $1`,
		id, updates["name"], updates["bio"], updates["avatar_url"], updates["banner_url"],
	)
	return err
}

func (r *AuthRepo) UpdatePassword(id, hash string) error {
	_, err := r.db.Exec(`UPDATE users SET password_hash = $2, updated_at = now() WHERE id = $1`, id, hash)
	return err
}