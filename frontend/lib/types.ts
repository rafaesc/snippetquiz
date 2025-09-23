// Authentication and User Types
export interface DashboardData {
  title: string;
  isAuthenticated: boolean;
}

export interface UserProfile {
  user: {
    id: string;
    name: string;
    email: string;
    created_date: string;
    verified: boolean;
  }
  banks: {
    id: string;
    name: string;
  }[];
}

// Instructions Types
export interface GetInstructionsResponse {
  instruction: string;
  updatedAt: string; // ISO date string
}

export interface UpdateInstructionsResponse {
  id: number;
  instruction: string;
  updatedAt: string; // ISO date string
}

// Content Bank Types
export interface ContentBank {
  id: number;
  name: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  contentEntries?: number;
}

export interface ContentBanksResponse {
  content: ContentBank[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface CreateContentBankRequest {
  name: string;
}

export interface UpdateContentBankRequest {
  name: string;
}

export interface DuplicateContentBankRequest {
  name?: string;
}

// Content Entry Types
export interface ContentEntry {
  id: number;
  contentType: 'full_html' | 'selected_text' | 'video_transcript';
  content?: string;
  sourceUrl?: string;
  pageTitle?: string;
  createdAt: string;
  topics?: string[];
  questionsGenerated?: boolean;
}

export interface ContentEntriesResponse {
  content: ContentEntry[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface CreateContentEntryRequest {
  sourceUrl?: string;
  content?: string;
  type: 'full_html' | 'selected_text' | 'video_transcript';
  pageTitle?: string;
  bankId: number;
}

// Quiz Types
export interface Quiz {
  id: number;
  status: "READY" | "READY_WITH_ERROR" | "IN_PROGRESS" | "PREPARE";
  name: string;
  createdAt: string;
  questionsCompleted: number;
  contentEntriesCount: number;
  topics: string[];
  questionsCount: number;
}

export interface QuizzesResponse {
  content: Quiz[];
  page: {
    number: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

export interface QuizResponse {
  isCorrect: boolean;
  question: string;
  answer: string;
  correctAnswer: string;
  explanation: string;
  sourceUrl: string;
}

export interface QuizResponsesResponse {
  content: QuizResponse[];
  page: {
    number: number;
    size: number;
    totalElements: number;
  };
}

export interface QuizSummaryResponse {
  topics: string[];
  totalQuestions: number;
  totalCorrectAnswers: number;
}

type QuizQuestionOption = {
  id: number;
  optionText: string;
  isCorrect: boolean;
}

type QuizQuestion = {
  id: number;
  question: string;
  contentEntryType: string;
  contentEntrySourceUrl: string;
  options: QuizQuestionOption[];
}

export type FindOneQuizResponse = {
  id: number;
  status: "READY" | "READY_WITH_ERROR" | "IN_PROGRESS" | "PREPARE";
  createdAt: string;
  questionsCompleted: number;
  contentEntriesCount: number;
  totalQuestions: number;
  topics: string[];
  question?: QuizQuestion | null;
}

export interface UpdateQuizResponse {
  success: boolean;
  completed?: boolean;
}


export interface QuizInProgressDetails {
  quizId: number;
  bankId: number;
  name: string;
}

export interface ValidateQuizInProgressResponse {
  inProgress: boolean;
  details?: QuizInProgressDetails;
}

export interface CreateQuizRequest {
  bankId: number;
}

export interface CreateQuizResponse {
  quizId: number;
}