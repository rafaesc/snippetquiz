import { Injectable, Inject, Logger } from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import { Observable, from, map, switchMap, tap, throwError } from 'rxjs';
import { PrismaClient } from 'generated/prisma/postgres';
import { QUIZ_GENERATION_SERVICE } from '../config/services';
import {
  ContentEntry,
  GenerateQuizRequest,
  QuizGenerationProgress,
  QuizGenerationProgressCamelCase,
  QuizGenerationService,
  mapQuizGenerationProgress,
} from './dto/quiz-generator.dto';

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
            return mapQuizGenerationProgress(progress);
          })
        );
      }));
  }
}
