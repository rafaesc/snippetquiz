-- CreateEnum
CREATE TYPE "auth"."ContentType" AS ENUM ('selected_text', 'full_html', 'video_transcript');

-- CreateTable
CREATE TABLE "auth"."users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "password_updated_at" TIMESTAMP(3),
    "verified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."content_banks" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_banks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."topics" (
    "id" BIGSERIAL NOT NULL,
    "user_id" UUID NOT NULL,
    "topic" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."youtube_channels" (
    "id" BIGSERIAL NOT NULL,
    "channel_id" TEXT NOT NULL,
    "channel_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "youtube_channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."content_entries" (
    "id" BIGSERIAL NOT NULL,
    "content_type" "auth"."ContentType" NOT NULL,
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
CREATE TABLE "auth"."quizzes" (
    "id" BIGSERIAL NOT NULL,
    "bank_id" BIGINT,
    "bank_name" TEXT,
    "status" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "content_entries_count" INTEGER NOT NULL DEFAULT 0,
    "questions_count" INTEGER NOT NULL DEFAULT 0,
    "questions_completed" INTEGER NOT NULL DEFAULT 0,
    "completed_at" TIMESTAMP(3),
    "question_updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID,

    CONSTRAINT "quizzes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."questions" (
    "id" BIGSERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content_entry_id" BIGINT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."question_options" (
    "id" BIGSERIAL NOT NULL,
    "question_id" BIGINT NOT NULL,
    "option_text" TEXT NOT NULL,
    "option_explanation" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."quiz_generation_instructions" (
    "id" BIGSERIAL NOT NULL,
    "instruction" TEXT NOT NULL,
    "user_id" UUID NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quiz_generation_instructions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."content_entries_bank" (
    "id" BIGSERIAL NOT NULL,
    "content_entry_id" BIGINT NOT NULL,
    "content_bank_id" BIGINT NOT NULL,

    CONSTRAINT "content_entries_bank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."content_entry_topics" (
    "id" BIGSERIAL NOT NULL,
    "content_entry_id" BIGINT NOT NULL,
    "topic_id" BIGINT NOT NULL,

    CONSTRAINT "content_entry_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."quiz_topics" (
    "id" BIGSERIAL NOT NULL,
    "quiz_id" BIGINT NOT NULL,
    "topic_name" TEXT NOT NULL,

    CONSTRAINT "quiz_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."quiz_questions" (
    "id" BIGSERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content_entry_type" TEXT NOT NULL,
    "content_entry_source_url" TEXT,
    "content_entry_id" BIGINT,
    "quiz_id" BIGINT NOT NULL,

    CONSTRAINT "quiz_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."quiz_question_options" (
    "id" BIGSERIAL NOT NULL,
    "quiz_question_id" BIGINT NOT NULL,
    "option_text" TEXT NOT NULL,
    "option_explanation" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "quiz_question_options_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auth"."quiz_question_responses" (
    "id" BIGSERIAL NOT NULL,
    "quiz_id" BIGINT NOT NULL,
    "quiz_question_id" BIGINT NOT NULL,
    "quiz_question_option_id" BIGINT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "correct_answer" TEXT NOT NULL,
    "response_time" TEXT NOT NULL,

    CONSTRAINT "quiz_question_responses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "auth"."users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "auth"."users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "topics_user_id_topic_key" ON "auth"."topics"("user_id", "topic");

-- CreateIndex
CREATE UNIQUE INDEX "youtube_channels_channel_id_key" ON "auth"."youtube_channels"("channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_generation_instructions_user_id_key" ON "auth"."quiz_generation_instructions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_entries_bank_content_entry_id_content_bank_id_key" ON "auth"."content_entries_bank"("content_entry_id", "content_bank_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_entry_topics_content_entry_id_topic_id_key" ON "auth"."content_entry_topics"("content_entry_id", "topic_id");

-- CreateIndex
CREATE UNIQUE INDEX "quiz_topics_quiz_id_topic_name_key" ON "auth"."quiz_topics"("quiz_id", "topic_name");

-- AddForeignKey
ALTER TABLE "auth"."content_entries" ADD CONSTRAINT "content_entries_youtube_channel_id_fkey" FOREIGN KEY ("youtube_channel_id") REFERENCES "auth"."youtube_channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."quizzes" ADD CONSTRAINT "quizzes_bank_id_fkey" FOREIGN KEY ("bank_id") REFERENCES "auth"."content_banks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."questions" ADD CONSTRAINT "questions_content_entry_id_fkey" FOREIGN KEY ("content_entry_id") REFERENCES "auth"."content_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."question_options" ADD CONSTRAINT "question_options_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "auth"."questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."content_entries_bank" ADD CONSTRAINT "content_entries_bank_content_entry_id_fkey" FOREIGN KEY ("content_entry_id") REFERENCES "auth"."content_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."content_entries_bank" ADD CONSTRAINT "content_entries_bank_content_bank_id_fkey" FOREIGN KEY ("content_bank_id") REFERENCES "auth"."content_banks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."content_entry_topics" ADD CONSTRAINT "content_entry_topics_content_entry_id_fkey" FOREIGN KEY ("content_entry_id") REFERENCES "auth"."content_entries"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."content_entry_topics" ADD CONSTRAINT "content_entry_topics_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "auth"."topics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."quiz_topics" ADD CONSTRAINT "quiz_topics_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "auth"."quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."quiz_questions" ADD CONSTRAINT "quiz_questions_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "auth"."quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."quiz_questions" ADD CONSTRAINT "quiz_questions_content_entry_id_fkey" FOREIGN KEY ("content_entry_id") REFERENCES "auth"."content_entries"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."quiz_question_options" ADD CONSTRAINT "quiz_question_options_quiz_question_id_fkey" FOREIGN KEY ("quiz_question_id") REFERENCES "auth"."quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."quiz_question_responses" ADD CONSTRAINT "quiz_question_responses_quiz_id_fkey" FOREIGN KEY ("quiz_id") REFERENCES "auth"."quizzes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."quiz_question_responses" ADD CONSTRAINT "quiz_question_responses_quiz_question_id_fkey" FOREIGN KEY ("quiz_question_id") REFERENCES "auth"."quiz_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auth"."quiz_question_responses" ADD CONSTRAINT "quiz_question_responses_quiz_question_option_id_fkey" FOREIGN KEY ("quiz_question_option_id") REFERENCES "auth"."quiz_question_options"("id") ON DELETE CASCADE ON UPDATE CASCADE;
