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
		CREATE TABLE IF NOT EXISTS posts (
			id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id    UUID NOT NULL REFERENCES users(id),
			content    TEXT NOT NULL,
			media_urls TEXT[],
			view_count INT NOT NULL DEFAULT 0,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);
		CREATE TABLE IF NOT EXISTS likes (
			id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id   UUID NOT NULL REFERENCES users(id),
			post_id   UUID NOT NULL REFERENCES posts(id),
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			UNIQUE(user_id, post_id)
		);
		CREATE TABLE IF NOT EXISTS comments (
			id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			post_id    UUID NOT NULL REFERENCES posts(id),
			user_id    UUID NOT NULL REFERENCES users(id),
			parent_id  UUID REFERENCES comments(id),
			content    TEXT NOT NULL,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		);
		CREATE TABLE IF NOT EXISTS bookmarks (
			id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			user_id   UUID NOT NULL REFERENCES users(id),
			post_id   UUID NOT NULL REFERENCES posts(id),
			created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
			UNIQUE(user_id, post_id)
		);
		CREATE TABLE IF NOT EXISTS tags (
			id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			name  TEXT UNIQUE NOT NULL,
			count INT NOT NULL DEFAULT 0
		);
	`)
	return err
}