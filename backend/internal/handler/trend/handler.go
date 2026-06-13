package trend

import (
	"github.com/gofiber/fiber/v3"

	"github.com/alfinokio/ruangx/internal/usecase/trend"
	"github.com/alfinokio/ruangx/pkg/response"
)

type Handler struct {
	uc *trend.UseCase
}

func NewHandler(uc *trend.UseCase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) GetTrending(c fiber.Ctx) error {
	res, err := h.uc.GetTrending(c.Context(), 20)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}