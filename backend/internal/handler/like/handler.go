package like

import (
	"github.com/gofiber/fiber/v3"

	"github.com/alfinokio/ruangx/internal/middleware"
	"github.com/alfinokio/ruangx/internal/usecase/like"
	"github.com/alfinokio/ruangx/pkg/response"
)

type Handler struct {
	uc *like.UseCase
}

func NewHandler(uc *like.UseCase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) Toggle(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	postID := c.Params("id")
	if postID == "" {
		return response.Error(c, 400, "Post ID required")
	}

	res, err := h.uc.ToggleLike(c.Context(), userID, postID)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}