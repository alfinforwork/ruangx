package service

import (
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/ruangx/auth-service/internal/model"
	"github.com/ruangx/auth-service/internal/repository"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	repo      *repository.AuthRepo
	jwtSecret []byte
}

func NewAuthService(repo *repository.AuthRepo, secret string) *AuthService {
	return &AuthService{repo: repo, jwtSecret: []byte(secret)}
}

func (s *AuthService) Register(name, email, password string) (*model.User, string, error) {
	existing, _ := s.repo.FindByEmail(email)
	if existing != nil {
		return nil, "", errors.New("email already registered")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, "", err
	}
	u := &model.User{Name: name, Email: email, PasswordHash: string(hash)}
	if err := s.repo.Create(u); err != nil {
		return nil, "", err
	}
	token, err := s.generateToken(u.ID)
	return u, token, err
}

func (s *AuthService) Login(email, password string) (*model.User, string, error) {
	u, err := s.repo.FindByEmail(email)
	if err != nil || u == nil {
		return nil, "", errors.New("invalid email or password")
	}
	if err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)); err != nil {
		return nil, "", errors.New("invalid email or password")
	}
	token, err := s.generateToken(u.ID)
	return u, token, err
}

func (s *AuthService) ForgotPassword(email string) error {
	u, _ := s.repo.FindByEmail(email)
	if u == nil {
		return nil // don't reveal existence
	}
	// TODO: send email with reset link
	return nil
}

func (s *AuthService) ValidateToken(tokenStr string) (string, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
		return s.jwtSecret, nil
	})
	if err != nil || !token.Valid {
		return "", errors.New("invalid token")
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return "", errors.New("invalid claims")
	}
	sub, _ := claims["sub"].(string)
	return sub, nil
}

func (s *AuthService) GetUser(id string) (*model.User, error) {
	return s.repo.FindByID(id)
}

func (s *AuthService) generateToken(userID string) (string, error) {
	claims := jwt.MapClaims{
		"sub": userID,
		"exp": time.Now().Add(7 * 24 * time.Hour).Unix(),
		"iat": time.Now().Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(s.jwtSecret)
}