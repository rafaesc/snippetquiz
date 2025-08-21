export class QuizTopicDto {
  topicName: string;
}

export class QuizResponseDto {
  id: string;
  created_at: Date;
  questions_count: number;
  questions_completed: number;
  content_entries_count: number;
  topics: string[];
}

export class QuizQuestionOption {
  id: string;
  option_text: string;
}

export class QuizQuestion {
  id: string;
  question: string;
  content_entry_type: string;
  content_entry_source_url: string;
  options: QuizQuestionOption[];
}

export class FindOneQuizResponse {
  id: string;
  created_at: Date;
  questions_completed: number;
  content_entries_count: number;
  total_questions: number;
  topics: string[];
  question?: QuizQuestion | null;
}

export class QuizSummaryResponseDto {
  topics: string[];
  totalQuestions: number;
  totalCorrectAnswers: number;
}

export class QuizResponseItemDto {
  isCorrect: boolean;
  question: string;
  answer: string;
  correctAnswer: string;
  explanation: string;
  sourceUrl: string;
}

export class PaginatedQuizzesResponseDto {
  quizzes: QuizResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export class PaginatedQuizResponsesDto {
  responses: QuizResponseItemDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
