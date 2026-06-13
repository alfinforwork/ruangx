package middleware

import (
	"time"

	"github.com/gofiber/fiber/v3"

	"github.com/alfinokio/ruangx/internal/repository/redis"
	"github.com/alfinokio/ruangx/pkg/response"
)

func RateLimit(store *redis.RateLimitStore, limit int, window time.Duration) fiber.Handler {
	return func(c fiber.Ctx) error {
		key := "ratelimit:" + c.IP()

		limited, count, err := store.CheckRateLimit(c.Context(), key, limit, window)
		if err != nil {
			// On error, allow the request through
			return c.Next()
		}

		if limited {
			c.Response().Header.Set("X-RateLimit-Limit", string(rune(limit)))
			c.Response().Header.Set("X-RateLimit-Remaining", "0")
			return response.Error(c, 429, "Too many requests. Please try again later.")
		}

		c.Response().Header.Set("X-RateLimit-Remaining", string(rune(limit-count)))
		return c.Next()
	}
}