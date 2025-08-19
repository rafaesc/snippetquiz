export class ContentEntryResponseDto {
  id: string;
  content_type: string;
  content?: string;
  source_url?: string;
  page_title?: string;
  created_at: Date;
  questions_generated: boolean;
  prompt_summary?: string;
  topics?: string[];
  entry_count?: number;
}

export class PaginatedContentEntriesResponseDto {
  entries: ContentEntryResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
