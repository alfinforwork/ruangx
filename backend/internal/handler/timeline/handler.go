package timeline

import (
	"github.com/gofiber/fiber/v3"

	"github.com/alfinokio/ruangx/internal/middleware"
	"github.com/alfinokio/ruangx/internal/usecase/timeline"
	"github.com/alfinokio/ruangx/pkg/response"
)

type Handler struct {
	uc *timeline.UseCase
}

func NewHandler(uc *timeline.UseCase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) GetTimeline(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	cursor := c.Query("cursor")
	limit := 20

	res, err := h.uc.BuildFeed(c.Context(), userID, cursor, limit)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}