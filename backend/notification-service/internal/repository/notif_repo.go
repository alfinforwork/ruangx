package repository

import (
	"database/sql"

	"github.com/ruangx/notification-service/internal/model"
)

type NotifRepo struct {
	db *sql.DB
}

func NewNotifRepo(db *sql.DB) *NotifRepo {
	return &NotifRepo{db: db}
}

func (r *NotifRepo) GetAll(userID string) ([]*model.Notification, error) {
	rows, err := r.db.Query(
		`SELECT id, user_id, type, reference_id, message, read, created_at
		 FROM notifications WHERE user_id = $1 ORDER BY created_at DESC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifs []*model.Notification
	for rows.Next() {
		n := &model.Notification{}
		if err := rows.Scan(&n.ID, &n.UserID, &n.Type, &n.ReferenceID, &n.Message, &n.Read, &n.CreatedAt); err != nil {
			return nil, err
		}
		notifs = append(notifs, n)
	}
	return notifs, nil
}

func (r *NotifRepo) MarkRead(id string) error {
	_, err := r.db.Exec(`UPDATE notifications SET read = true WHERE id = $1`, id)
	return err
}

func (r *NotifRepo) Create(n *model.Notification) error {
	return r.db.QueryRow(
		`INSERT INTO notifications (user_id, type, reference_id, message) VALUES ($1, $2, $3, $4)
		 RETURNING id, created_at`,
		n.UserID, n.Type, n.ReferenceID, n.Message,
	).Scan(&n.ID, &n.CreatedAt)
}