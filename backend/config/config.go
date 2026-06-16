package config

import (
	"os"
	"path/filepath"
	"runtime"

	"github.com/caarlos0/env/v11"
	"github.com/joho/godotenv"
)

type Config struct {
	HTTPPort string `env:"HTTP_PORT" envDefault:"8080"`
	AppEnv   string `env:"APP_ENV" envDefault:"development"`

	DBHost     string `env:"DB_HOST"`
	DBPort     string `env:"DB_PORT" envDefault:"5432"`
	DBUser     string `env:"DB_USER"`
	DBPassword string `env:"DB_PASSWORD"`
	DBName     string `env:"DB_NAME"`
	DBSSLMode  string `env:"DB_SSLMODE" envDefault:"disable"`

	RedisHost     string `env:"REDIS_HOST"`
	RedisDB       int    `env:"REDIS_DB" envDefault:"0"`
	RedisPassword string `env:"REDIS_PASSWORD"`

	JWTSecret        string `env:"JWT_SECRET"`
	JWTAccessExpiry  string `env:"JWT_ACCESS_EXPIRY" envDefault:"15m"`
	JWTRefreshExpiry string `env:"JWT_REFRESH_EXPIRY" envDefault:"168h"`

	S3Endpoint  string `env:"S3_ENDPOINT"`
	S3AccessKey string `env:"S3_ACCESS_KEY"`
	S3SecretKey string `env:"S3_SECRET_KEY"`
	S3Bucket    string `env:"S3_BUCKET"`
	S3Region    string `env:"S3_REGION" envDefault:"us-east-1"`
	S3UseSSL    string `env:"S3_USE_SSL" envDefault:"false"`

	AllowedOrigins string `env:"ALLOWED_ORIGINS" envDefault:"*"`
}

func Load() (*Config, error) {
	appEnv := os.Getenv("APP_ENV")
	if appEnv != "production" {
		_, filename, _, _ := runtime.Caller(0)
		envPath := filepath.Join(filepath.Dir(filename), ".env")
		_ = godotenv.Load(envPath)
	}

	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, err
	}
	return cfg, nil
}
