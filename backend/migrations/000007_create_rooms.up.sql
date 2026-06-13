CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(60) UNIQUE NOT NULL,
    description TEXT DEFAULT '',
    icon TEXT DEFAULT '',
    banner_url TEXT DEFAULT '',
    color VARCHAR(7) DEFAULT '#7C3AED',
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    member_count INT DEFAULT 0,
    post_count INT DEFAULT 0,
    is_private BOOLEAN DEFAULT false,
    is_nsfw BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rooms_name ON rooms (name);
CREATE INDEX idx_rooms_member_count ON rooms (member_count DESC);