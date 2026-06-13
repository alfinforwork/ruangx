package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/alfinokio/ruangx/internal/domain/room"
)

type RoomRepository struct {
	pool *pgxpool.Pool
}

func NewRoomRepository(pool *pgxpool.Pool) *RoomRepository {
	return &RoomRepository{pool: pool}
}

func (r *RoomRepository) Create(ctx context.Context, rm *room.Room) error {
	rm.ID = uuid.New().String()
	now := time.Now()
	rm.CreatedAt = now
	rm.UpdatedAt = now

	_, err := r.pool.Exec(ctx,
		`INSERT INTO rooms (id, name, description, icon, banner_url, color, created_by, member_count, post_count, is_private, is_nsfw, created_at, updated_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
		rm.ID, rm.Name, rm.Description, rm.Icon, rm.BannerURL, rm.Color, rm.CreatedBy,
		rm.MemberCount, rm.PostCount, rm.IsPrivate, rm.IsNSFW, rm.CreatedAt, rm.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create room: %w", err)
	}
	return nil
}

func (r *RoomRepository) FindByID(ctx context.Context, id string) (*room.Room, error) {
	rm := &room.Room{}
	err := r.pool.QueryRow(ctx,
		`SELECT id, name, description, icon, banner_url, color, created_by, member_count, post_count, is_private, is_nsfw, created_at, updated_at
		FROM rooms WHERE id = $1`, id,
	).Scan(
		&rm.ID, &rm.Name, &rm.Description, &rm.Icon, &rm.BannerURL, &rm.Color, &rm.CreatedBy,
		&rm.MemberCount, &rm.PostCount, &rm.IsPrivate, &rm.IsNSFW, &rm.CreatedAt, &rm.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find room: %w", err)
	}
	return rm, nil
}

func (r *RoomRepository) FindByName(ctx context.Context, name string) (*room.Room, error) {
	rm := &room.Room{}
	err := r.pool.QueryRow(ctx,
		`SELECT id, name, description, icon, banner_url, color, created_by, member_count, post_count, is_private, is_nsfw, created_at, updated_at
		FROM rooms WHERE name = $1`, name,
	).Scan(
		&rm.ID, &rm.Name, &rm.Description, &rm.Icon, &rm.BannerURL, &rm.Color, &rm.CreatedBy,
		&rm.MemberCount, &rm.PostCount, &rm.IsPrivate, &rm.IsNSFW, &rm.CreatedAt, &rm.UpdatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find room by name: %w", err)
	}
	return rm, nil
}

func (r *RoomRepository) FindPopular(ctx context.Context, cursor string, limit int) ([]*room.Room, string, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	sql := `SELECT id, name, description, icon, banner_url, color, created_by, member_count, post_count, is_private, is_nsfw, created_at, updated_at
		FROM rooms`
	args := []interface{}{}

	if cursor != "" {
		sql += " WHERE id > $1"
		args = append(args, cursor)
	}

	args = append(args, limit+1)
	sql += " ORDER BY member_count DESC LIMIT $2"

	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, "", fmt.Errorf("failed to find popular rooms: %w", err)
	}
	defer rows.Close()

	var rooms []*room.Room
	for rows.Next() {
		rm := &room.Room{}
		if err := rows.Scan(
			&rm.ID, &rm.Name, &rm.Description, &rm.Icon, &rm.BannerURL, &rm.Color, &rm.CreatedBy,
			&rm.MemberCount, &rm.PostCount, &rm.IsPrivate, &rm.IsNSFW, &rm.CreatedAt, &rm.UpdatedAt,
		); err != nil {
			return nil, "", fmt.Errorf("failed to scan room: %w", err)
		}
		rooms = append(rooms, rm)
	}

	var nextCursor string
	hasMore := len(rooms) > limit
	if hasMore {
		rooms = rooms[:limit]
		nextCursor = rooms[len(rooms)-1].ID
	}

	return rooms, nextCursor, nil
}

func (r *RoomRepository) Join(ctx context.Context, roomID, userID string) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `INSERT INTO room_members (room_id, user_id, role) VALUES ($1, $2, 'member') ON CONFLICT DO NOTHING`,
		roomID, userID)
	if err != nil {
		return fmt.Errorf("failed to join room: %w", err)
	}

	_, err = tx.Exec(ctx, `UPDATE rooms SET member_count = (SELECT COUNT(*) FROM room_members WHERE room_id = $1) WHERE id = $1`, roomID)
	if err != nil {
		return fmt.Errorf("failed to update member count: %w", err)
	}

	return tx.Commit(ctx)
}

func (r *RoomRepository) Leave(ctx context.Context, roomID, userID string) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("failed to begin tx: %w", err)
	}
	defer tx.Rollback(ctx)

	_, err = tx.Exec(ctx, `DELETE FROM room_members WHERE room_id = $1 AND user_id = $2`, roomID, userID)
	if err != nil {
		return fmt.Errorf("failed to leave room: %w", err)
	}

	_, err = tx.Exec(ctx, `UPDATE rooms SET member_count = (SELECT COUNT(*) FROM room_members WHERE room_id = $1) WHERE id = $1`, roomID)
	if err != nil {
		return fmt.Errorf("failed to update member count: %w", err)
	}

	return tx.Commit(ctx)
}

func (r *RoomRepository) Update(ctx context.Context, rm *room.Room) error {
	rm.UpdatedAt = time.Now()
	_, err := r.pool.Exec(ctx,
		`UPDATE rooms SET name=$2, description=$3, icon=$4, banner_url=$5, color=$6, is_private=$9, is_nsfw=$10, updated_at=$11 WHERE id=$1`,
		rm.ID, rm.Name, rm.Description, rm.Icon, rm.BannerURL, rm.Color, rm.IsPrivate, rm.IsNSFW, rm.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to update room: %w", err)
	}
	return nil
}