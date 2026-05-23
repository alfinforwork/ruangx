package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/ruangx/auth-service/config"
	"github.com/ruangx/auth-service/internal/handler"
	"github.com/ruangx/auth-service/internal/repository"
	"github.com/ruangx/auth-service/internal/service"
)

func main() {
	cfg := config.Load()

	db := repository.NewPostgres(cfg.DatabaseURL)
	if err := db.Migrate(); err != nil {
		log.Fatalf("migrate: %v", err)
	}

	repo := repository.NewAuthRepo(db.DB)
	svc := service.NewAuthService(repo, cfg.JWTSecret)
	h := handler.NewAuthHandler(svc)

	app := fiber.New()
	app.Use(cors.New())
	app.Use(logger.New())

	api := app.Group("/api/auth")
	api.Post("/register", h.Register)
	api.Post("/login", h.Login)
	api.Post("/forgot-password", h.ForgotPassword)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}
	log.Printf("Auth service on :%s", port)
	log.Fatal(app.Listen(":" + port))
}