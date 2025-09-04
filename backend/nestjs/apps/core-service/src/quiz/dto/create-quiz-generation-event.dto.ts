export type ContentEntryDto = {
  id: number;
  pageTitle: string;
  content: string;
  wordCountAnalyzed?: number;
};

export type CreateQuizGenerationEventPayload = {
  instructions: string;
  contentEntries: ContentEntryDto[];
  totalContentEntriesSkipped?: number;
  entriesSkipped: number;
  quizId: string;
  userId: string;
  bankId: number;
};