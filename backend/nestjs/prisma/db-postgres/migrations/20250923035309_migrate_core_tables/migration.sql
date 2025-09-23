/*
  Warnings:

  - You are about to drop the `content_banks` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `content_entries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `content_entries_bank` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `content_entry_topics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `question_options` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quiz_generation_instructions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quiz_question_options` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quiz_question_responses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quiz_questions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quiz_topics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `quizzes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `topics` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `youtube_channels` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "auth"."content_entries" DROP CONSTRAINT "content_entries_youtube_channel_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."content_entries_bank" DROP CONSTRAINT "content_entries_bank_content_bank_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."content_entries_bank" DROP CONSTRAINT "content_entries_bank_content_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."content_entry_topics" DROP CONSTRAINT "content_entry_topics_content_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."content_entry_topics" DROP CONSTRAINT "content_entry_topics_topic_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."question_options" DROP CONSTRAINT "question_options_question_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."questions" DROP CONSTRAINT "questions_content_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."quiz_question_options" DROP CONSTRAINT "quiz_question_options_quiz_question_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."quiz_question_responses" DROP CONSTRAINT "quiz_question_responses_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."quiz_question_responses" DROP CONSTRAINT "quiz_question_responses_quiz_question_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."quiz_question_responses" DROP CONSTRAINT "quiz_question_responses_quiz_question_option_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."quiz_questions" DROP CONSTRAINT "quiz_questions_content_entry_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."quiz_questions" DROP CONSTRAINT "quiz_questions_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."quiz_topics" DROP CONSTRAINT "quiz_topics_quiz_id_fkey";

-- DropForeignKey
ALTER TABLE "auth"."quizzes" DROP CONSTRAINT "quizzes_bank_id_fkey";

-- DropTable
DROP TABLE "auth"."content_banks";

-- DropTable
DROP TABLE "auth"."content_entries";

-- DropTable
DROP TABLE "auth"."content_entries_bank";

-- DropTable
DROP TABLE "auth"."content_entry_topics";

-- DropTable
DROP TABLE "auth"."question_options";

-- DropTable
DROP TABLE "auth"."questions";

-- DropTable
DROP TABLE "auth"."quiz_generation_instructions";

-- DropTable
DROP TABLE "auth"."quiz_question_options";

-- DropTable
DROP TABLE "auth"."quiz_question_responses";

-- DropTable
DROP TABLE "auth"."quiz_questions";

-- DropTable
DROP TABLE "auth"."quiz_topics";

-- DropTable
DROP TABLE "auth"."quizzes";

-- DropTable
DROP TABLE "auth"."topics";

-- DropTable
DROP TABLE "auth"."youtube_channels";

-- DropEnum
DROP TYPE "auth"."ContentType";
