DROP INDEX IF EXISTS "idx_quiz_questions_question_index_in_chunk";
DROP INDEX IF EXISTS "idx_quiz_questions_chunk_index";
DROP INDEX IF EXISTS "idx_questions_question_index_in_chunk";
DROP INDEX IF EXISTS "idx_questions_chunk_index";

ALTER TABLE "quiz_questions" DROP CONSTRAINT IF EXISTS "quiz_questions_content_entry_chunk_question_unique";
ALTER TABLE "questions" DROP CONSTRAINT IF EXISTS "questions_content_entry_chunk_question_unique";

ALTER TABLE "quiz_questions" DROP COLUMN IF EXISTS "question_index_in_chunk";
ALTER TABLE "quiz_questions" DROP COLUMN IF EXISTS "chunk_index";

ALTER TABLE "questions" DROP COLUMN IF EXISTS "question_index_in_chunk";
ALTER TABLE "questions" DROP COLUMN IF EXISTS "chunk_index";