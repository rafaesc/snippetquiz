-- Drop the index
DROP INDEX IF EXISTS "idx_quiz_question_responses_user_id_quiz_id";

-- Drop the user_id column
ALTER TABLE "quiz_question_responses" 
DROP COLUMN IF EXISTS "user_id";