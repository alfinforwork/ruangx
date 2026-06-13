package notification

import (
	"github.com/gofiber/fiber/v3"

	"github.com/alfinokio/ruangx/internal/middleware"
	"github.com/alfinokio/ruangx/internal/usecase/notification"
	"github.com/alfinokio/ruangx/pkg/response"
)

type Handler struct {
	uc *notification.UseCase
}

func NewHandler(uc *notification.UseCase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) GetNotifications(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	cursor := c.Query("cursor")
	limit := 20

	notifs, nextCursor, err := h.uc.GetNotifications(c.Context(), userID, cursor, limit)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Paginated(c, notifs, nextCursor, nextCursor != "", limit)
}

func (h *Handler) MarkRead(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	var req struct {
		ID string `json:"id"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return response.Error(c, 400, "Invalid request body")
	}

	if err := h.uc.MarkRead(c.Context(), req.ID, userID); err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, map[string]string{"message": "Notification marked as read"})
}

func (h *Handler) MarkAllRead(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	if err := h.uc.MarkAllRead(c.Context(), userID); err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, map[string]string{"message": "All notifications marked as read"})
}

func (h *Handler) CountUnread(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	res, err := h.uc.CountUnread(c.Context(), userID)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}