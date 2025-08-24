import { Observable } from 'rxjs';

// Quiz Generation Proto Interfaces
export interface ContentEntry {
  id: number;
  pageTitle: string;
  content: string;
  wordCountAnalyzed: number;
}

export interface GenerateQuizRequest {
  instructions: string;
  contentEntries: ContentEntry[];
}

export interface QuestionOption {
  option_text: string;
  option_explanation: string;
  is_correct: boolean;
}

export interface QuestionOptionCamelCase {
  optionText: string;
  optionExplanation: string;
  isCorrect: boolean;
}

export interface Question {
  question: string;
  type: string;
  options: QuestionOption[];
}

export interface QuestionCamelCase {
  question: string;
  type: string;
  options: QuestionOptionCamelCase[];
}

export interface GenerationStatus {
  content_entry_id: number;
  page_title: string;
  status: string;
  word_count_analyzed: number;
}

export interface GenerationStatusCamelCase {
  contentEntryId: number;
  pageTitle: string;
  status: string;
  wordCountAnalyzed: number;
}

export interface GenerationResultCamelCase {
  contentEntryId: number;
  pageTitle: string;
  wordCountAnalyzed: number;
  questions: QuestionCamelCase[];
}

export interface GenerationResult {
  content_entry_id: number;
  page_title: string;
  questions: Question[];
}

export interface QuizGenerationProgress {
  status?: GenerationStatus;
  result?: GenerationResult;
}

export interface QuizGenerationProgressCamelCase {
  status?: GenerationStatusCamelCase;
  result?: GenerationResultCamelCase;
  completed?: boolean;
}

export type GenerateTopicsRequest = {
  content: string;
  pageTitle: string;
  existingTopics: string[];
}

export interface GenerateTopicsResponse {
  topics?: string[];
}

export interface AiGenerationService {
  generateQuiz(data: GenerateQuizRequest): Observable<QuizGenerationProgressCamelCase>;
  generateTopics(data: GenerateTopicsRequest): Observable<GenerateTopicsResponse>;
}
