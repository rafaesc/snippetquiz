-- CreateTable
CREATE TABLE "ai_processor"."content_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "content" TEXT,
    "page_title" TEXT,
    "word_count" INTEGER,

    CONSTRAINT "content_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_processor"."user_topics" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "topic" TEXT NOT NULL,

    CONSTRAINT "user_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_processor"."event_processed" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_processed_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "content_entries_id_user_id_idx" ON "ai_processor"."content_entries"("id", "user_id");

-- CreateIndex
CREATE INDEX "user_topics_user_id_idx" ON "ai_processor"."user_topics"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_topics_user_id_topic_key" ON "ai_processor"."user_topics"("user_id", "topic");

-- CreateIndex
CREATE INDEX "event_processed_id_user_id_idx" ON "ai_processor"."event_processed"("id", "user_id");
