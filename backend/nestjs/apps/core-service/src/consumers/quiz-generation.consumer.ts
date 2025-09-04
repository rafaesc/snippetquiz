import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { type QuizGenerationEventPayload } from '../quiz/dto/quiz-generation-event-dto';
import { QuizService, QuizStatus } from '../quiz/quiz.service';
import {
  concatMap,
  firstValueFrom,
  forkJoin,
  switchMap,
  tap,
} from 'rxjs';
import { ContentEntryService } from '../content-entry/content-entry.service';

@Controller()
export class QuizGenerationConsumer {
  private readonly logger = new Logger(QuizGenerationConsumer.name);

  constructor(
    private contentEntryService: ContentEntryService,
    private quizService: QuizService,
  ) {}

  @EventPattern('quiz-generation')
  async handleQuizGenerationEvent(@Payload() data: QuizGenerationEventPayload) {
    try {
      await this.handleSaveEvent(data);
    } catch (error) {
      this.logger.error('Failed to process quiz-generation event', error);
    }
  }

  private async handleSaveEvent(data: QuizGenerationEventPayload) {
    const contentEntryId = data.contentEntry.id;
    const questions = data.contentEntry.questions;
    const userId = data.userId;
    const quizId = data.quizId;

    await firstValueFrom(
      forkJoin(
        questions.map((question) => {
          return this.quizService.createQuestion({
            userId,
            contentEntryId,
            question: question.question,
            options: question.options.map((option) => ({
              optionText: option.optionText,
              optionExplanation: option.optionExplanation,
              isCorrect: option.isCorrect,
            })),
          });
        }),
      ).pipe(
        concatMap(() =>
          this.contentEntryService.updateContentEntry({
            userId,
            contentEntryId,
          }),
        ),
        switchMap(() => {
          this.logger.log(
            `Quiz - ${quizId} Content entry ${contentEntryId} updated. Progress: ${data.currentChunkIndex + 1}/${data.totalChunks}`,
          );

          if (data.currentChunkIndex + 1 === data.totalChunks) {
            this.logger.log(
              `All content entries processed. Creating quiz for bankId: ${data.bankId}`,
            );

            return this.quizService.createQuiz({
              quizId,
              userId,
              bankId: Number(data.bankId),
              status: QuizStatus.READY,
            });
          }

          return this.quizService.createQuiz({
            quizId,
            userId,
            bankId: Number(data.bankId),
            status: QuizStatus.IN_PROGRESS,
          });
        }),
        tap((quiz) => {
          this.logger.log(`Quiz created successfully Quiz ID: ${data.quizId}`);
        }),
      ),
    );
  }
}
