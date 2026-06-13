package middleware

import (
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
)

func Logger() fiber.Handler {
	return func(c fiber.Ctx) error {
		start := time.Now()
		path := c.Path()
		method := c.Method()

		err := c.Next()

		duration := time.Since(start)
		status := c.Response().StatusCode()

		var loggerEv *zerolog.Event
		if status >= 500 {
			loggerEv = log.Error()
		} else if status >= 400 {
			loggerEv = log.Warn()
		} else {
			loggerEv = log.Info()
		}

		loggerEv.
			Str("method", method).
			Str("path", path).
			Int("status", status).
			Dur("duration", duration).
			Str("ip", c.IP()).
			Str("user_agent", c.Get("User-Agent")).
			Msg("request completed")

		return err
	}
}