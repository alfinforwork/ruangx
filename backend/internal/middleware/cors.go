package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
)

func CORS(allowedOrigins string) fiber.Handler {
	origins := strings.Split(allowedOrigins, ",")
	allowAll := false
	for i := range origins {
		origins[i] = strings.TrimSpace(origins[i])
		if origins[i] == "*" {
			allowAll = true
		}
	}

	cfg := cors.Config{
		AllowMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Type", "Accept", "Authorization"},
		MaxAge:       86400,
	}

	if allowAll {
		cfg.AllowOrigins = []string{"*"}
		// AllowCredentials must be false when using * (browser spec)
		cfg.AllowCredentials = false
	} else {
		cfg.AllowOrigins = origins
		cfg.AllowCredentials = true
	}

	return cors.New(cfg)
}