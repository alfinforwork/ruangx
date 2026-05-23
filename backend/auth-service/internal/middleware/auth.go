package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v3"
	"github.com/ruangx/auth-service/internal/service"
)

func AuthMiddleware(svc *service.AuthService) fiber.Handler {
	return func(c fiber.Ctx) error {
		auth := c.Get("Authorization")
		if auth == "" || !strings.HasPrefix(auth, "Bearer ") {
			return c.Status(401).JSON(fiber.Map{"error": "missing token"})
		}
		token := strings.TrimPrefix(auth, "Bearer ")
		userID, err := svc.ValidateToken(token)
		if err != nil {
			return c.Status(401).JSON(fiber.Map{"error": "invalid token"})
		}
		c.Locals("userID", userID)
		return c.Next()
	}
}

func UserID(c fiber.Ctx) string {
	if id, ok := c.Locals("userID").(string); ok {
		return id
	}
	return ""
}