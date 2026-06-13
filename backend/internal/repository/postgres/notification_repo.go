package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/alfinokio/ruangx/internal/domain/notification"
)

type NotificationRepository struct {
	pool *pgxpool.Pool
}

func NewNotificationRepository(pool *pgxpool.Pool) *NotificationRepository {
	return &NotificationRepository{pool: pool}
}

func (r *NotificationRepository) Create(ctx context.Context, n *notification.Notification) error {
	n.ID = uuid.New().String()
	n.CreatedAt = time.Now()

	_, err := r.pool.Exec(ctx,
		`INSERT INTO notifications (id, user_id, actor_id, type, post_id, room_id, message, is_read, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
		n.ID, n.UserID, n.ActorID, n.Type, n.PostID, n.RoomID, n.Message, n.IsRead, n.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create notification: %w", err)
	}
	return nil
}

func (r *NotificationRepository) FindByUser(ctx context.Context, userID string, cursor string, limit int) ([]*notification.Notification, string, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	sql := `SELECT n.id, n.user_id, n.actor_id, n.type, n.post_id, n.room_id, n.message, n.is_read, n.created_at,
		u.id, u.username, u.display_name, u.avatar_url
		FROM notifications n
		LEFT JOIN users u ON u.id = n.actor_id
		WHERE n.user_id = $1`

	args := []interface{}{userID}
	argIdx := 2

	if cursor != "" {
		sql += fmt.Sprintf(" AND (n.created_at, n.id) < (SELECT created_at, id FROM notifications WHERE id = $%d)", argIdx)
		args = append(args, cursor)
		argIdx++
	}

	args = append(args, limit+1)
	sql += fmt.Sprintf(" ORDER BY n.created_at DESC LIMIT $%d", argIdx)

	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, "", fmt.Errorf("failed to find notifications: %w", err)
	}
	defer rows.Close()

	var notes []*notification.Notification
	for rows.Next() {
		n := &notification.Notification{}
		var actorID *string
		var uID, uUsername, uDisplayName, uAvatarURL *string
		err := rows.Scan(
			&n.ID, &n.UserID, &actorID, &n.Type, &n.PostID, &n.RoomID, &n.Message, &n.IsRead, &n.CreatedAt,
			&uID, &uUsername, &uDisplayName, &uAvatarURL,
		)
		if err != nil {
			return nil, "", fmt.Errorf("failed to scan notification: %w", err)
		}
		n.ActorID = actorID
		if uID != nil {
			n.Actor = &notification.NotifActor{
				ID:          *uID,
				Username:    *uUsername,
				DisplayName: *uDisplayName,
				AvatarURL:   *uAvatarURL,
			}
		}
		notes = append(notes, n)
	}

	var nextCursor string
	hasMore := len(notes) > limit
	if hasMore {
		notes = notes[:limit]
		nextCursor = notes[len(notes)-1].ID
	}

	return notes, nextCursor, nil
}

func (r *NotificationRepository) MarkRead(ctx context.Context, notifID, userID string) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2`,
		notifID, userID,
	)
	if err != nil {
		return fmt.Errorf("failed to mark notification read: %w", err)
	}
	return nil
}

func (r *NotificationRepository) MarkAllRead(ctx context.Context, userID string) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE notifications SET is_read = true WHERE user_id = $1 AND is_read = false`,
		userID,
	)
	if err != nil {
		return fmt.Errorf("failed to mark all notifications read: %w", err)
	}
	return nil
}

func (r *NotificationRepository) CountUnread(ctx context.Context, userID string) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`,
		userID,
	).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to count unread notifications: %w", err)
	}
	return count, nil
}