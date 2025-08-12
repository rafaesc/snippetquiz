export class ContentEntryResponseDto {
  id: string;
  contentType: string;
  content?: string;
  sourceUrl?: string;
  pageTitle?: string;
  createdAt: Date;
  questionsGenerated: boolean;
  promptSummary?: string;
  topics?: string[];
  entryCount?: number;
}

export class PaginatedContentEntriesResponseDto {
  entries: ContentEntryResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}