package config

import (
	"github.com/caarlos0/env/v11"
)

type Config struct {
	HTTPPort string `env:"HTTP_PORT" envDefault:"8080"`
	AppEnv   string `env:"APP_ENV" envDefault:"development"`

	DBHost     string `env:"DB_HOST" envDefault:"localhost"`
	DBPort     string `env:"DB_PORT" envDefault:"5432"`
	DBUser     string `env:"DB_USER" envDefault:"ruangx"`
	DBPassword string `env:"DB_PASSWORD" envDefault:"ruangx_secret"`
	DBName     string `env:"DB_NAME" envDefault:"ruangx"`
	DBSSLMode  string `env:"DB_SSLMODE" envDefault:"disable"`

	RedisURL      string `env:"REDIS_URL" envDefault:"redis://localhost:6379/0"`
	RedisHost     string `env:"REDIS_HOST" envDefault:"localhost:6379"`
	RedisPassword string `env:"REDIS_PASSWORD" envDefault:""`

	JWTSecret       string `env:"JWT_SECRET" envDefault:"super-secret-key-change-in-production"`
	JWTAccessExpiry string `env:"JWT_ACCESS_EXPIRY" envDefault:"15m"`
	JWTRefreshExpiry string `env:"JWT_REFRESH_EXPIRY" envDefault:"168h"`

	S3Endpoint  string `env:"S3_ENDPOINT" envDefault:"http://localhost:9000"`
	S3AccessKey string `env:"S3_ACCESS_KEY" envDefault:"minioadmin"`
	S3SecretKey string `env:"S3_SECRET_KEY" envDefault:"minioadmin123"`
	S3Bucket    string `env:"S3_BUCKET" envDefault:"ruangx-media"`
	S3Region    string `env:"S3_REGION" envDefault:"us-east-1"`
	S3UseSSL    string `env:"S3_USE_SSL" envDefault:"false"`

	AllowedOrigins string `env:"ALLOWED_ORIGINS" envDefault:"*"`
}

func Load() (*Config, error) {
	cfg := &Config{}
	if err := env.Parse(cfg); err != nil {
		return nil, err
	}
	return cfg, nil
}