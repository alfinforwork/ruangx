package room

import (
	"github.com/gofiber/fiber/v3"

	"github.com/alfinokio/ruangx/internal/dto"
	"github.com/alfinokio/ruangx/internal/middleware"
	"github.com/alfinokio/ruangx/internal/usecase/room"
	"github.com/alfinokio/ruangx/pkg/response"
	"github.com/alfinokio/ruangx/pkg/validator"
)

type Handler struct {
	uc *room.UseCase
}

func NewHandler(uc *room.UseCase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) Create(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	var req dto.CreateRoomRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.Error(c, 400, "Invalid request body")
	}

	if errs := validator.Validate(req); errs != nil {
		return response.ValidationError(c, errs)
	}

	res, err := h.uc.Create(c.Context(), userID, req)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Created(c, res)
}

func (h *Handler) GetPopular(c fiber.Ctx) error {
	cursor := c.Query("cursor")
	limit := 20

	rooms, nextCursor, err := h.uc.GetPopular(c.Context(), cursor, limit)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Paginated(c, rooms, nextCursor, nextCursor != "", limit)
}

func (h *Handler) GetByID(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return response.Error(c, 400, "Room ID required")
	}

	userID := middleware.GetUserID(c)

	res, err := h.uc.GetByID(c.Context(), id, userID)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}

func (h *Handler) Join(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	roomID := c.Params("id")
	if roomID == "" {
		return response.Error(c, 400, "Room ID required")
	}

	res, err := h.uc.Join(c.Context(), roomID, userID)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}

func (h *Handler) Leave(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	roomID := c.Params("id")
	if roomID == "" {
		return response.Error(c, 400, "Room ID required")
	}

	res, err := h.uc.Leave(c.Context(), roomID, userID)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}