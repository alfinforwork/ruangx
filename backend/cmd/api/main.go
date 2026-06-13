package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"
	"time"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/recover"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/alfinokio/ruangx/config"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	"github.com/golang-migrate/migrate/v4"
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
	"github.com/alfinokio/ruangx/internal/infrastructure/cache"
	"github.com/alfinokio/ruangx/internal/infrastructure/dbpool"
	"github.com/alfinokio/ruangx/internal/infrastructure/jwt"
	"github.com/alfinokio/ruangx/internal/infrastructure/s3"
	"github.com/alfinokio/ruangx/internal/middleware"
	pg "github.com/alfinokio/ruangx/internal/repository/postgres"
	rc "github.com/alfinokio/ruangx/internal/repository/redis"
	authUC "github.com/alfinokio/ruangx/internal/usecase/auth"
	bookmarkUC "github.com/alfinokio/ruangx/internal/usecase/bookmark"
	followUC "github.com/alfinokio/ruangx/internal/usecase/follow"
	hashtagUC "github.com/alfinokio/ruangx/internal/usecase/hashtag"
	likeUC "github.com/alfinokio/ruangx/internal/usecase/like"
	messageUC "github.com/alfinokio/ruangx/internal/usecase/message"
	notifUC "github.com/alfinokio/ruangx/internal/usecase/notification"
	postUC "github.com/alfinokio/ruangx/internal/usecase/post"
	roomUC "github.com/alfinokio/ruangx/internal/usecase/room"
	timelineUC "github.com/alfinokio/ruangx/internal/usecase/timeline"
	trendUC "github.com/alfinokio/ruangx/internal/usecase/trend"
	uploadUC "github.com/alfinokio/ruangx/internal/usecase/upload"
	userUC "github.com/alfinokio/ruangx/internal/usecase/user"
	"github.com/alfinokio/ruangx/pkg/response"
)

func init() {
	log.Logger = zerolog.New(zerolog.ConsoleWriter{
		Out:        os.Stdout,
		TimeFormat: time.RFC3339,
	}).With().Timestamp().Caller().Logger()

	zerolog.SetGlobalLevel(zerolog.InfoLevel)
}

func runMigrations(dsn string) error {
	m, err := migrate.New("file://migrations", dsn)
	if err != nil {
		return fmt.Errorf("migrate init: %w", err)
	}
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		return fmt.Errorf("migrate up: %w", err)
	}
	log.Info().Msg("Migrations applied successfully")
	return nil
}

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to load config")
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	accessTTL, err := time.ParseDuration(cfg.JWTAccessExpiry)
	if err != nil {
		accessTTL = 15 * time.Minute
	}
	refreshTTL, err := time.ParseDuration(cfg.JWTRefreshExpiry)
	if err != nil {
		refreshTTL = 168 * time.Hour
	}

	dsn := dbpool.DSN(cfg.DBHost, cfg.DBPort, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBSSLMode)
	pool, err := dbpool.NewPool(ctx, dsn)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to database")
	}
	defer pool.Close()

	// Auto-migrate database
	if err := runMigrations(dsn); err != nil {
		log.Warn().Err(err).Msg("Migration warning (continuing anyway)")
	}

	db := 0
	redisAddr := cfg.RedisHost
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}
	rdb, err := cache.NewRedis(ctx, redisAddr, cfg.RedisPassword, db)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to connect to Redis")
	}
	defer rdb.Close()

	jwtSvc := jwt.New(cfg.JWTSecret, accessTTL, refreshTTL)

	useSSL := cfg.S3UseSSL == "true"
	s3Endpoint := strings.TrimPrefix(cfg.S3Endpoint, "http://")
	s3Endpoint = strings.TrimPrefix(s3Endpoint, "https://")

	s3Client, err := s3.New(s3Endpoint, cfg.S3AccessKey, cfg.S3SecretKey, cfg.S3Bucket, cfg.S3Region, useSSL)
	if err != nil {
		log.Fatal().Err(err).Msg("Failed to initialize S3 client")
	}

	if err := s3Client.EnsureBucket(ctx); err != nil {
		log.Warn().Err(err).Msg("Failed to ensure S3 bucket exists")
	}

	userRepo := pg.NewUserRepository(pool)
	postRepo := pg.NewPostRepository(pool)
	likeRepo := pg.NewLikeRepository(pool)
	bookmarkRepo := pg.NewBookmarkRepository(pool)
	followRepo := pg.NewFollowRepository(pool)
	roomRepo := pg.NewRoomRepository(pool)
	hashtagRepo := pg.NewHashtagRepository(pool)
	notifRepo := pg.NewNotificationRepository(pool)
	convRepo := pg.NewConversationRepository(pool)
	msgRepo := pg.NewMessageRepository(pool)
	trendRepo := pg.NewTrendRepository(pool)

	sessionCache := rc.NewSessionCache(rdb)
	feedCache := rc.NewFeedCache(rdb)
	rateLimitStore := rc.NewRateLimitStore(rdb)

	_ = feedCache
	_ = rateLimitStore

	authUseCase := authUC.NewUseCase(userRepo, jwtSvc, sessionCache, accessTTL, refreshTTL)
	postUseCase := postUC.NewUseCase(postRepo, hashtagRepo, trendRepo, userRepo, notifRepo)
	userUseCase := userUC.NewUseCase(userRepo)
	likeUseCase := likeUC.NewUseCase(likeRepo, postRepo, notifRepo)
	bookmarkUseCase := bookmarkUC.NewUseCase(bookmarkRepo, postRepo)
	followUseCase := followUC.NewUseCase(followRepo, userRepo, notifRepo)
	roomUseCase := roomUC.NewUseCase(roomRepo)
	hashtagUseCase := hashtagUC.NewUseCase(hashtagRepo)
	notifUseCase := notifUC.NewUseCase(notifRepo)
	messageUseCase := messageUC.NewUseCase(convRepo, msgRepo, userRepo)
	trendUseCase := trendUC.NewUseCase(trendRepo)
	timelineUseCase := timelineUC.NewUseCase(followRepo, postRepo, userRepo)
	uploadUseCase := uploadUC.NewUseCase(s3Client.Client, cfg.S3Bucket)

	authH := authHandler.NewHandler(authUseCase)
	postH := postHandler.NewHandler(postUseCase)
	userH := userHandler.NewHandler(userUseCase)
	likeH := likeHandler.NewHandler(likeUseCase)
	bookmarkH := bookmarkHandler.NewHandler(bookmarkUseCase)
	followH := followHandler.NewHandler(followUseCase)
	roomH := roomHandler.NewHandler(roomUseCase)
	hashtagH := hashtagHandler.NewHandler(hashtagUseCase)
	notifH := notifHandler.NewHandler(notifUseCase)
	msgH := messageHandler.NewHandler(messageUseCase)
	trendH := trendHandler.NewHandler(trendUseCase)
	uploadH := uploadHandler.NewHandler(uploadUseCase)
	timelineH := timelineHandler.NewHandler(timelineUseCase)

	app := fiber.New(fiber.Config{
		AppName:      "ruangx",
		ServerHeader: "ruangx",
		ErrorHandler: func(c fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return response.Error(c, code, err.Error())
		},
	})

	app.Use(recover.New())
	app.Use(middleware.Logger())
	app.Use(middleware.CORS(cfg.AllowedOrigins))

	app.Get("/health", func(c fiber.Ctx) error {
		return c.Status(fiber.StatusOK).JSON(map[string]string{
			"status": "ok",
		})
	})

	authMw := middleware.Auth(jwtSvc)

	

	setupRoutes(app, authMw, authH, postH, userH, likeH, bookmarkH, followH, roomH, hashtagH, notifH, msgH, trendH, uploadH, timelineH)

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)

	go func() {
		addr := fmt.Sprintf(":%s", cfg.HTTPPort)
		log.Info().Str("addr", addr).Msg("Starting server")
		if err := app.Listen(addr); err != nil {
			log.Fatal().Err(err).Msg("Failed to start server")
		}
	}()

	<-quit
	log.Info().Msg("Shutting down server...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer shutdownCancel()

	if err := app.ShutdownWithContext(shutdownCtx); err != nil {
		log.Error().Err(err).Msg("Server forced to shutdown")
	}

	log.Info().Msg("Server stopped")
}