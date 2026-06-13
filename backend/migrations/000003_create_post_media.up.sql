CREATE TABLE post_media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    thumbnail_url TEXT DEFAULT '',
    media_type VARCHAR(20) NOT NULL CHECK (media_type IN ('image', 'video', 'gif')),
    width INT DEFAULT 0,
    height INT DEFAULT 0,
    alt_text TEXT DEFAULT '',
    file_size BIGINT DEFAULT 0,
    position SMALLINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_post_media_post_id ON post_media (post_id);