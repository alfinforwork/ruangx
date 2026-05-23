package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/ruangx/chat-service/config"
	"github.com/ruangx/chat-service/internal/handler"
	"github.com/ruangx/chat-service/internal/repository"
	"github.com/ruangx/chat-service/internal/service"
)

func main() {
	cfg := config.Load()

	db := repository.NewPostgres(cfg.DatabaseURL)
	if err := db.Migrate(); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	chatRepo := repository.NewChatRepo(db.DB)
	svc := service.NewChatService(chatRepo)
	h := handler.NewChatHandler(svc)

	app := fiber.New()
	app.Use(cors.New())
	app.Use(logger.New())

	api := app.Group("/api/chat")
	api.Get("/conversations", h.GetConversations)
	api.Get("/messages/:userId", h.GetMessages)
	api.Post("/messages", h.SendMessage)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8083"
	}
	log.Printf("Chat service on :%s", port)
	log.Fatal(app.Listen(":" + port))
}