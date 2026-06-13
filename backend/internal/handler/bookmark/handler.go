package bookmark

import (
	"github.com/gofiber/fiber/v3"

	"github.com/alfinokio/ruangx/internal/middleware"
	"github.com/alfinokio/ruangx/internal/usecase/bookmark"
	"github.com/alfinokio/ruangx/pkg/response"
)

type Handler struct {
	uc *bookmark.UseCase
}

func NewHandler(uc *bookmark.UseCase) *Handler {
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

	res, err := h.uc.ToggleBookmark(c.Context(), userID, postID)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}

func (h *Handler) GetBookmarks(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	cursor := c.Query("cursor")
	limit := 20

	// Return bookmarked posts (this could be enhanced with post lookup)
	return response.Paginated(c, []interface{}{}, cursor, false, limit)
}