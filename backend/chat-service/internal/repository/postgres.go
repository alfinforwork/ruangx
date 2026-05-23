package repository

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

type Postgres struct {
	DB *sql.DB
}

func NewPostgres(url string) *Postgres {
	db, err := sql.Open("postgres", url)
	if err != nil {
		panic(fmt.Errorf("postgres open: %w", err))
	}
	if err := db.Ping(); err != nil {
		panic(fmt.Errorf("postgres ping: %w", err))
	}
	return &Postgres{DB: db}
}

func (p *Postgres) Migrate() error {
	_, err := p.DB.Exec(`
		CREATE TABLE IF NOT EXISTS messages (
			id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			sender_id   UUID NOT NULL,
			receiver_id UUID NOT NULL,
			content     TEXT NOT NULL,
			read_at     TIMESTAMPTZ,
			created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
		);
		CREATE INDEX IF NOT EXISTS idx_messages_users ON messages(sender_id, receiver_id);
	`)
	return err
}