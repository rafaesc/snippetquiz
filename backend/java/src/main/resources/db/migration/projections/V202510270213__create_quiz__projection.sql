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
    user_id UUID NOT NULL
);

-- Index on user_id prefix for efficient sharding or partition-like scans
CREATE INDEX IF NOT EXISTS idx_quiz__projection_user_id_prefix
    ON quiz__projection (LEFT("user_id"::text, 4));


CREATE TABLE quiz_question_responses__projection (
    id BIGSERIAL NOT NULL,
    user_id UUID NOT NULL,
    quiz_id UUID NOT NULL,
    quiz_question_id BIGINT NOT NULL,
    quiz_question_option_id BIGINT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    correct_answer TEXT NOT NULL,
    response_time TEXT NOT NULL,

    CONSTRAINT quiz_question_responses_pkey PRIMARY KEY ("id")
);

CREATE INDEX "idx_quiz_question_responses_user_id_quiz_id" ON "quiz_question_responses" (LEFT("user_id"::text, 4), LEFT("quiz_id"::text, 4));

CREATE INDEX "quiz_question_responses_quiz_id_prefix_idx" ON "quiz_question_responses" (LEFT("quiz_id"::text, 4));