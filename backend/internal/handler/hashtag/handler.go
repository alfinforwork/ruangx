package hashtag

import (
	"github.com/gofiber/fiber/v3"

	"github.com/alfinokio/ruangx/internal/usecase/hashtag"
	"github.com/alfinokio/ruangx/pkg/response"
)

type Handler struct {
	uc *hashtag.UseCase
}

func NewHandler(uc *hashtag.UseCase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) GetTrending(c fiber.Ctx) error {
	res, err := h.uc.GetTrending(c.Context(), 20)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}

func (h *Handler) GetByTag(c fiber.Ctx) error {
	tag := c.Params("tag")
	if tag == "" {
		return response.Error(c, 400, "Tag required")
	}

	return response.Success(c, map[string]string{"tag": tag})
}