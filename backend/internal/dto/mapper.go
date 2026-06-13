package dto

import (
	"time"

	"github.com/alfinokio/ruangx/internal/domain/notification"
	"github.com/alfinokio/ruangx/internal/domain/post"
	"github.com/alfinokio/ruangx/internal/domain/room"
	"github.com/alfinokio/ruangx/internal/domain/trend"
	"github.com/alfinokio/ruangx/internal/domain/user"
)

func UserToResponse(u *user.User) UserResponse {
	return UserResponse{
		ID:             u.ID,
		Username:       u.Username,
		DisplayName:    u.DisplayName,
		Bio:            u.Bio,
		AvatarURL:      u.AvatarURL,
		BannerURL:      u.BannerURL,
		Website:        u.Website,
		Location:       u.Location,
		IsVerified:     u.IsVerified,
		IsPrivate:      u.IsPrivate,
		FollowerCount:  u.FollowerCount,
		FollowingCount: u.FollowingCount,
		PostCount:      u.PostCount,
		CreatedAt:      u.CreatedAt.Format(time.RFC3339),
	}
}

func PostToResponse(p *post.Post) PostResponse {
	media := make([]PostMediaResponse, len(p.Media))
	for i, m := range p.Media {
		media[i] = PostMediaResponse{
			ID:           m.ID,
			URL:          m.URL,
			ThumbnailURL: m.ThumbnailURL,
			MediaType:    m.MediaType,
			Width:        m.Width,
			Height:       m.Height,
			AltText:      m.AltText,
		}
	}

	return PostResponse{
		ID:            p.ID,
		Content:       p.Content,
		ContentPlain:  p.ContentPlain,
		ThreadID:      p.ThreadID,
		ParentID:      p.ParentID,
		RoomID:        p.RoomID,
		ReplyCount:    p.ReplyCount,
		LikeCount:     p.LikeCount,
		BookmarkCount: p.BookmarkCount,
		ViewCount:     p.ViewCount,
		IsLiked:       p.IsLiked,
		IsBookmarked:  p.IsBookmarked,
		CreatedAt:     p.CreatedAt.Format(time.RFC3339),
		Hashtags:      p.Hashtags,
		Media:         media,
	}
}

func PostToResponseWithUser(p *post.Post) PostResponse {
	resp := PostToResponse(p)
	if p.User != nil {
		u := UserResponse{
			ID:          p.User.ID,
			Username:    p.User.Username,
			DisplayName: p.User.DisplayName,
			AvatarURL:   p.User.AvatarURL,
			IsVerified:  p.User.IsVerified,
		}
		resp.User = &u
	}
	return resp
}

func RoomToResponse(r *room.Room) RoomResponse {
	return RoomResponse{
		ID:          r.ID,
		Name:        r.Name,
		Description: r.Description,
		Icon:        r.Icon,
		BannerURL:   r.BannerURL,
		Color:       r.Color,
		MemberCount: r.MemberCount,
		PostCount:   r.PostCount,
		IsPrivate:   r.IsPrivate,
		IsNSFW:      r.IsNSFW,
		IsMember:    r.IsMember,
		CreatedAt:   r.CreatedAt.Format(time.RFC3339),
	}
}

func TrendToResponse(t *trend.Trend) TrendResponse {
	return TrendResponse{
		ID:        t.ID,
		TrendType: t.TrendType,
		Name:      t.Name,
		PostCount: t.PostCount,
		Score:     t.Score,
		Category:  t.Category,
		Region:    t.Region,
	}
}

func NotifToResponse(n *notification.Notification) NotificationResponse {
	resp := NotificationResponse{
		ID:        n.ID,
		Type:      n.Type,
		Message:   n.Message,
		PostID:    n.PostID,
		RoomID:    n.RoomID,
		IsRead:    n.IsRead,
		CreatedAt: n.CreatedAt.Format(time.RFC3339),
	}
	if n.Actor != nil {
		u := UserResponse{
			ID:          n.Actor.ID,
			Username:    n.Actor.Username,
			DisplayName: n.Actor.DisplayName,
			AvatarURL:   n.Actor.AvatarURL,
		}
		resp.Actor = &u
	}
	return resp
}