-- Add user_id column to quiz_question_responses table
ALTER TABLE "quiz_question_responses" 
ADD COLUMN  "user_id" UUID;

-- Backfill user_id using the quiz join
UPDATE "quiz_question_responses" qr
SET "user_id" = q."user_id"
FROM "quizzes" q
WHERE qr."quiz_id" = q."id";

-- Make user_id NOT NULL after backfill
ALTER TABLE "quiz_question_responses" 
ALTER COLUMN "user_id" SET NOT NULL;

-- Create index on user_id and quiz_id
CREATE INDEX "idx_quiz_question_responses_user_id_quiz_id" ON "quiz_question_responses" ("user_id", "quiz_id");