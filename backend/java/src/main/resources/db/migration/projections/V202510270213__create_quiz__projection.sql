CREATE TABLE IF NOT EXISTS quiz__projection (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    questions_count INTEGER NOT NULL DEFAULT 0,
    questions_completed INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(255),
    content_entries_count INTEGER NOT NULL DEFAULT 0,
    topics JSONB, -- list of strings stored as JSON

    -- Additional context
    user_id UUID NOT NULL,

    -- FK to quizzes.id with cascade on delete
    CONSTRAINT fk_quiz__projection_quiz
        FOREIGN KEY (id) REFERENCES "quizzes" ("id")
        ON DELETE CASCADE
);

-- Index on user_id prefix for efficient sharding or partition-like scans
CREATE INDEX IF NOT EXISTS idx_quiz__projection_user_id_prefix
    ON quiz__projection (LEFT("user_id"::text, 4));