import { Observable } from "rxjs";

// gRPC service interfaces
export interface GenerateQuizByBankRequest {
  bankId: number;
  userId: string;
}

export interface ContentEntry {
  id: string;
  name: string;
  wordCountAnalyzed: number;
}

export interface Summary {
  questionsGeneratedSoFar: number;
  totalQuestionsExpected: number;
  failedEntriesCount: number;
}

export interface QuizGenerationProgress {
  event: string;
  bankId: string;
  totalContentEntries: number;
  currentContentEntryIndex: number;
  contentEntry: ContentEntry;
  summary: Summary;
}

export interface CoreQuizGenerationService {
  generateQuizByBank(
    data: GenerateQuizByBankRequest,
  ): Observable<QuizGenerationProgress>;
}