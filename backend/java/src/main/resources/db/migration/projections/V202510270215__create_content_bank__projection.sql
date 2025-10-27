CREATE TABLE IF NOT EXISTS content_banks__projection (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    content_entries INTEGER NOT NULL DEFAULT 0,

    -- FK to content_banks.id with cascade on delete
    CONSTRAINT fk_content_banks__projection
        FOREIGN KEY (id) REFERENCES content_banks (id)
        ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_banks__projection_user_id
    ON content_banks__projection (LEFT("user_id"::text, 4));

CREATE INDEX IF NOT EXISTS idx_content_banks__projection_created_at
    ON content_banks__projection (created_at);

CREATE INDEX IF NOT EXISTS idx_content_banks__projection_name
    ON content_banks__projection (name);