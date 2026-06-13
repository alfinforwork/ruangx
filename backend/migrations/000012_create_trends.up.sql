CREATE TABLE trends (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trend_type VARCHAR(20) NOT NULL CHECK (trend_type IN ('hashtag', 'topic')),
    name VARCHAR(100) NOT NULL,
    post_count INT DEFAULT 0,
    score DECIMAL(12,2) DEFAULT 0,
    category VARCHAR(50) DEFAULT '',
    region VARCHAR(10) DEFAULT 'ID',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(trend_type, name)
);

CREATE INDEX idx_trends_score ON trends (score DESC);
CREATE INDEX idx_trends_type_score ON trends (trend_type, score DESC);