import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { QuizService, QuizStatus } from './quiz.service';
import { FindAllQuizzesDto } from './dto/find-all-quizzes.dto';
import { FindQuizResponsesDto } from './dto/find-quiz-responses.dto';
import { tap, switchMap, Observable, throwError } from 'rxjs';

@Controller()
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @GrpcMethod('QuizService', 'CreateQuiz')
  createQuiz(data: {
    bank_id: number;
    user_id: string;
  }): Observable<{ quizId: string }> {
    return this.quizService.checkQuizInProgress({ user_id: data.user_id }).pipe(
      switchMap((checkResult) => {
        if (checkResult.in_progress) {
          return throwError(() => new Error('Quiz already in progress'));
        } else {
          // No quiz in progress, create a new one
          return this.quizService
            .createQuiz({
              userId: data.user_id,
              bankId: data.bank_id,
              status: QuizStatus.IN_PROGRESS,
            })
            .pipe(
              tap((result) => {
                if (result.quizId) {
                  this.quizService.emitCreateQuizEvent(
                    result.quizId,
                    data.bank_id,
                    data.user_id,
                  );
                }
              }),
            );
        }
      }),
    );
  }

  @GrpcMethod('QuizService', 'FindAllQuizzes')
  findAll(data: { page?: number; limit?: number; user_id: string }) {
    const findAllDto: FindAllQuizzesDto = {
      page: data.page,
      limit: data.limit,
      userId: data.user_id,
    };
    return this.quizService.findAll(findAllDto);
  }

  @GrpcMethod('QuizService', 'FindOneQuiz')
  findOne(data: { id: number; user_id: string }) {
    return this.quizService.findOne(data.id, data.user_id);
  }

  @GrpcMethod('QuizService', 'FindQuizResponses')
  findQuizResponses(data: {
    page?: number;
    limit?: number;
    quiz_id: string;
    user_id: string;
  }) {
    const findResponsesDto: FindQuizResponsesDto = {
      page: data.page,
      limit: data.limit,
      quizId: Number(data.quiz_id),
      userId: data.user_id,
    };
    return this.quizService.findQuizResponses(findResponsesDto);
  }

  @GrpcMethod('QuizService', 'FindQuizSummary')
  findQuizSummary(data: { id: number; user_id: string }) {
    return this.quizService.findQuizSummary(data.id, data.user_id);
  }

  @GrpcMethod('QuizService', 'RemoveQuiz')
  remove(data: { id: number; user_id: string }) {
    return this.quizService.remove(data.id, data.user_id);
  }

  @GrpcMethod('QuizService', 'UpdateQuiz')
  updateQuiz(data: {
    quiz_id: number;
    user_id: string;
    question_option_id: number;
  }) {
    return this.quizService.updateQuiz({
      userId: data.user_id,
      quizId: data.quiz_id,
      questionOptionId: data.question_option_id,
    });
  }

  @GrpcMethod('QuizService', 'CheckQuizInProgress')
  checkQuizInProgress(data: { user_id: string }) {
    return this.quizService.checkQuizInProgress({ user_id: data.user_id });
  }
}
