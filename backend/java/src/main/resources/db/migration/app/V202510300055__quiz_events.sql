CREATE TABLE "quiz_events" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "aggregate_id" UUID NOT NULL,
    "event_id" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "version" INT NOT NULL,
    "occurred_on" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX "idx_quiz_events_quiz_id"
ON "quiz_events" (LEFT("aggregate_id"::text, 4));