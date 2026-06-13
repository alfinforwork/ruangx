package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/alfinokio/ruangx/internal/domain/user"
)

type UserRepository struct {
	pool *pgxpool.Pool
}

func NewUserRepository(pool *pgxpool.Pool) *UserRepository {
	return &UserRepository{pool: pool}
}

func (r *UserRepository) Create(ctx context.Context, u *user.User) error {
	u.ID = uuid.New().String()
	now := time.Now()
	u.CreatedAt = now
	u.UpdatedAt = now

	_, err := r.pool.Exec(ctx,
		`INSERT INTO users (id, username, display_name, email, password_hash, bio, avatar_url, banner_url, website, location, is_verified, is_private, follower_count, following_count, post_count, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
		u.ID, u.Username, u.DisplayName, u.Email, u.PasswordHash, u.Bio, u.AvatarURL, u.BannerURL,
		u.Website, u.Location, u.IsVerified, u.IsPrivate, u.FollowerCount, u.FollowingCount, u.PostCount, u.CreatedAt, u.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	return nil
}

func (r *UserRepository) FindByID(ctx context.Context, id string) (*user.User, error) {
	u := &user.User{}
	err := r.pool.QueryRow(ctx,
		`SELECT id, username, display_name, email, password_hash, bio, avatar_url, banner_url, website, location, is_verified, is_private, follower_count, following_count, post_count, created_at, updated_at
		FROM users WHERE id = $1`, id,
	).Scan(
		&u.ID, &u.Username, &u.DisplayName, &u.Email, &u.PasswordHash, &u.Bio, &u.AvatarURL, &u.BannerURL,
		&u.Website, &u.Location, &u.IsVerified, &u.IsPrivate, &u.FollowerCount, &u.FollowingCount, &u.PostCount, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find user by id: %w", err)
	}
	return u, nil
}

func (r *UserRepository) FindByUsername(ctx context.Context, username string) (*user.User, error) {
	u := &user.User{}
	err := r.pool.QueryRow(ctx,
		`SELECT id, username, display_name, email, password_hash, bio, avatar_url, banner_url, website, location, is_verified, is_private, follower_count, following_count, post_count, created_at, updated_at
		FROM users WHERE username = $1`, username,
	).Scan(
		&u.ID, &u.Username, &u.DisplayName, &u.Email, &u.PasswordHash, &u.Bio, &u.AvatarURL, &u.BannerURL,
		&u.Website, &u.Location, &u.IsVerified, &u.IsPrivate, &u.FollowerCount, &u.FollowingCount, &u.PostCount, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find user by username: %w", err)
	}
	return u, nil
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*user.User, error) {
	u := &user.User{}
	err := r.pool.QueryRow(ctx,
		`SELECT id, username, display_name, email, password_hash, bio, avatar_url, banner_url, website, location, is_verified, is_private, follower_count, following_count, post_count, created_at, updated_at
		FROM users WHERE email = $1`, email,
	).Scan(
		&u.ID, &u.Username, &u.DisplayName, &u.Email, &u.PasswordHash, &u.Bio, &u.AvatarURL, &u.BannerURL,
		&u.Website, &u.Location, &u.IsVerified, &u.IsPrivate, &u.FollowerCount, &u.FollowingCount, &u.PostCount, &u.CreatedAt, &u.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find user by email: %w", err)
	}
	return u, nil
}

func (r *UserRepository) Update(ctx context.Context, u *user.User) error {
	u.UpdatedAt = time.Now()
	_, err := r.pool.Exec(ctx,
		`UPDATE users SET display_name=$2, bio=$3, avatar_url=$4, banner_url=$5, website=$6, location=$7, is_private=$8, updated_at=$9 WHERE id=$1`,
		u.ID, u.DisplayName, u.Bio, u.AvatarURL, u.BannerURL, u.Website, u.Location, u.IsPrivate, u.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to update user: %w", err)
	}
	return nil
}

func (r *UserRepository) Search(ctx context.Context, query string, cursor string, limit int) ([]*user.User, string, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	sql := `SELECT id, username, display_name, email, password_hash, bio, avatar_url, banner_url, website, location, is_verified, is_private, follower_count, following_count, post_count, created_at, updated_at
		FROM users
		WHERE (username ILIKE $1 OR display_name ILIKE $1)
		AND id > $2
		ORDER BY id ASC
		LIMIT $3`

	if cursor == "" {
		cursor = "00000000-0000-0000-0000-000000000000"
	}

	rows, err := r.pool.Query(ctx, sql, "%"+query+"%", cursor, limit+1)
	if err != nil {
		return nil, "", fmt.Errorf("failed to search users: %w", err)
	}
	defer rows.Close()

	var users []*user.User
	for rows.Next() {
		u := &user.User{}
		if err := rows.Scan(
			&u.ID, &u.Username, &u.DisplayName, &u.Email, &u.PasswordHash, &u.Bio, &u.AvatarURL, &u.BannerURL,
			&u.Website, &u.Location, &u.IsVerified, &u.IsPrivate, &u.FollowerCount, &u.FollowingCount, &u.PostCount, &u.CreatedAt, &u.UpdatedAt,
		); err != nil {
			return nil, "", fmt.Errorf("failed to scan user: %w", err)
		}
		users = append(users, u)
	}

	var nextCursor string
	hasMore := len(users) > limit
	if hasMore {
		users = users[:limit]
		nextCursor = users[len(users)-1].ID
	}

	return users, nextCursor, nil
}