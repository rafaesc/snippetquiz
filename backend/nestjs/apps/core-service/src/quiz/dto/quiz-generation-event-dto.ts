export interface QuestionOption {
  optionText: string;
  optionExplanation: string;
  isCorrect: boolean;
}

export interface Question {
  question: string;
  type: string;
  options: QuestionOption[];
}

export type ContentEntryDto = {
  id: number;
  pageTitle: string;
  wordCountAnalyzed: number;
  questions: Question[];
}

export type QuizGenerationEventPayload = {
  quizId: string;
  bankId: string;
  userId: string;
  totalContentEntries: number;
  totalContentEntriesSkipped?: number;
  currentContentEntryIndex: number;
  questionsGeneratedSoFar: number;
  contentEntry: ContentEntryDto;
  totalChunks: number;
  currentChunkIndex: number;
};
