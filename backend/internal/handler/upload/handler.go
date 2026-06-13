package upload

import (
	"github.com/gofiber/fiber/v3"

	"github.com/alfinokio/ruangx/internal/middleware"
	"github.com/alfinokio/ruangx/internal/usecase/upload"
	"github.com/alfinokio/ruangx/pkg/response"
)

type Handler struct {
	uc *upload.UseCase
}

func NewHandler(uc *upload.UseCase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) Upload(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	file, err := c.FormFile("file")
	if err != nil {
		return response.Error(c, 400, "File required")
	}

	f, err := file.Open()
	if err != nil {
		return response.Error(c, 400, "Failed to open file")
	}
	defer f.Close()

	url, err := h.uc.UploadFile(c.Context(), f, file)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, map[string]string{"url": url})
}