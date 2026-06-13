package user

import (
	"github.com/gofiber/fiber/v3"

	"github.com/alfinokio/ruangx/internal/dto"
	"github.com/alfinokio/ruangx/internal/middleware"
	"github.com/alfinokio/ruangx/internal/usecase/user"
	"github.com/alfinokio/ruangx/pkg/response"
	"github.com/alfinokio/ruangx/pkg/validator"
)

type Handler struct {
	uc *user.UseCase
}

func NewHandler(uc *user.UseCase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) GetProfile(c fiber.Ctx) error {
	username := c.Params("username")
	if username == "" {
		return response.Error(c, 400, "Username required")
	}

	res, err := h.uc.GetProfile(c.Context(), username)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}

func (h *Handler) UpdateProfile(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	var req dto.UpdateProfileRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.Error(c, 400, "Invalid request body")
	}

	if errs := validator.Validate(req); errs != nil {
		return response.ValidationError(c, errs)
	}

	res, err := h.uc.UpdateProfile(c.Context(), userID, req)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}

func (h *Handler) Search(c fiber.Ctx) error {
	query := c.Query("q")
	if query == "" {
		return response.Error(c, 400, "Search query required")
	}

	cursor := c.Query("cursor")
	limit := 20

	users, nextCursor, err := h.uc.SearchUsers(c.Context(), query, cursor, limit)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Paginated(c, users, nextCursor, nextCursor != "", limit)
}