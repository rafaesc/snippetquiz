CREATE TABLE IF NOT EXISTS quiz__projection (
    id UUID PRIMARY KEY,
    content_bank_id UUID NOT NULL,
    bank_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    questions_count INTEGER NOT NULL DEFAULT 0,
    questions_completed INTEGER NOT NULL DEFAULT 0,
    question_updated_at TIMESTAMP(3),
    status VARCHAR(255),
    content_entries_count INTEGER NOT NULL DEFAULT 0,
    questions JSONB, -- list of strings stored as JSON
    topics JSONB, -- list of strings stored as JSON

    -- Additional context
    user_id UUID NOT NULL
);

-- Index on user_id prefix for efficient sharding or partition-like scans
CREATE INDEX IF NOT EXISTS idx_quiz__projection_user_id_prefix
    ON quiz__projection (LEFT("user_id"::text, 4));