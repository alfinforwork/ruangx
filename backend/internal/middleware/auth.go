package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v3"

	"github.com/alfinokio/ruangx/internal/infrastructure/jwt"
	"github.com/alfinokio/ruangx/pkg/response"
)

func Auth(jwtSvc *jwt.JWTService) fiber.Handler {
	return func(c fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return response.Error(c, 401, "Authorization header required")
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return response.Error(c, 401, "Invalid authorization header format")
		}

		claims, err := jwtSvc.ValidateToken(parts[1])
		if err != nil {
			return response.Error(c, 401, "Invalid or expired token")
		}

		c.Locals("user_id", claims.UserID)
		c.Context().SetUserValue("user_id", claims.UserID)
		return c.Next()
	}
}

func GetUserID(c fiber.Ctx) string {
	if userID, ok := c.Locals("user_id").(string); ok && userID != "" {
		return userID
	}
	if userID := c.Context().UserValue("user_id"); userID != nil {
		if s, ok := userID.(string); ok && s != "" {
			return s
		}
	}
	return ""
}

func OptionalAuth(jwtSvc *jwt.JWTService) fiber.Handler {
	return func(c fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" {
			return c.Next()
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			return c.Next()
		}

		claims, err := jwtSvc.ValidateToken(parts[1])
		if err == nil {
			c.Locals("user_id", claims.UserID)
			c.Context().SetUserValue("user_id", claims.UserID)
		}

		return c.Next()
	}
}