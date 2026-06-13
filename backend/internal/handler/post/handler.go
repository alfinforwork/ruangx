package post

import (
	"strconv"

	"github.com/gofiber/fiber/v3"

	"github.com/alfinokio/ruangx/internal/dto"
	"github.com/alfinokio/ruangx/internal/middleware"
	"github.com/alfinokio/ruangx/internal/usecase/post"
	"github.com/alfinokio/ruangx/pkg/response"
	"github.com/alfinokio/ruangx/pkg/validator"
)

type Handler struct {
	uc *post.UseCase
}

func NewHandler(uc *post.UseCase) *Handler {
	return &Handler{uc: uc}
}

func (h *Handler) Create(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	var req dto.CreatePostRequest
	if err := c.Bind().JSON(&req); err != nil {
		return response.Error(c, 400, "Invalid request body")
	}

	if errs := validator.Validate(req); errs != nil {
		return response.ValidationError(c, errs)
	}

	res, err := h.uc.CreatePost(c.Context(), userID, req)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Created(c, res)
}

func (h *Handler) GetByID(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return response.Error(c, 400, "Post ID required")
	}

	res, err := h.uc.GetPost(c.Context(), id)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}

func (h *Handler) GetFeed(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	cursor := c.Query("cursor")
	limitStr := c.Query("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 50 {
		limit = 20
	}

	res, err := h.uc.GetFeed(c.Context(), userID, cursor, limit)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}

func (h *Handler) GetThread(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "" {
		return response.Error(c, 400, "Thread ID required")
	}

	res, err := h.uc.GetThread(c.Context(), id)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}

func (h *Handler) Delete(c fiber.Ctx) error {
	userID := middleware.GetUserID(c)
	if userID == "" {
		return response.Error(c, 401, "Unauthorized")
	}

	id := c.Params("id")
	if id == "" {
		return response.Error(c, 400, "Post ID required")
	}

	if err := h.uc.DeletePost(c.Context(), id, userID); err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, map[string]string{"message": "Post deleted"})
}

func (h *Handler) GetByUser(c fiber.Ctx) error {
	username := c.Params("username")
	cursor := c.Query("cursor")
	limitStr := c.Query("limit", "20")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 50 {
		limit = 20
	}

	res, err := h.uc.GetUserPosts(c.Context(), username, cursor, limit)
	if err != nil {
		return response.HandleError(c, err)
	}

	return response.Success(c, res)
}