package handler

import (
	"github.com/gofiber/fiber/v3"
	"github.com/ruangx/auth-service/internal/service"
)

type AuthHandler struct {
	svc *service.AuthService
}

func NewAuthHandler(svc *service.AuthService) *AuthHandler {
	return &AuthHandler{svc: svc}
}

type registerReq struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type loginReq struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type forgotReq struct {
	Email string `json:"email"`
}

type authResp struct {
	User  any    `json:"user"`
	Token string `json:"token"`
}

func (h *AuthHandler) Register(c fiber.Ctx) error {
	var req registerReq
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}
	u, token, err := h.svc.Register(req.Name, req.Email, req.Password)
	if err != nil {
		return c.Status(400).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(authResp{User: u, Token: token})
}

func (h *AuthHandler) Login(c fiber.Ctx) error {
	var req loginReq
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}
	u, token, err := h.svc.Login(req.Email, req.Password)
	if err != nil {
		return c.Status(401).JSON(fiber.Map{"error": err.Error()})
	}
	return c.JSON(authResp{User: u, Token: token})
}

func (h *AuthHandler) ForgotPassword(c fiber.Ctx) error {
	var req forgotReq
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "invalid body"})
	}
	h.svc.ForgotPassword(req.Email)
	return c.JSON(fiber.Map{"message": "if email exists, reset link sent"})
}