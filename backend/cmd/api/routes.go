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
	// Public routes (no auth)
	api := app.Group("/api/v1")

	api.Get("/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "ruangx"})
	})

	auth := api.Group("/auth")
	auth.Post("/register", authH.Register)
	auth.Post("/login", authH.Login)
	auth.Post("/refresh", authH.Refresh)

	// Public post/user lookup
	// NOTE: /users/search must come BEFORE /users/:username to avoid route shadowing
	api.Get("/users/search", authMw, userH.Search)
	api.Get("/users/:username", userH.GetProfile)
	api.Get("/users/:username/posts", postH.GetByUser)
	api.Get("/users/:username/followers", followH.GetFollowers)
	api.Get("/users/:username/following", followH.GetFollowing)
	api.Get("/posts/:id", postH.GetByID)
	api.Get("/posts/:id/thread", postH.GetThread)
	api.Get("/rooms/", roomH.GetPopular)
	api.Get("/rooms/:id", roomH.GetByID)
	api.Get("/hashtags/trending", hashtagH.GetTrending)
	api.Get("/hashtags/:tag", hashtagH.GetByTag)
	api.Get("/trends", trendH.GetTrending)

	// Authenticated routes
	authApi := app.Group("/api/v1")
	authApi.Use(authMw)

	authApi.Post("/auth/logout", authH.Logout)
	authApi.Post("/posts/", postH.Create)
	authApi.Get("/posts/", postH.GetFeed)
	authApi.Delete("/posts/:id", postH.Delete)
	authApi.Post("/posts/:id/like", likeH.Toggle)
	authApi.Post("/posts/:id/bookmark", bookmarkH.Toggle)
	// /users/search already registered with authMw on public group above
	authApi.Put("/users/me", userH.UpdateProfile)
	authApi.Post("/users/:username/follow", followH.Follow)
	authApi.Delete("/users/:username/follow", followH.Unfollow)
	authApi.Get("/bookmarks", bookmarkH.GetBookmarks)
	authApi.Post("/rooms/", roomH.Create)
	authApi.Post("/rooms/:id/join", roomH.Join)
	authApi.Delete("/rooms/:id/leave", roomH.Leave)
	authApi.Get("/notifications/", notifH.GetNotifications)
	authApi.Put("/notifications/read", notifH.MarkRead)
	authApi.Put("/notifications/read-all", notifH.MarkAllRead)
	authApi.Get("/notifications/unread-count", notifH.CountUnread)
	authApi.Post("/messages/", msgH.Send)
	authApi.Get("/conversations", msgH.GetConversations)
	authApi.Get("/conversations/:id/messages", msgH.GetMessages)
	authApi.Post("/upload", uploadH.Upload)
	authApi.Get("/timeline", timelineH.GetTimeline)
}