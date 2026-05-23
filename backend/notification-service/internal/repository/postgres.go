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
		CREATE TABLE IF NOT EXISTS notifications (
			id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id      UUID NOT NULL,
			type         TEXT NOT NULL,
			reference_id UUID,
			message      TEXT NOT NULL,
			read         BOOLEAN NOT NULL DEFAULT false,
			created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
		);
		CREATE INDEX IF NOT EXISTS idx_notif_user ON notifications(user_id);
	`)
	return err
}