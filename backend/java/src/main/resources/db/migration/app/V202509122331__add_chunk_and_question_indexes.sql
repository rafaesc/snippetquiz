ALTER TABLE "questions" 
ADD COLUMN "chunk_index" INTEGER,
ADD COLUMN "question_index_in_chunk" INTEGER;

ALTER TABLE "quiz_questions" 
ADD COLUMN "chunk_index" INTEGER,
ADD COLUMN "question_index_in_chunk" INTEGER;

ALTER TABLE "questions" 
ADD CONSTRAINT "questions_content_entry_chunk_question_unique" 
UNIQUE ("content_entry_id", "chunk_index", "question_index_in_chunk");

ALTER TABLE "quiz_questions" 
ADD CONSTRAINT "quiz_questions_content_entry_chunk_question_unique" 
UNIQUE ("content_entry_id", "chunk_index", "question_index_in_chunk");

CREATE INDEX "idx_questions_chunk_index" ON "questions"("chunk_index");
CREATE INDEX "idx_questions_question_index_in_chunk" ON "questions"("question_index_in_chunk");
CREATE INDEX "idx_quiz_questions_chunk_index" ON "quiz_questions"("chunk_index");
CREATE INDEX "idx_quiz_questions_question_index_in_chunk" ON "quiz_questions"("question_index_in_chunk");