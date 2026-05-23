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
		CREATE TABLE IF NOT EXISTS users (
			id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name        TEXT NOT NULL,
			email       TEXT UNIQUE NOT NULL,
			password_hash TEXT NOT NULL,
			avatar_url  TEXT,
			banner_url  TEXT,
			bio         TEXT,
			created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
			updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
		);
	`)
	return err
}