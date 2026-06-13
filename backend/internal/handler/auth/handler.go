package auth

import (
	"strings"

	"github.com/gofiber/fiber/v3"

	"github.com/alfinokio/ruangx/internal/dto"
	"github.com/alfinokio/ruangx/internal/middleware"
	"github.com/alfinokio/ruangx/internal/usecase/auth"
	"github.com/alfinokio/ruangx/pkg/response"
	"github.com/alfinokio/ruangx/pkg/validator"
)

type Handler struct {
	uc *auth.UseCase
}

func NewHandler(uc *auth.UseCase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) Register(c fiber.Ctx) error {
	var req dto.RegisterRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.Error(c, 400, "Invalid request body")
	}

	if errs := validator.Validate(req); errs != nil {
		return response.ValidationError(c, errs)
	}

	res, err := h.uc.Register(c.Context(), req)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Created(c, res)
}

func (h *Handler) Login(c fiber.Ctx) error {
	var req dto.LoginRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.Error(c, 400, "Invalid request body")
	}

	if errs := validator.Validate(req); errs != nil {
		return response.ValidationError(c, errs)
	}

	res, err := h.uc.Login(c.Context(), req)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}

func (h *Handler) Refresh(c fiber.Ctx) error {
	var req dto.RefreshRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.Error(c, 400, "Invalid request body")
	}

	if errs := validator.Validate(req); errs != nil {
		return response.ValidationError(c, errs)
	}

	// The refresh token may contain tokenID appended
	tokenParts := strings.Split(req.RefreshToken, ":")
	refreshToken := tokenParts[0]

	res, err := h.uc.RefreshToken(c.Context(), refreshToken)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}

func (h *Handler) Logout(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	if err := h.uc.Logout(c.Context(), userID, ""); err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, map[string]string{"message": "Logged out successfully"})
}