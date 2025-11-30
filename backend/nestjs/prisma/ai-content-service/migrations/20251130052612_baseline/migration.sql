-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "ai_content_service";

-- CreateTable
CREATE TABLE "ai_content_service"."content_entries__projection" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "content" TEXT,
    "page_title" TEXT,
    "word_count" INTEGER,

    CONSTRAINT "content_entries__projection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_content_service"."user_topics__projection" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "topic" TEXT NOT NULL,

    CONSTRAINT "user_topics__projection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_content_service"."event_processed" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "event_type" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_processed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_content_service"."character" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(100) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image_url" TEXT,
    "intro_prompt" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "character_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_content_service"."character_emotion" (
    "id" SERIAL NOT NULL,
    "character_id" INTEGER NOT NULL,
    "emotion_code" VARCHAR(50) NOT NULL,
    "name" TEXT NOT NULL,
    "short_description" TEXT,
    "sprite_url" TEXT,
    "steps" INTEGER,
    "seconds" INTEGER,
    "weighted" INTEGER DEFAULT 1,
    "animation_to" INTEGER,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "character_emotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_content_service"."user_config" (
    "user_id" UUID NOT NULL,
    "default_character_code" VARCHAR(100) NOT NULL,
    "character_enabled" BOOLEAN NOT NULL DEFAULT false,
    "emotion_order" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "emotion_index" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_config_pkey" PRIMARY KEY ("user_id")
);

-- CreateIndex
CREATE INDEX "content_entries__projection_id_user_id_idx" ON "ai_content_service"."content_entries__projection"("id", "user_id");

-- CreateIndex
CREATE INDEX "user_topics__projection_user_id_idx" ON "ai_content_service"."user_topics__projection"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_topics__projection_user_id_topic_key" ON "ai_content_service"."user_topics__projection"("user_id", "topic");

-- CreateIndex
CREATE INDEX "event_processed_id_user_id_idx" ON "ai_content_service"."event_processed"("id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "character_code_key" ON "ai_content_service"."character"("code");

-- CreateIndex
CREATE INDEX "character_code_idx" ON "ai_content_service"."character"("code");

-- CreateIndex
CREATE INDEX "character_emotion_character_id_idx" ON "ai_content_service"."character_emotion"("character_id");

-- CreateIndex
CREATE UNIQUE INDEX "character_emotion_character_id_emotion_code_key" ON "ai_content_service"."character_emotion"("character_id", "emotion_code");

-- AddForeignKey
ALTER TABLE "ai_content_service"."character_emotion" ADD CONSTRAINT "character_emotion_character_id_fkey" FOREIGN KEY ("character_id") REFERENCES "ai_content_service"."character"("id") ON DELETE CASCADE ON UPDATE CASCADE;
