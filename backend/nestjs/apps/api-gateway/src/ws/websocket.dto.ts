import { Observable } from "rxjs";

// gRPC service interfaces
export interface GenerateQuizByBankRequest {
  bankId: number;
  userId: string;
}

export interface QuizGenerationProgress {
  message_type: {
    status?: {
      contentEntryId: number;
      pageTitle: string;
      status: string;
    };
    result?: {
      contentEntryId: number;
      pageTitle: string;
      questions: Array<{
        question: string;
        type: string;
        options: Array<{
          optionText: string;
          optionExplanation: string;
          isCorrect: boolean;
        }>;
      }>;
    };
  };
}

export interface CoreQuizGenerationService {
  generateQuizByBank(
    data: GenerateQuizByBankRequest,
  ): Observable<QuizGenerationProgress>;
}