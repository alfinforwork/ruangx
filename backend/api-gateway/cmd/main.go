package main

import (
	"log"
	"os"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
	"github.com/gofiber/fiber/v3/middleware/logger"
	"github.com/gofiber/fiber/v3/middleware/proxy"
)

func main() {
	app := fiber.New()
	app.Use(cors.New())
	app.Use(logger.New())

	authURL := env("AUTH_SERVICE_URL", "http://auth-service:8081")
	postURL := env("POST_SERVICE_URL", "http://post-service:8082")
	chatURL := env("CHAT_SERVICE_URL", "http://chat-service:8083")
	notifURL := env("NOTIF_SERVICE_URL", "http://notification-service:8084")

	app.All("/api/auth/*", proxy.Balancer(proxy.Config{Servers: []string{authURL}}))
	app.All("/api/posts", proxy.Balancer(proxy.Config{Servers: []string{postURL}}))
	app.All("/api/posts/*", proxy.Balancer(proxy.Config{Servers: []string{postURL}}))
	app.All("/api/trending", proxy.Balancer(proxy.Config{Servers: []string{postURL}}))
	app.All("/api/users/*", proxy.Balancer(proxy.Config{Servers: []string{postURL}}))
	app.All("/api/chat/*", proxy.Balancer(proxy.Config{Servers: []string{chatURL}}))
	app.All("/api/notifications", proxy.Balancer(proxy.Config{Servers: []string{notifURL}}))
	app.All("/api/notifications/*", proxy.Balancer(proxy.Config{Servers: []string{notifURL}}))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("API Gateway on :%s", port)
	log.Fatal(app.Listen(":" + port))
}

func env(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}