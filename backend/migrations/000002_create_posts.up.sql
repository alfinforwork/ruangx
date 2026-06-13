CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    content_plain TEXT NOT NULL DEFAULT '',
    thread_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    parent_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    room_id UUID,
    is_repost BOOLEAN DEFAULT false,
    repost_of UUID REFERENCES posts(id) ON DELETE SET NULL,
    is_quote BOOLEAN DEFAULT false,
    quoted_post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    reply_count INT DEFAULT 0,
    repost_count INT DEFAULT 0,
    like_count INT DEFAULT 0,
    bookmark_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts (user_id);
CREATE INDEX idx_posts_thread_id ON posts (thread_id);
CREATE INDEX idx_posts_parent_id ON posts (parent_id);
CREATE INDEX idx_posts_room_id ON posts (room_id);
CREATE INDEX idx_posts_created_at ON posts (created_at DESC);
CREATE INDEX idx_posts_user_created ON posts (user_id, created_at DESC);