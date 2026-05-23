package repository

import (
	"database/sql"

	"github.com/ruangx/chat-service/internal/model"
)

type ChatRepo struct {
	db *sql.DB
}

func NewChatRepo(db *sql.DB) *ChatRepo {
	return &ChatRepo{db: db}
}

func (r *ChatRepo) GetConversations(userID string) ([]*model.User, error) {
	rows, err := r.db.Query(
		`SELECT DISTINCT u.id, u.name, u.avatar_url
		 FROM users u
		 JOIN messages m ON (m.sender_id = u.id OR m.receiver_id = u.id)
		 WHERE (m.sender_id = $1 OR m.receiver_id = $1) AND u.id != $1`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*model.User
	for rows.Next() {
		u := &model.User{}
		if err := rows.Scan(&u.ID, &u.Name, &u.AvatarURL); err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	return users, nil
}

func (r *ChatRepo) GetMessages(userID, otherID string) ([]*model.Message, error) {
	rows, err := r.db.Query(
		`SELECT id, sender_id, receiver_id, content, read_at, created_at
		 FROM messages
		 WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)
		 ORDER BY created_at`, userID, otherID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var msgs []*model.Message
	for rows.Next() {
		m := &model.Message{}
		if err := rows.Scan(&m.ID, &m.SenderID, &m.ReceiverID, &m.Content, &m.ReadAt, &m.CreatedAt); err != nil {
			return nil, err
		}
		msgs = append(msgs, m)
	}
	return msgs, nil
}

func (r *ChatRepo) SendMessage(msg *model.Message) error {
	return r.db.QueryRow(
		`INSERT INTO messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)
		 RETURNING id, created_at`,
		msg.SenderID, msg.ReceiverID, msg.Content,
	).Scan(&msg.ID, &msg.CreatedAt)
}