import {
  Injectable,
  Inject,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { type ClientGrpc } from '@nestjs/microservices';
import {
  Observable,
  from,
  map,
  switchMap,
  tap,
  forkJoin,
  of,
  concatMap,
} from 'rxjs';
import { AI_GENERATION_SERVICE } from '../config/services';
import {
  GenerateQuizRequest,
  QuizGenerationProgressCamelCase,
  AiGenerationService,
} from './dto/quiz-generator.dto';
import { CoreQuizGenerationStatus } from './dto/core-quiz-generation.dto';
import { QuizService, QuizStatus } from '../quiz/quiz.service';
import { ContentEntryService } from '../content-entry/content-entry.service';

@Injectable()
export class QuizGeneratorService implements OnModuleInit {
  private readonly logger = new Logger(QuizGeneratorService.name);
  private aiGenerationService: AiGenerationService;

  constructor(
    @Inject(AI_GENERATION_SERVICE) private client: ClientGrpc,
    private quizService: QuizService,
    private contentEntryService: ContentEntryService,
  ) {
  }

  async onModuleInit() {
    try {
      this.aiGenerationService = this.client.getService<AiGenerationService>(
        'AiGenerationService',
      );
    } catch (error) {
      throw error;
    }
  }

  generateQuizStream(
    bankId: number,
    userId: string,
  ): Observable<CoreQuizGenerationStatus> {
    let processedContentEntries = 0;
    let totalContentEntries = 0;
    let entriesSkipped = 0;
    let totalQuestionsGenerated = 0;
    let totalChunks = 0;
    let currentChunkIndex = -1;
    const processedContentEntryIds = new Set<string>();

    return from(
      this.contentEntryService.calculateTotalChunksForBank(bankId, userId),
    ).pipe(
      switchMap((totalChunksInfo) => {
        totalChunks = totalChunksInfo;
        return from(
          this.quizService
            .getContentEntriesByBankId(bankId, userId)
            .then(
              (response: {
                request: GenerateQuizRequest;
                entriesSkipped: number;
              }) => {
                totalContentEntries = response.request.contentEntries.length;
                entriesSkipped = response.entriesSkipped;
                return response.request;
              },
            ),
        );
      }),
      switchMap(
        (
          request: GenerateQuizRequest,
        ): Observable<QuizGenerationProgressCamelCase> => {
          if (request.contentEntries.length === 0) {
            return of({
              completed: true,
            });
          }
          return this.aiGenerationService.generateQuiz(request);
        },
      ),
      tap((progress) => {
        if (progress.status) {
          const contentEntryId = progress.status.contentEntryId.toString();
          if (!processedContentEntryIds.has(contentEntryId)) {
            processedContentEntryIds.add(contentEntryId);
            processedContentEntries++;
          }
        }
        if (progress.result) {
          currentChunkIndex++;
        }
      }),
      concatMap(
        (
          progress: QuizGenerationProgressCamelCase,
        ): Observable<CoreQuizGenerationStatus> => {
          if (progress.result) {
            const contentEntryId = progress.result.contentEntryId;
            const questions = progress.result.questions;

            if (!questions || questions.length === 0) {
              return of({
                progress: {
                  quiz_id: 'null',
                  bank_id: bankId.toString(),
                  total_content_entries: totalContentEntries,
                  current_content_entry_index: processedContentEntries,
                  questions_generated_so_far: totalQuestionsGenerated,
                  total_content_entries_skipped: entriesSkipped,
                  current_chunk_index: currentChunkIndex,
                  total_chunks: totalChunks,
                  content_entry: {
                    id: progress.result?.contentEntryId?.toString(),
                    name: progress.result?.pageTitle,
                    word_count_analyzed: progress?.result?.wordCountAnalyzed,
                  },
                },
              });
            }

            totalQuestionsGenerated += questions.length;

            this.logger.log(
              `Processing ${questions.length} questions for content entry ${contentEntryId}`,
            );

            // Create all questions for this content entry sequentially
            const questionCreationObservables = questions.map((question) =>
              this.quizService
                .createQuestion({
                  userId,
                  contentEntryId,
                  question: question.question,
                  options: question.options.map((option) => ({
                    optionText: option.optionText,
                    optionExplanation: option.optionExplanation,
                    isCorrect: option.isCorrect,
                  })),
                })
                .pipe(
                  tap((result) => {
                    this.logger.log(
                      `Created question ${result.questionId} for content entry ${contentEntryId}`,
                    );
                  }),
                ),
            );

            // Execute all question creations in parallel, then update content entry
            return forkJoin(questionCreationObservables).pipe(
              switchMap(() =>
                this.contentEntryService.updateContentEntry({
                  userId,
                  contentEntryId,
                }),
              ),
              map(() => {
                this.logger.log(
                  `Content entry ${contentEntryId} updated. Progress: ${processedContentEntries}/${totalContentEntries}`,
                );
                return {
                  progress: {
                    quiz_id: 'null',
                    bank_id: bankId.toString(),
                    total_content_entries: totalContentEntries,
                    current_content_entry_index: processedContentEntries,
                    questions_generated_so_far: totalQuestionsGenerated,
                    total_content_entries_skipped: entriesSkipped,
                    current_chunk_index: currentChunkIndex,
                    total_chunks: totalChunks,
                    content_entry: {
                      id: progress.result?.contentEntryId?.toString(),
                      name: progress.result?.pageTitle,
                      word_count_analyzed: progress?.result?.wordCountAnalyzed,
                    },
                  },
                };
              }),
            );
          }

          if (progress.completed) {
            this.logger.log(
              `All content entries processed. Creating quiz for bankId: ${bankId}`,
            );

            return this.quizService
              .createQuiz({
                userId,
                bankId,
                status: QuizStatus.READY,
              })
              .pipe(
                tap({
                  next: (result) => {
                    this.logger.log(
                      `Quiz created successfully Quiz ID: ${result.quiz_id}`,
                    );
                  },
                  error: (error) => {
                    this.logger.error(
                      `Failed to create quiz: ${error.message}`,
                      error,
                    );
                  },
                }),
                map((result) => {
                  return {
                    completed: {
                      quiz_id: result.quiz_id,
                    },
                  };
                }),
              );
          }

          return this.quizService
            .getQuestionsGenerated({
              userId,
              contentBankId: bankId,
            })
            .pipe(
              map((questionsGenerated) => ({
                progress: {
                  quiz_id: 'null',
                  bank_id: bankId.toString(),
                  total_content_entries: totalContentEntries,
                  current_content_entry_index: processedContentEntries,
                  questions_generated_so_far: questionsGenerated,
                  total_content_entries_skipped: entriesSkipped,
                  current_chunk_index: currentChunkIndex,
                  total_chunks: totalChunks,
                  content_entry: {
                    id: progress?.status?.contentEntryId?.toString(),
                    name: progress?.status?.pageTitle,
                    word_count_analyzed: progress?.status?.wordCountAnalyzed,
                  },
                },
              })),
            );
        },
      ),
    );
  }
}
