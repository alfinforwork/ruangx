package auth

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"time"

	"golang.org/x/crypto/bcrypt"

	"github.com/alfinokio/ruangx/internal/domain/user"
	"github.com/alfinokio/ruangx/internal/dto"
	"github.com/alfinokio/ruangx/internal/infrastructure/jwt"
	apperrors "github.com/alfinokio/ruangx/pkg/errors"
)

type UserRepository interface {
	Create(ctx context.Context, u *user.User) error
	FindByUsername(ctx context.Context, username string) (*user.User, error)
	FindByEmail(ctx context.Context, email string) (*user.User, error)
	FindByID(ctx context.Context, id string) (*user.User, error)
}

type SessionCache interface {
	SetRefreshToken(ctx context.Context, userID, tokenID string, ttl time.Duration) error
	ValidateRefreshToken(ctx context.Context, userID, tokenID string) (bool, error)
	DeleteRefreshToken(ctx context.Context, userID, tokenID string) error
}

type UseCase struct {
	userRepo   UserRepository
	jwt        *jwt.JWTService
	sessions   SessionCache
	accessTTL  time.Duration
	refreshTTL time.Duration
}

func NewUseCase(userRepo UserRepository, jwtSvc *jwt.JWTService, sessions SessionCache, accessTTL, refreshTTL time.Duration) *UseCase {
	return &UseCase{
		userRepo:   userRepo,
		jwt:        jwtSvc,
		sessions:   sessions,
		accessTTL:  accessTTL,
		refreshTTL: refreshTTL,
	}
}

func (uc *UseCase) Register(ctx context.Context, req dto.RegisterRequest) (*dto.AuthResponse, error) {
	existingUser, _ := uc.userRepo.FindByUsername(ctx, req.Username)
	if existingUser != nil {
		return nil, apperrors.NewAppError(409, "Username already taken")
	}

	existingEmail, _ := uc.userRepo.FindByEmail(ctx, req.Email)
	if existingEmail != nil {
		return nil, apperrors.NewAppError(409, "Email already registered")
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to hash password")
	}

	u := &user.User{
		Username:     req.Username,
		DisplayName:  req.DisplayName,
		Email:        req.Email,
		PasswordHash: string(hash),
	}

	if err := uc.userRepo.Create(ctx, u); err != nil {
		return nil, apperrors.Wrap(err, "Failed to create user")
	}

	tokens, err := uc.jwt.GenerateTokenPair(u.ID)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to generate tokens")
	}

	tokenID := generateTokenID()
	if err := uc.sessions.SetRefreshToken(ctx, u.ID, tokenID, uc.refreshTTL); err != nil {
		return nil, apperrors.Wrap(err, "Failed to store session")
	}

	return &dto.AuthResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken + ":" + tokenID,
		User:         dto.UserToResponse(u),
	}, nil
}

func (uc *UseCase) Login(ctx context.Context, req dto.LoginRequest) (*dto.AuthResponse, error) {
	// Try find by username first, then email
	u, err := uc.userRepo.FindByUsername(ctx, req.Identifier)
	if err != nil {
		return nil, apperrors.ErrInternal
	}
	if u == nil {
		// Try by email
		u, err = uc.userRepo.FindByEmail(ctx, req.Identifier)
		if err != nil {
			return nil, apperrors.ErrInternal
		}
	}
	if u == nil {
		return nil, apperrors.NewAppError(401, "Invalid username or password")
	}

	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(req.Password)); err != nil {
		return nil, apperrors.NewAppError(401, "Invalid username or password")
	}

	tokens, err := uc.jwt.GenerateTokenPair(u.ID)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to generate tokens")
	}

	tokenID := generateTokenID()
	if err := uc.sessions.SetRefreshToken(ctx, u.ID, tokenID, uc.refreshTTL); err != nil {
		return nil, apperrors.Wrap(err, "Failed to store session")
	}

	return &dto.AuthResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken + ":" + tokenID,
		User:         dto.UserToResponse(u),
	}, nil
}

func (uc *UseCase) RefreshToken(ctx context.Context, refreshTokenStr string) (*dto.AuthResponse, error) {
	claims, err := uc.jwt.ValidateToken(refreshTokenStr)
	if err != nil {
		return nil, apperrors.ErrUnauthorized
	}

	u, err := uc.userRepo.FindByID(ctx, claims.UserID)
	if err != nil || u == nil {
		return nil, apperrors.ErrUnauthorized
	}

	tokens, err := uc.jwt.GenerateTokenPair(u.ID)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to generate tokens")
	}

	tokenID := generateTokenID()
	if err := uc.sessions.SetRefreshToken(ctx, u.ID, tokenID, uc.refreshTTL); err != nil {
		return nil, apperrors.Wrap(err, "Failed to store session")
	}

	return &dto.AuthResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken + ":" + tokenID,
		User:         dto.UserToResponse(u),
	}, nil
}

func (uc *UseCase) Logout(ctx context.Context, userID string, refreshTokenID string) error {
	if err := uc.sessions.DeleteRefreshToken(ctx, userID, refreshTokenID); err != nil {
		return apperrors.Wrap(err, "Failed to delete session")
	}
	return nil
}

func generateTokenID() string {
	b := make([]byte, 16)
	rand.Read(b)
	return hex.EncodeToString(b)
}