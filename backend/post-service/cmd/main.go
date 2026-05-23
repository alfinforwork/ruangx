package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/ruangx/post-service/config"
	"github.com/ruangx/post-service/internal/handler"
	"github.com/ruangx/post-service/internal/repository"
	"github.com/ruangx/post-service/internal/service"
)

func main() {
	cfg := config.Load()

	db := repository.NewPostgres(cfg.DatabaseURL)
	if err := db.Migrate(); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	postRepo := repository.NewPostRepo(db.DB)
	svc := service.NewPostService(postRepo)
	h := handler.NewPostHandler(svc)

	app := fiber.New()
	app.Use(cors.New())
	app.Use(logger.New())

	api := app.Group("/api")
	api.Get("/posts", h.GetFeed)
	api.Get("/posts/:id", h.GetByID)
	api.Post("/posts", h.Create)
	api.Post("/posts/:id/like", h.Like)
	api.Delete("/posts/:id/like", h.Unlike)
	api.Post("/posts/:id/bookmark", h.Bookmark)
	api.Delete("/posts/:id/bookmark", h.Unbookmark)
	api.Get("/posts/:id/comments", h.GetComments)
	api.Post("/posts/:id/comments", h.AddComment)
	api.Get("/trending", h.TrendingTags)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}
	log.Printf("Post service on :%s", port)
	log.Fatal(app.Listen(":" + port))
}