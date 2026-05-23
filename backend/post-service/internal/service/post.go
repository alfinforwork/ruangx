package service

import (
	"errors"

	"github.com/ruangx/post-service/internal/model"
	"github.com/ruangx/post-service/internal/repository"
)

type PostService struct {
	repo *repository.PostRepo
}

func NewPostService(repo *repository.PostRepo) *PostService {
	return &PostService{repo: repo}
}

func (s *PostService) Create(userID, content string, mediaURLs []string) (*model.Post, error) {
	p := &model.Post{UserID: userID, Content: content, MediaURLs: mediaURLs}
	if err := s.repo.Create(p); err != nil {
		return nil, err
	}
	return p, nil
}

func (s *PostService) GetFeed(page int) ([]*model.Post, error) {
	if page < 1 {
		page = 1
	}
	return s.repo.GetFeed(page, 20)
}

func (s *PostService) GetByID(id, userID string) (*model.Post, error) {
	if err := s.repo.IncrementView(id); err != nil {
		return nil, err
	}
	p, err := s.repo.GetByID(id)
	if err != nil {
		return nil, err
	}
	if p == nil {
		return nil, errors.New("post not found")
	}
	if userID != "" {
		p.IsLiked, _ = s.repo.IsLiked(userID, id)
		p.IsBookmarked, _ = s.repo.IsBookmarked(userID, id)
	}
	return p, nil
}

func (s *PostService) Like(userID, postID string) error {
	return s.repo.Like(userID, postID)
}

func (s *PostService) Unlike(userID, postID string) error {
	return s.repo.Unlike(userID, postID)
}

func (s *PostService) Bookmark(userID, postID string) error {
	return s.repo.Bookmark(userID, postID)
}

func (s *PostService) Unbookmark(userID, postID string) error {
	return s.repo.Unbookmark(userID, postID)
}

func (s *PostService) GetComments(postID string) ([]*model.Comment, error) {
	return s.repo.GetComments(postID)
}

func (s *PostService) AddComment(postID, userID, content string, parentID *string) (*model.Comment, error) {
	c := &model.Comment{PostID: postID, UserID: userID, Content: content, ParentID: parentID}
	if err := s.repo.AddComment(c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *PostService) GetTrendingTags() ([]string, error) {
	return s.repo.GetTrendingTags(10)
}

func (s *PostService) GetUserPosts(userID string) ([]*model.Post, error) {
	return s.repo.GetUserPosts(userID)
}

func (s *PostService) GetUserBookmarks(userID string) ([]*model.Post, error) {
	return s.repo.GetUserBookmarks(userID)
}