package config

import "os"

type Config struct {
	DatabaseURL string
	JWTSecret   string
}

func Load() *Config {
	return &Config{
		DatabaseURL: env("DATABASE_URL", "postgres://ruangx:***@localhost:5432/ruangx?sslmode=disable"),
		JWTSecret:   env("JWT_SECRET", "change-me-in-production"),
	}
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}