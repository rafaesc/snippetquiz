import { Injectable, Inject, Logger } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Observable, from, map, switchMap, tap, throwError } from 'rxjs';
import { PrismaClient } from 'generated/prisma/postgres';
import { QUIZ_GENERATION_SERVICE } from '../config/services';
import { ClientReadableStream } from '@grpc/grpc-js';

// Quiz Generation Proto Interfaces
interface ContentEntry {
  id: number;
  pageTitle: string;
  content: string;
}

interface GenerateQuizRequest {
  contentEntries: ContentEntry[];
}

interface QuestionOption {
  option_text: string;
  option_explanation: string;
  is_correct: boolean;
}

interface QuestionOptionCamelCase {
  optionText: string;
  optionExplanation: string;
  isCorrect: boolean;
}

interface Question {
  question: string;
  type: string;
  options: QuestionOption[];
}

interface QuestionCamelCase {
  question: string;
  type: string;
  options: QuestionOptionCamelCase[];
}

interface GenerationStatus {
  content_entry_id: number;
  page_title: string;
  status: string;
}

interface GenerationStatusCamelCase {
  contentEntryId: number;
  pageTitle: string;
  status: string;
}

interface GenerationResultCamelCase {
  contentEntryId: number;
  pageTitle: string;
  questions: QuestionCamelCase[];
}

interface GenerationResult {
  content_entry_id: number;
  page_title: string;
  questions: Question[];
}

interface QuizGenerationProgress {
  status?: GenerationStatus;
  result?: GenerationResult;
}

interface QuizGenerationProgressCamelCase {
  status?: GenerationStatusCamelCase;
  result?: GenerationResultCamelCase;
}

interface QuizGenerationService {
  generateQuiz(data: GenerateQuizRequest): Observable<QuizGenerationProgressCamelCase>;
}

@Injectable()
export class QuizGeneratorService extends PrismaClient {
  private readonly logger = new Logger(QuizGeneratorService.name);
  private quizGenerationService: QuizGenerationService;

  constructor(@Inject(QUIZ_GENERATION_SERVICE) private client: ClientGrpc) {
    super();
    this.logger.log('QuizGeneratorService initialized');
  }

  onModuleInit() {
    this.logger.log('Initializing gRPC client connection');
    try {
      this.quizGenerationService =
        this.client.getService<QuizGenerationService>('QuizGenerationService');
      this.logger.log(
        'QuizGenerationService gRPC client successfully initialized',
      );
    } catch (error) {
      this.logger.error(
        'Failed to initialize QuizGenerationService gRPC client',
        error,
      );
      throw error;
    }
  }

  async getContentEntriesByBankId(bankId: number): Promise<ContentEntry[]> {
    this.logger.log(`Starting to fetch content entries for bankId: ${bankId}`);

    try {
      const contentEntries = await this.contentEntry.findMany({
        where: {
          contentBanks: {
            some: {
              contentBankId: BigInt(bankId),
            },
          },
        },
        select: {
          id: true,
          pageTitle: true,
          content: true,
        },
      });

      this.logger.log(
        `Found ${contentEntries.length} content entries for bankId: ${bankId}`,
      );

      if (contentEntries.length === 0) {
        this.logger.warn(`No content entries found for bankId: ${bankId}`);
      }

      const mappedEntries = contentEntries.map((entry) => {
        const mappedEntry = {
          id: Number(entry.id),
          pageTitle: entry.pageTitle || 'demo',
          content: entry.content || 'demo',
        };

        this.logger.debug(
          `Mapped entry: ID=${mappedEntry.id}, Title="${mappedEntry.pageTitle}", Content length=${mappedEntry.content.length}`,
        );
        return mappedEntry;
      });

      this.logger.log(
        `Successfully mapped ${mappedEntries.length} content entries`,
      );
      return mappedEntries;
    } catch (error) {
      this.logger.error(
        `Failed to fetch content entries for bankId: ${bankId}`,
        error,
      );
      throw error;
    }
  }

  generateQuizStream(bankId: number): Observable<QuizGenerationProgress> {
    return from(this.getContentEntriesByBankId(bankId)).pipe(
      switchMap((contentEntries) => {
        if (contentEntries.length === 0) {
          this.logger.warn(
            `Cannot generate quiz: no content entries found for bankId: ${bankId}`,
          );
          return throwError(
            () =>
              new Error(`No content entries found for content bank ${bankId}`),
          );
        }

        const request: GenerateQuizRequest = {
          contentEntries: contentEntries,
        };

        this.logger.log(
          `Prepared quiz generation request with ${JSON.stringify(request.contentEntries)} content entries`,
        );

        return this.quizGenerationService.generateQuiz(request).pipe(
          map((progress: QuizGenerationProgressCamelCase): QuizGenerationProgress => {
            const result: QuizGenerationProgress = {};
            
            if (progress.status) {
              result.status = {
                content_entry_id: progress.status.contentEntryId,
                page_title: progress.status.pageTitle,
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
          })
        );
      }));
  }
}
