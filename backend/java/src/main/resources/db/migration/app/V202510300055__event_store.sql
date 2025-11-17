CREATE TABLE IF NOT EXISTS "event_store" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "aggregate_type" VARCHAR(50) NOT NULL,
    "event_name" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "version" INT NOT NULL,
    "occurred_on" TIMESTAMP WITH TIME ZONE DEFAULT now(),
    CONSTRAINT uq_event_store_aggregate_version UNIQUE (aggregate_id, version)
);

CREATE INDEX "idx_event_store_user_id_aggregate_id_aggregate_type"
ON "event_store" ("user_id", "aggregate_id", aggregate_type);
