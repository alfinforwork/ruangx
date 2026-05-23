package handler

import (
	"github.com/gofiber/fiber/v3"
	"github.com/ruangx/chat-service/internal/service"
)

type ChatHandler struct {
	svc *service.ChatService
}

func NewChatHandler(svc *service.ChatService) *ChatHandler {
	return &ChatHandler{svc: svc}
}

func userID(c fiber.Ctx) string {
	return c.Get("X-User-ID")
}

type sendReq struct {
	ReceiverID string `json:"receiverId"`
	Content    string `json:"content"`
}

func (h *ChatHandler) GetConversations(c fiber.Ctx) error {
	uid := userID(c)
	if uid == "" {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	users, err := h.svc.GetConversations(uid)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(users)
}

func (h *ChatHandler) GetMessages(c fiber.Ctx) error {
	uid := userID(c)
	if uid == "" {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	otherID := c.Params("userId")
	msgs, err := h.svc.GetMessages(uid, otherID)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(msgs)
}

func (h *ChatHandler) SendMessage(c fiber.Ctx) error {
	uid := userID(c)
	if uid == "" {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	var req sendReq
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}
	msg, err := h.svc.SendMessage(uid, req.ReceiverID, req.Content)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(msg)
}