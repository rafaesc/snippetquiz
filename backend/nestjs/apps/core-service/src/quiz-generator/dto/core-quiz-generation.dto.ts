interface ContentEntryDto {
  id?: string;
  name?: string;
  word_count_analyzed?: number;
}

interface CoreQuizGenerationProgress {
  bank_id: string;
  total_content_entries: number;
  total_content_entries_skipped?: number;
  current_content_entry_index: number;
  questions_generated_so_far: number;
  content_entry: ContentEntryDto;
  total_chunks: number;
  current_chunk_index: number;
}

export interface GenerateQuizByBankRequest {
  bank_id: number;
  user_id: string;
}

export interface CoreQuizGenerationCompleted {
  quiz_id: string;
}

export interface CoreQuizGenerationStatus {
  progress?: CoreQuizGenerationProgress;
  completed?: CoreQuizGenerationCompleted;
}
