export class QuizTopicDto {
  topicName: string;
}

export class QuizResponseDto {
  id: string;
  created_at: Date;
  status?: string | null;
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
  status?: string | null;
  questions_completed: number;
  content_entries_count: number;
  total_questions: number;
  topics: string[];
  question?: QuizQuestion | null;
}

export class QuizSummaryResponseDto {
  topics: string[];
  total_questions: number;
  total_correct_answers: number;
}

export class QuizResponseItemDto {
  is_correct: boolean;
  question: string;
  answer: string;
  correct_answer: string;
  explanation: string;
  source_url: string;
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

export class CheckQuizInProgressRequestDto {
  user_id: string;
}

export class QuizInProgressDetailsDto {
  quiz_id: string;
  bank_id?: string;
  name?: string | null;
}

export class CheckQuizInProgressResponseDto {
  in_progress: boolean;
  details?: QuizInProgressDetailsDto | null;
}
