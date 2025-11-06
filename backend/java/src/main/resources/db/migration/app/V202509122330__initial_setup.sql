-- CreateTable
CREATE TABLE "content_banks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_banks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "content_banks_user_id_prefix_idx"
ON "content_banks" (LEFT("user_id"::text, 4));

-- CreateTable
CREATE TABLE "topics" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "topic" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "youtube_channels" (
    "id" BIGSERIAL NOT NULL,
    "channel_id" TEXT NOT NULL,
    "channel_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "youtube_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "content_bank_id" UUID NOT NULL,
    "content_type" VARCHAR(50) NOT NULL,
    "content" TEXT,
    "source_url" TEXT,
    "page_title" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prompt_summary" TEXT,
    "questions_generated" BOOLEAN NOT NULL DEFAULT false,
    "word_count" INTEGER,
    "video_duration" INTEGER,
    "youtube_video_id" TEXT,
    "youtube_channel_id" BIGINT,

    CONSTRAINT "content_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" BIGSERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content_entry_id" UUID NOT NULL,
    "chunk_index" INTEGER NOT NULL,
    "question_index_in_chunk" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT questions_content_entry_chunk_question_unique
        UNIQUE (content_entry_id, chunk_index, question_index_in_chunk)
);

CREATE INDEX "idx_questions_chunk_index" ON "questions"("chunk_index");
CREATE INDEX "idx_questions_question_index_in_chunk" ON "questions"("question_index_in_chunk");

CREATE INDEX "questions_content_entry_id_prefix_idx"
ON "questions" (LEFT("content_entry_id"::text, 4));

-- CreateTable
CREATE TABLE "question_options" (
    "id" BIGSERIAL NOT NULL,
    "question_id" BIGINT NOT NULL,
    "option_text" TEXT NOT NULL,
    "option_explanation" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quiz_generation_instructions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "instruction" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_generation_instructions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "quiz_generation_instructions_user_id_prefix_idx"
ON "quiz_generation_instructions" (LEFT("user_id"::text, 4));

-- CreateTable
CREATE TABLE "content_entry_topics" (
    "id" BIGSERIAL NOT NULL,
    "content_entry_id" UUID NOT NULL,
    "topic_id" BIGINT NOT NULL,

    CONSTRAINT "content_entry_topics_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "content_entry_topics_content_entry_id_prefix_idx"
ON "content_entry_topics" (LEFT("content_entry_id"::text, 4));

-- CreateIndex
CREATE UNIQUE INDEX "topics_user_id_topic_key" ON "topics"("user_id", "topic");

-- CreateIndex
CREATE UNIQUE INDEX "youtube_channels_channel_id_key" ON "youtube_channels"("channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_entries_content_bank_id_key" ON "content_entries"(LEFT("content_bank_id"::text, 4));

-- CreateIndex
CREATE UNIQUE INDEX "content_entry_topics_content_entry_id_topic_id_key" ON "content_entry_topics"(LEFT("content_entry_id"::text, 4), "topic_id");

-- AddForeignKey
ALTER TABLE "content_entries" ADD CONSTRAINT "content_entries_youtube_channel_id_fkey" FOREIGN KEY ("youtube_channel_id") REFERENCES "youtube_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_content_entry_id_fkey" FOREIGN KEY ("content_entry_id") REFERENCES "content_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "question_options" ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_entries_bank" ADD CONSTRAINT "content_entries_bank_content_entry_id_fkey" FOREIGN KEY ("content_entry_id") REFERENCES "content_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_entries" ADD CONSTRAINT "content_entries_content_bank_id_fkey" FOREIGN KEY ("content_bank_id") REFERENCES "content_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_entry_topics" ADD CONSTRAINT "content_entry_topics_content_entry_id_fkey" FOREIGN KEY ("content_entry_id") REFERENCES "content_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_entry_topics" ADD CONSTRAINT "content_entry_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
