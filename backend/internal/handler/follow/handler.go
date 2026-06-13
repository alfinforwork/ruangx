package follow

import (
	"github.com/gofiber/fiber/v3"

	"github.com/alfinokio/ruangx/internal/middleware"
	"github.com/alfinokio/ruangx/internal/usecase/follow"
	"github.com/alfinokio/ruangx/pkg/response"
)

type Handler struct {
	uc *follow.UseCase
}

func NewHandler(uc *follow.UseCase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) Follow(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	username := c.Params("username")
	if username == "" {
		return response.Error(c, 400, "Username required")
	}

	res, err := h.uc.Follow(c.Context(), userID, username)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}

func (h *Handler) Unfollow(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	username := c.Params("username")
	if username == "" {
		return response.Error(c, 400, "Username required")
	}

	res, err := h.uc.Unfollow(c.Context(), userID, username)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}

func (h *Handler) GetFollowers(c fiber.Ctx) error {
	username := c.Params("username")
	if username == "" {
		return response.Error(c, 400, "Username required")
	}

	cursor := c.Query("cursor")
	limit := 20

	users, nextCursor, err := h.uc.GetFollowers(c.Context(), username, cursor, limit)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Paginated(c, users, nextCursor, nextCursor != "", limit)
}

func (h *Handler) GetFollowing(c fiber.Ctx) error {
	username := c.Params("username")
	if username == "" {
		return response.Error(c, 400, "Username required")
	}

	cursor := c.Query("cursor")
	limit := 20

	users, nextCursor, err := h.uc.GetFollowing(c.Context(), username, cursor, limit)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Paginated(c, users, nextCursor, nextCursor != "", limit)
}