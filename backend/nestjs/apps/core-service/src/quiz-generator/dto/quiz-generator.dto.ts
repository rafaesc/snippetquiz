import { Observable } from 'rxjs';

// Quiz Generation Proto Interfaces
export interface ContentEntry {
  id: number;
  pageTitle: string;
  content: string;
  wordCountAnalyzed: number;
}

export interface GenerateQuizRequest {
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
}

export interface QuizGenerationService {
  generateQuiz(data: GenerateQuizRequest): Observable<QuizGenerationProgressCamelCase>;
}

export function mapQuizGenerationProgress(
  progress: QuizGenerationProgressCamelCase
): QuizGenerationProgress {
  const result: QuizGenerationProgress = {};
  
  if (progress.status) {
    result.status = {
      content_entry_id: progress.status.contentEntryId,
      page_title: progress.status.pageTitle,
      word_count_analyzed: progress.status.wordCountAnalyzed,
      status: progress.status.status,
    };
  }
  
  if (progress.result) {
    result.result = {
      content_entry_id: progress.result.contentEntryId,
      page_title: progress.result.pageTitle,
      questions: progress.result.questions.map(q => ({
        question: q.question,
        type: q.type,
        options: q.options.map(opt => ({
          option_text: opt.optionText,
          option_explanation: opt.optionExplanation,
          is_correct: opt.isCorrect,
        })),
      })),
    };
  }
  
  return result;
}