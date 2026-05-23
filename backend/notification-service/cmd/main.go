package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/ruangx/notification-service/config"
	"github.com/ruangx/notification-service/internal/handler"
	"github.com/ruangx/notification-service/internal/repository"
	"github.com/ruangx/notification-service/internal/service"
)

func main() {
	cfg := config.Load()

	db := repository.NewPostgres(cfg.DatabaseURL)
	if err := db.Migrate(); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	notifRepo := repository.NewNotifRepo(db.DB)
	svc := service.NewNotifService(notifRepo)
	h := handler.NewNotifHandler(svc)

	app := fiber.New()
	app.Use(cors.New())
	app.Use(logger.New())

	api := app.Group("/api/notifications")
	api.Get("/", h.GetAll)
	api.Put("/:id/read", h.MarkRead)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8084"
	}
	log.Printf("Notification service on :%s", port)
	log.Fatal(app.Listen(":" + port))
}