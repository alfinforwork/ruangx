package handler

import (
	"fmt"

	"github.com/gofiber/fiber/v3"
	"github.com/ruangx/post-service/internal/service"
)

type PostHandler struct {
	svc *service.PostService
}

func NewPostHandler(svc *service.PostService) *PostHandler {
	return &PostHandler{svc: svc}
}

type createReq struct {
	Content   string   `json:"content"`
	MediaURLs []string `json:"mediaUrls"`
}

type commentReq struct {
	Content  string  `json:"content"`
	ParentID *string `json:"parentId"`
}

func userID(c fiber.Ctx) string {
	return c.Get("X-User-ID")
}

func (h *PostHandler) Create(c fiber.Ctx) error {
	var req createReq
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}
	uid := userID(c)
	if uid == "" {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	post, err := h.svc.Create(uid, req.Content, req.MediaURLs)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(post)
}

func (h *PostHandler) GetFeed(c fiber.Ctx) error {
	page := parseInt(c.Query("page", "1"), 1)
	posts, err := h.svc.GetFeed(page)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(fiber.Map{"data": posts, "page": page})
}

func (h *PostHandler) GetByID(c fiber.Ctx) error {
	id := c.Params("id")
	uid := userID(c)
	post, err := h.svc.GetByID(id, uid)
	if err != nil {
		return c.Status(404).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(post)
}

func (h *PostHandler) Like(c fiber.Ctx) error {
	uid := userID(c)
	if uid == "" {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	return h.svc.Like(uid, c.Params("id"))
}

func (h *PostHandler) Unlike(c fiber.Ctx) error {
	uid := userID(c)
	if uid == "" {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	return h.svc.Unlike(uid, c.Params("id"))
}

func (h *PostHandler) Bookmark(c fiber.Ctx) error {
	uid := userID(c)
	if uid == "" {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	return h.svc.Bookmark(uid, c.Params("id"))
}

func (h *PostHandler) Unbookmark(c fiber.Ctx) error {
	uid := userID(c)
	if uid == "" {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	return h.svc.Unbookmark(uid, c.Params("id"))
}

func (h *PostHandler) GetComments(c fiber.Ctx) error {
	comments, err := h.svc.GetComments(c.Params("id"))
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(comments)
}

func (h *PostHandler) AddComment(c fiber.Ctx) error {
	var req commentReq
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}
	uid := userID(c)
	if uid == "" {
		return c.Status(401).JSON(fiber.Map{"error": "unauthorized"})
	}
	cm, err := h.svc.AddComment(c.Params("id"), uid, req.Content, req.ParentID)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.Status(201).JSON(cm)
}

func (h *PostHandler) TrendingTags(c fiber.Ctx) error {
	tags, err := h.svc.GetTrendingTags()
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(tags)
}

func parseInt(s string, fallback int) int {
	if s == "" {
		return fallback
	}
	var n int
	if _, err := fmt.Sscanf(s, "%d", &n); err != nil {
		return fallback
	}
	return n
}