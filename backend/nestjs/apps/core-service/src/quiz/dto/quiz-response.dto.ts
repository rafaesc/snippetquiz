export class QuizTopicDto {
  topicName: string;
}

export class QuizResponseDto {
  id: number;
  createdAt: Date;
  questionsCount: number;
  questionsCompleted: number;
  contentEntriesCount: number;
  topics: string[];
}

export class QuizDetailResponseDto {
  id: number;
  createdAt: Date;
  questionsCompleted: number;
  contentEntriesCount: number;
  topics: string[];
  totalQuestions: number;
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
