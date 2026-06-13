package message

import (
	"github.com/gofiber/fiber/v3"

	"github.com/alfinokio/ruangx/internal/dto"
	"github.com/alfinokio/ruangx/internal/middleware"
	"github.com/alfinokio/ruangx/internal/usecase/message"
	"github.com/alfinokio/ruangx/pkg/response"
	"github.com/alfinokio/ruangx/pkg/validator"
)

type Handler struct {
	uc *message.UseCase
}

func NewHandler(uc *message.UseCase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) Send(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	var req dto.SendMessageRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.Error(c, 400, "Invalid request body")
	}

	if errs := validator.Validate(req); errs != nil {
		return response.ValidationError(c, errs)
	}

	res, err := h.uc.Send(c.Context(), userID, req)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Created(c, res)
}

func (h *Handler) GetConversations(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	cursor := c.Query("cursor")
	limit := 20

	convs, nextCursor, err := h.uc.GetConversations(c.Context(), userID, cursor, limit)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Paginated(c, convs, nextCursor, nextCursor != "", limit)
}

func (h *Handler) GetMessages(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	convID := c.Params("id")
	if convID == "" {
		return response.Error(c, 400, "Conversation ID required")
	}

	cursor := c.Query("cursor")
	limit := 50

	msgs, nextCursor, err := h.uc.GetMessages(c.Context(), convID, cursor, limit)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Paginated(c, msgs, nextCursor, nextCursor != "", limit)
}