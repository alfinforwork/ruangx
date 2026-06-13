package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/alfinokio/ruangx/internal/domain/message"
)

type ConversationRepository struct {
	pool *pgxpool.Pool
}

func NewConversationRepository(pool *pgxpool.Pool) *ConversationRepository {
	return &ConversationRepository{pool: pool}
}

func (r *ConversationRepository) Create(ctx context.Context, conv *message.Conversation) error {
	conv.ID = uuid.New().String()
	now := time.Now()
	conv.CreatedAt = now
	conv.UpdatedAt = now

	_, err := r.pool.Exec(ctx,
		`INSERT INTO conversations (id, created_at, updated_at) VALUES ($1, $2, $3)`,
		conv.ID, conv.CreatedAt, conv.UpdatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create conversation: %w", err)
	}
	return nil
}

func (r *ConversationRepository) FindByUser(ctx context.Context, userID string, cursor string, limit int) ([]*message.Conversation, string, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	sql := `SELECT DISTINCT c.id, c.created_at, c.updated_at
		FROM conversations c
		JOIN conversation_participants cp ON cp.conversation_id = c.id
		WHERE cp.user_id = $1`

	args := []interface{}{userID}
	argIdx := 2

	if cursor != "" {
		sql += fmt.Sprintf(" AND c.id > $%d", argIdx)
		args = append(args, cursor)
		argIdx++
	}

	args = append(args, limit+1)
	sql += fmt.Sprintf(" ORDER BY c.updated_at DESC LIMIT $%d", argIdx)

	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, "", fmt.Errorf("failed to find conversations: %w", err)
	}
	defer rows.Close()

	var conversations []*message.Conversation
	for rows.Next() {
		conv := &message.Conversation{}
		if err := rows.Scan(&conv.ID, &conv.CreatedAt, &conv.UpdatedAt); err != nil {
			return nil, "", fmt.Errorf("failed to scan conversation: %w", err)
		}
		conversations = append(conversations, conv)
	}

	var nextCursor string
	hasMore := len(conversations) > limit
	if hasMore {
		conversations = conversations[:limit]
		nextCursor = conversations[len(conversations)-1].ID
	}

	return conversations, nextCursor, nil
}

func (r *ConversationRepository) FindByID(ctx context.Context, id string) (*message.Conversation, error) {
	conv := &message.Conversation{}
	err := r.pool.QueryRow(ctx,
		`SELECT id, created_at, updated_at FROM conversations WHERE id = $1`, id,
	).Scan(&conv.ID, &conv.CreatedAt, &conv.UpdatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find conversation: %w", err)
	}
	return conv, nil
}

func (r *ConversationRepository) FindExisting(ctx context.Context, userID1, userID2 string) (*message.Conversation, error) {
	conv := &message.Conversation{}
	err := r.pool.QueryRow(ctx,
		`SELECT c.id, c.created_at, c.updated_at
		FROM conversations c
		WHERE (
			SELECT COUNT(*) FROM conversation_participants WHERE conversation_id = c.id AND user_id IN ($1, $2)
		) = 2
		LIMIT 1`,
		userID1, userID2,
	).Scan(&conv.ID, &conv.CreatedAt, &conv.UpdatedAt)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find existing conversation: %w", err)
	}
	return conv, nil
}

func (r *ConversationRepository) AddParticipant(ctx context.Context, convID, userID string) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO conversation_participants (conversation_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
		convID, userID,
	)
	if err != nil {
		return fmt.Errorf("failed to add participant: %w", err)
	}
	return nil
}

type MessageRepository struct {
	pool *pgxpool.Pool
}

func NewMessageRepository(pool *pgxpool.Pool) *MessageRepository {
	return &MessageRepository{pool: pool}
}

func (r *MessageRepository) Create(ctx context.Context, msg *message.Message) error {
	msg.ID = uuid.New().String()
	msg.CreatedAt = time.Now()

	_, err := r.pool.Exec(ctx,
		`INSERT INTO messages (id, conversation_id, sender_id, content, reply_to, created_at)
		VALUES ($1,$2,$3,$4,$5,$6)`,
		msg.ID, msg.ConversationID, msg.SenderID, msg.Content, msg.ReplyTo, msg.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("failed to create message: %w", err)
	}

	// Update conversation updated_at
	_, err = r.pool.Exec(ctx, `UPDATE conversations SET updated_at = $1 WHERE id = $2`,
		msg.CreatedAt, msg.ConversationID)
	if err != nil {
		return fmt.Errorf("failed to update conversation: %w", err)
	}

	return nil
}

func (r *MessageRepository) FindByConversation(ctx context.Context, convID string, cursor string, limit int) ([]*message.Message, string, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	sql := `SELECT m.id, m.conversation_id, m.sender_id, m.content, m.reply_to, m.created_at,
		u.id, u.username, u.display_name, u.avatar_url
		FROM messages m
		JOIN users u ON u.id = m.sender_id
		WHERE m.conversation_id = $1`

	args := []interface{}{convID}
	argIdx := 2

	if cursor != "" {
		sql += fmt.Sprintf(" AND m.created_at < (SELECT created_at FROM messages WHERE id = $%d)", argIdx)
		args = append(args, cursor)
		argIdx++
	}

	args = append(args, limit+1)
	sql += fmt.Sprintf(" ORDER BY m.created_at DESC LIMIT $%d", argIdx)

	rows, err := r.pool.Query(ctx, sql, args...)
	if err != nil {
		return nil, "", fmt.Errorf("failed to find messages: %w", err)
	}
	defer rows.Close()

	var messages []*message.Message
	for rows.Next() {
		msg := &message.Message{}
		sender := &message.MessageSender{}
		err := rows.Scan(
			&msg.ID, &msg.ConversationID, &msg.SenderID, &msg.Content, &msg.ReplyTo, &msg.CreatedAt,
			&sender.ID, &sender.Username, &sender.DisplayName, &sender.AvatarURL,
		)
		if err != nil {
			return nil, "", fmt.Errorf("failed to scan message: %w", err)
		}
		msg.Sender = sender
		messages = append(messages, msg)
	}

	var nextCursor string
	hasMore := len(messages) > limit
	if hasMore {
		messages = messages[:limit]
		nextCursor = messages[len(messages)-1].ID
	}

	// Reverse to chronological order
	for i, j := 0, len(messages)-1; i < j; i, j = i+1, j-1 {
		messages[i], messages[j] = messages[j], messages[i]
	}

	return messages, nextCursor, nil
}

func (r *MessageRepository) FindByID(ctx context.Context, id string) (*message.Message, error) {
	msg := &message.Message{}
	sender := &message.MessageSender{}
	err := r.pool.QueryRow(ctx,
		`SELECT m.id, m.conversation_id, m.sender_id, m.content, m.reply_to, m.created_at,
			u.id, u.username, u.display_name, u.avatar_url
		FROM messages m
		JOIN users u ON u.id = m.sender_id
		WHERE m.id = $1`, id,
	).Scan(
		&msg.ID, &msg.ConversationID, &msg.SenderID, &msg.Content, &msg.ReplyTo, &msg.CreatedAt,
		&sender.ID, &sender.Username, &sender.DisplayName, &sender.AvatarURL,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, nil
		}
		return nil, fmt.Errorf("failed to find message: %w", err)
	}
	msg.Sender = sender
	return msg, nil
}