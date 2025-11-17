CREATE TABLE IF NOT EXISTS content_entries__projection (
    id UUID PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL,
    content VARCHAR(300), -- DTO is truncated to 300 chars
    source_url TEXT,
    page_title VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    questions_generated BOOLEAN NOT NULL DEFAULT FALSE,
    topics JSONB, -- list of strings stored as JSON
    user_id UUID NOT NULL,

    -- FK to the source entry (1:1 projection) with cascade on delete
    CONSTRAINT fk_content_entries__projection_entry
        FOREIGN KEY (id) REFERENCES content_entries (id)
        ON DELETE CASCADE,

    -- FK to the parent bank with cascade on delete
    content_banks_id UUID NOT NULL,
    CONSTRAINT fk_content_entries__projection_bank
        FOREIGN KEY (content_banks_id) REFERENCES content_banks (id)
        ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_content_entries__projection_user_id_bank_id
    ON content_entries__projection ("user_id", "content_banks_id");

CREATE INDEX IF NOT EXISTS idx_content_entries__projection_created_at
    ON content_entries__projection (created_at);

CREATE INDEX IF NOT EXISTS idx_content_entries__projection_content_type
    ON content_entries__projection (content_type);