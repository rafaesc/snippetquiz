interface ContentEntryDto {
  id?: string;
  name?: string;
  word_count_analyzed?: number;
}

export interface QuizGenerationProgressDto {
  bank_id: string;
  total_content_entries: number;
  total_content_entries_skipped?: number;
  current_content_entry_index: number;
  questions_generated_so_far: number;
  content_entry: ContentEntryDto;
}
