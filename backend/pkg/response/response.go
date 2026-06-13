package response

import (
	"net/http"

	apperrors "github.com/alfinokio/ruangx/pkg/errors"
	"github.com/gofiber/fiber/v3"
)

type APIResponse struct {
	Success bool        `json:"success"`
	Data    interface{} `json:"data,omitempty"`
	Error   *APIError   `json:"error,omitempty"`
}

type APIError struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Details interface{} `json:"details,omitempty"`
}

type PaginatedData struct {
	Items      interface{} `json:"items"`
	Cursor     string      `json:"cursor"`
	HasMore    bool        `json:"has_more"`
	Limit      int         `json:"limit"`
}

func Success(c fiber.Ctx, data interface{}) error {
	return c.Status(http.StatusOK).JSON(APIResponse{
		Success: true,
		Data:    data,
	})
}

func Created(c fiber.Ctx, data interface{}) error {
	return c.Status(http.StatusCreated).JSON(APIResponse{
		Success: true,
		Data:    data,
	})
}

func Paginated(c fiber.Ctx, items interface{}, cursor string, hasMore bool, limit int) error {
	return c.Status(http.StatusOK).JSON(APIResponse{
		Success: true,
		Data: PaginatedData{
			Items:   items,
			Cursor:  cursor,
			HasMore: hasMore,
			Limit:   limit,
		},
	})
}

func Error(c fiber.Ctx, code int, message string) error {
	return c.Status(code).JSON(APIResponse{
		Success: false,
		Error: &APIError{
			Code:    code,
			Message: message,
		},
	})
}

func ValidationError(c fiber.Ctx, details interface{}) error {
	return c.Status(http.StatusUnprocessableEntity).JSON(APIResponse{
		Success: false,
		Error: &APIError{
			Code:    http.StatusUnprocessableEntity,
			Message: "Validation failed",
			Details: details,
		},
	})
}

func HandleError(c fiber.Ctx, err error) error {
	if appErr, ok := err.(*apperrors.AppError); ok {
		return Error(c, appErr.Code, appErr.Message)
	}
	return Error(c, http.StatusInternalServerError, "Internal server error")
}

func NoContent(c fiber.Ctx) error {
	return c.SendStatus(http.StatusNoContent)
}