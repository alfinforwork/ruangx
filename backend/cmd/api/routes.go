package main

import (
	"github.com/gofiber/fiber/v3"

	authHandler "github.com/alfinokio/ruangx/internal/handler/auth"
	bookmarkHandler "github.com/alfinokio/ruangx/internal/handler/bookmark"
	followHandler "github.com/alfinokio/ruangx/internal/handler/follow"
	hashtagHandler "github.com/alfinokio/ruangx/internal/handler/hashtag"
	likeHandler "github.com/alfinokio/ruangx/internal/handler/like"
	messageHandler "github.com/alfinokio/ruangx/internal/handler/message"
	notifHandler "github.com/alfinokio/ruangx/internal/handler/notification"
	postHandler "github.com/alfinokio/ruangx/internal/handler/post"
	roomHandler "github.com/alfinokio/ruangx/internal/handler/room"
	timelineHandler "github.com/alfinokio/ruangx/internal/handler/timeline"
	trendHandler "github.com/alfinokio/ruangx/internal/handler/trend"
	uploadHandler "github.com/alfinokio/ruangx/internal/handler/upload"
	userHandler "github.com/alfinokio/ruangx/internal/handler/user"
)

func setupRoutes(
	app *fiber.App,
	authMw fiber.Handler,
	authH *authHandler.Handler,
	postH *postHandler.Handler,
	userH *userHandler.Handler,
	likeH *likeHandler.Handler,
	bookmarkH *bookmarkHandler.Handler,
	followH *followHandler.Handler,
	roomH *roomHandler.Handler,
	hashtagH *hashtagHandler.Handler,
	notifH *notifHandler.Handler,
	msgH *messageHandler.Handler,
	trendH *trendHandler.Handler,
	uploadH *uploadHandler.Handler,
	timelineH *timelineHandler.Handler,
) {
	api := app.Group("/api/v1")

	// Health check
	api.Get("/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "ruangx"})
	})

	// Auth routes (public)
	auth := api.Group("/auth")
	auth.Post("/register", authH.Register)
	auth.Post("/login", authH.Login)
	auth.Post("/refresh", authH.Refresh)
	auth.Post("/logout", authMw, authH.Logout)

	// Post routes
	posts := api.Group("/posts")
	posts.Post("/", authMw, postH.Create)
	posts.Get("/", authMw, postH.GetFeed)
	posts.Get("/:id", postH.GetByID)
	posts.Get("/:id/thread", postH.GetThread)
	posts.Delete("/:id", authMw, postH.Delete)
	posts.Post("/:id/like", authMw, likeH.Toggle)
	posts.Post("/:id/bookmark", authMw, bookmarkH.Toggle)

	// User routes
	users := api.Group("/users")
	users.Get("/search", authMw, userH.Search)
	users.Put("/me", authMw, userH.UpdateProfile)
	users.Get("/:username", userH.GetProfile)
	users.Get("/:username/posts", postH.GetByUser)
	users.Post("/:username/follow", authMw, followH.Follow)
	users.Delete("/:username/follow", authMw, followH.Unfollow)
	users.Get("/:username/followers", followH.GetFollowers)
	users.Get("/:username/following", followH.GetFollowing)

	// Bookmark routes
	api.Get("/bookmarks", authMw, bookmarkH.GetBookmarks)

	// Room routes
	rooms := api.Group("/rooms")
	rooms.Post("/", authMw, roomH.Create)
	rooms.Get("/", roomH.GetPopular)
	rooms.Get("/:id", roomH.GetByID)
	rooms.Post("/:id/join", authMw, roomH.Join)
	rooms.Delete("/:id/leave", authMw, roomH.Leave)

	// Hashtag routes
	hashtags := api.Group("/hashtags")
	hashtags.Get("/trending", hashtagH.GetTrending)
	hashtags.Get("/:tag", hashtagH.GetByTag)

	// Notification routes
	notifs := api.Group("/notifications")
	notifs.Get("/", authMw, notifH.GetNotifications)
	notifs.Put("/read", authMw, notifH.MarkRead)
	notifs.Put("/read-all", authMw, notifH.MarkAllRead)
	notifs.Get("/unread-count", authMw, notifH.CountUnread)

	// Message routes
	messages := api.Group("/messages")
	messages.Post("/", authMw, msgH.Send)
	api.Get("/conversations", authMw, msgH.GetConversations)
	api.Get("/conversations/:id/messages", authMw, msgH.GetMessages)

	// Trend routes
	api.Get("/trends", trendH.GetTrending)

	// Upload route
	api.Post("/upload", authMw, uploadH.Upload)

	// Timeline route
	api.Get("/timeline", authMw, timelineH.GetTimeline)
}