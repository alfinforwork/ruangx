package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/v9"

	"github.com/alfinokio/ruangx/internal/domain/post"
)

type SessionCache struct {
	client *redis.Client
}

func NewSessionCache(client *redis.Client) *SessionCache {
	return &SessionCache{client: client}
}

func (c *SessionCache) SetRefreshToken(ctx context.Context, userID, tokenID string, ttl time.Duration) error {
	key := fmt.Sprintf("refresh:%s:%s", userID, tokenID)
	return c.client.Set(ctx, key, "1", ttl).Err()
}

func (c *SessionCache) ValidateRefreshToken(ctx context.Context, userID, tokenID string) (bool, error) {
	key := fmt.Sprintf("refresh:%s:%s", userID, tokenID)
	_, err := c.client.Get(ctx, key).Result()
	if err == redis.Nil {
		return false, nil
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

func (c *SessionCache) DeleteRefreshToken(ctx context.Context, userID, tokenID string) error {
	key := fmt.Sprintf("refresh:%s:%s", userID, tokenID)
	return c.client.Del(ctx, key).Err()
}

type FeedCache struct {
	client *redis.Client
}

func NewFeedCache(client *redis.Client) *FeedCache {
	return &FeedCache{client: client}
}

func (c *FeedCache) GetFeed(ctx context.Context, userID string) ([]*post.Post, error) {
	key := fmt.Sprintf("feed:%s", userID)
	data, err := c.client.Get(ctx, key).Bytes()
	if err == redis.Nil {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	var posts []*post.Post
	if err := json.Unmarshal(data, &posts); err != nil {
		return nil, err
	}
	return posts, nil
}

func (c *FeedCache) SetFeed(ctx context.Context, userID string, posts []*post.Post, ttl time.Duration) error {
	key := fmt.Sprintf("feed:%s", userID)
	data, err := json.Marshal(posts)
	if err != nil {
		return err
	}
	return c.client.Set(ctx, key, data, ttl).Err()
}

func (c *FeedCache) InvalidateFeed(ctx context.Context, userID string) error {
	key := fmt.Sprintf("feed:%s", userID)
	return c.client.Del(ctx, key).Err()
}

type RateLimitStore struct {
	client *redis.Client
}

func NewRateLimitStore(client *redis.Client) *RateLimitStore {
	return &RateLimitStore{client: client}
}

func (s *RateLimitStore) CheckRateLimit(ctx context.Context, key string, limit int, window time.Duration) (bool, int, error) {
	pipe := s.client.Pipeline()
	pipe.Incr(ctx, key)
	pipe.Expire(ctx, key, window)
	cmds, err := pipe.Exec(ctx)
	if err != nil {
		return false, 0, fmt.Errorf("rate limit error: %w", err)
	}

	count := cmds[0].(*redis.IntCmd).Val()
	if count > int64(limit) {
		return true, int(count), nil
	}

	return false, int(count), nil
}