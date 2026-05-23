package handler

import (
	"github.com/gofiber/fiber/v3"
	"github.com/ruangx/notification-service/internal/service"
)

type NotifHandler struct {
	svc *service.NotifService
}

func NewNotifHandler(svc *service.NotifService) *NotifHandler {
	return &NotifHandler{svc: svc}
}

func userID(c fiber.Ctx) string {
	return c.Get("X-User-ID")
}

func (h *NotifHandler) GetAll(c fiber.Ctx) error {
	uid := userID(c)
	if uid == "" {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	notifs, err := h.svc.GetAll(uid)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(notifs)
}

func (h *NotifHandler) MarkRead(c fiber.Ctx) error {
	if err := h.svc.MarkRead(c.Params("id")); err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"ok": true})
}