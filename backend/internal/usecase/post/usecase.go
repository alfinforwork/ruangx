package post

import (
	"context"
	"regexp"
	"strings"

	"github.com/alfinokio/ruangx/internal/domain/hashtag"
	"github.com/alfinokio/ruangx/internal/domain/notification"
	postdomain "github.com/alfinokio/ruangx/internal/domain/post"
	"github.com/alfinokio/ruangx/internal/domain/user"
	"github.com/alfinokio/ruangx/internal/dto"
	apperrors "github.com/alfinokio/ruangx/pkg/errors"
)

var hashtagRegex = regexp.MustCompile(`#(\w+)`)

type PostRepository interface {
	Create(ctx context.Context, p *postdomain.Post) error
	FindByID(ctx context.Context, id string) (*postdomain.Post, error)
	FindFeed(ctx context.Context, userID string, cursor string, limit int) ([]*postdomain.Post, string, error)
	FindByUser(ctx context.Context, userID string, cursor string, limit int) ([]*postdomain.Post, string, error)
	FindByThread(ctx context.Context, threadID string) ([]*postdomain.Post, error)
	FindByRoom(ctx context.Context, roomID string, cursor string, limit int) ([]*postdomain.Post, string, error)
	Update(ctx context.Context, p *postdomain.Post) error
	Delete(ctx context.Context, id string) error
}

type HashtagRepository interface {
	FindOrCreate(ctx context.Context, tag string) (*hashtag.Hashtag, error)
	LinkToPost(ctx context.Context, postID, hashtagID string) error
	GetForPost(ctx context.Context, postID string) ([]*hashtag.Hashtag, error)
}

type TrendRepository interface {
	Increment(ctx context.Context, trendType, name string, count int) error
}

type UserRepository interface {
	FindByID(ctx context.Context, id string) (*user.User, error)
}

type NotificationRepository interface {
	Create(ctx context.Context, n *notification.Notification) error
}

type UseCase struct {
	postRepo PostRepository
	hashtagRepo HashtagRepository
	trendRepo TrendRepository
	userRepo  UserRepository
	notifRepo NotificationRepository
}

func NewUseCase(
	postRepo PostRepository,
	hashtagRepo HashtagRepository,
	trendRepo TrendRepository,
	userRepo UserRepository,
	notifRepo NotificationRepository,
) *UseCase {
	return &UseCase{
		postRepo:    postRepo,
		hashtagRepo: hashtagRepo,
		trendRepo:   trendRepo,
		userRepo:    userRepo,
		notifRepo:   notifRepo,
	}
}

func (uc *UseCase) CreatePost(ctx context.Context, userID string, req dto.CreatePostRequest) (*dto.PostResponse, error) {
	p := &postdomain.Post{
		UserID:       userID,
		Content:      req.ContentHTML,
		ContentPlain: req.Content,
		ThreadID:     req.ThreadID,
		ParentID:     req.ParentID,
		RoomID:       req.RoomID,
	}

	if err := uc.postRepo.Create(ctx, p); err != nil {
		return nil, apperrors.Wrap(err, "Failed to create post")
	}

	// Handle hashtags
	tags := extractHashtags(req.Content)
	for _, tag := range tags {
		h, err := uc.hashtagRepo.FindOrCreate(ctx, strings.ToLower(tag))
		if err != nil {
			continue
		}
		uc.hashtagRepo.LinkToPost(ctx, p.ID, h.ID)
		uc.trendRepo.Increment(ctx, "hashtag", "#"+strings.ToLower(tag), 1)
	}

	// If reply, notify parent post owner
	if req.ParentID != nil {
		parent, err := uc.postRepo.FindByID(ctx, *req.ParentID)
		if err == nil && parent != nil && parent.UserID != userID {
			uc.notifRepo.Create(ctx, &notification.Notification{
				UserID:  parent.UserID,
				ActorID: &userID,
				Type:    "reply",
				PostID:  &p.ID,
			})
		}
	}

	resp := dto.PostToResponse(p)
	resp.Hashtags = tags
	return &resp, nil
}

func (uc *UseCase) GetPost(ctx context.Context, id string) (*dto.PostResponse, error) {
	p, err := uc.postRepo.FindByID(ctx, id)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to find post")
	}
	if p == nil {
		return nil, apperrors.ErrNotFound
	}

	u, err := uc.userRepo.FindByID(ctx, p.UserID)
	if err == nil && u != nil {
		p.User = &postdomain.PostUser{
			ID:          u.ID,
			Username:    u.Username,
			DisplayName: u.DisplayName,
			AvatarURL:   u.AvatarURL,
			IsVerified:  u.IsVerified,
		}
	}

	tags, _ := uc.hashtagRepo.GetForPost(ctx, p.ID)
	for _, t := range tags {
		p.Hashtags = append(p.Hashtags, t.Tag)
	}

	resp := dto.PostToResponseWithUser(p)
	return &resp, nil
}

func (uc *UseCase) GetFeed(ctx context.Context, userID, cursor string, limit int) (*dto.FeedResponse, error) {
	posts, nextCursor, err := uc.postRepo.FindFeed(ctx, userID, cursor, limit)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to get feed")
	}

	responses := make([]dto.PostResponse, len(posts))
	for i, p := range posts {
		responses[i] = dto.PostToResponseWithUser(p)
	}

	hasMore := nextCursor != ""
	return &dto.FeedResponse{
		Posts:   responses,
		Cursor:  nextCursor,
		HasMore: hasMore,
		Limit:   limit,
	}, nil
}

func (uc *UseCase) GetThread(ctx context.Context, threadID string) ([]dto.PostResponse, error) {
	posts, err := uc.postRepo.FindByThread(ctx, threadID)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to get thread")
	}

	responses := make([]dto.PostResponse, len(posts))
	for i, p := range posts {
		responses[i] = dto.PostToResponseWithUser(p)
	}
	return responses, nil
}

func (uc *UseCase) DeletePost(ctx context.Context, postID, userID string) error {
	p, err := uc.postRepo.FindByID(ctx, postID)
	if err != nil {
		return apperrors.Wrap(err, "Failed to find post")
	}
	if p == nil {
		return apperrors.ErrNotFound
	}
	if p.UserID != userID {
		return apperrors.ErrForbidden
	}

	return uc.postRepo.Delete(ctx, postID)
}

func (uc *UseCase) GetUserPosts(ctx context.Context, userID, cursor string, limit int) (*dto.FeedResponse, error) {
	posts, nextCursor, err := uc.postRepo.FindByUser(ctx, userID, cursor, limit)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to get user posts")
	}

	responses := make([]dto.PostResponse, len(posts))
	for i, p := range posts {
		responses[i] = dto.PostToResponseWithUser(p)
	}

	hasMore := nextCursor != ""
	return &dto.FeedResponse{
		Posts:   responses,
		Cursor:  nextCursor,
		HasMore: hasMore,
		Limit:   limit,
	}, nil
}

func (uc *UseCase) SearchPosts(ctx context.Context, query, cursor string, limit int) (*dto.FeedResponse, error) {
	// Simplified search - query by content_plain pattern
	// For full-text search, PostgreSQL tsvector should be used
	u, err := uc.userRepo.FindByID(ctx, query)
	if err == nil && u != nil {
		return uc.GetUserPosts(ctx, u.ID, cursor, limit)
	}

	if strings.HasPrefix(query, "#") {
		return nil, apperrors.NewAppError(501, "Hashtag search not yet implemented")
	}

	return nil, apperrors.NewAppError(501, "Search by content not fully implemented")
}

func extractHashtags(content string) []string {
	matches := hashtagRegex.FindAllStringSubmatch(content, -1)
	tags := make([]string, 0, len(matches))
	seen := make(map[string]bool)
	for _, m := range matches {
		tag := strings.ToLower(m[1])
		if !seen[tag] && len(tag) <= 100 {
			seen[tag] = true
			tags = append(tags, tag)
		}
	}
	return tags
}

func (uc *UseCase) GetRoomPosts(ctx context.Context, roomID, cursor string, limit int) (*dto.FeedResponse, error) {
	posts, nextCursor, err := uc.postRepo.FindByRoom(ctx, roomID, cursor, limit)
	if err != nil {
		return nil, apperrors.Wrap(err, "Failed to get room posts")
	}

	responses := make([]dto.PostResponse, len(posts))
	for i, p := range posts {
		responses[i] = dto.PostToResponseWithUser(p)
	}

	hasMore := nextCursor != ""
	return &dto.FeedResponse{
		Posts:   responses,
		Cursor:  nextCursor,
		HasMore: hasMore,
		Limit:   limit,
	}, nil
}