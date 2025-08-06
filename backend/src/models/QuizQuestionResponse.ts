import { Model, RelationMappings } from 'objection';
import knex from '../db';
import Quiz from './Quiz';
import QuizQuestion from './QuizQuestion';
import QuizQuestionOption from './QuizQuestionOption';

Model.knex(knex);

export interface QuizQuestionResponseData {
  id?: number;
  quiz_id: number;
  quiz_question_id: number;
  quiz_question_option_id: number;
  is_correct: boolean;
  response_time: string; // interval as string
}

export class QuizQuestionResponse extends Model {
  static get tableName() {
    return 'quiz_question_responses';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  quiz_id!: number;
  quiz_question_id!: number;
  quiz_question_option_id!: number;
  is_correct!: boolean;
  response_time!: string;

  // Relations
  quiz?: Quiz;
  quizQuestion?: QuizQuestion;
  quizQuestionOption?: QuizQuestionOption;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['quiz_id', 'quiz_question_id', 'quiz_question_option_id', 'is_correct', 'response_time'],
      properties: {
        id: { type: 'integer' },
        quiz_id: { type: 'integer' },
        quiz_question_id: { type: 'integer' },
        quiz_question_option_id: { type: 'integer' },
        is_correct: { type: 'boolean' },
        response_time: { type: 'string' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      quiz: {
        relation: Model.BelongsToOneRelation,
        modelClass: Quiz,
        join: {
          from: 'quiz_question_responses.quiz_id',
          to: 'quizzes.id'
        }
      },
      quizQuestion: {
        relation: Model.BelongsToOneRelation,
        modelClass: QuizQuestion,
        join: {
          from: 'quiz_question_responses.quiz_question_id',
          to: 'quiz_questions.id'
        }
      },
      quizQuestionOption: {
        relation: Model.BelongsToOneRelation,
        modelClass: QuizQuestionOption,
        join: {
          from: 'quiz_question_responses.quiz_question_option_id',
          to: 'quiz_question_options.id'
        }
      }
    };
  }

  static async createResponse(data: Omit<QuizQuestionResponseData, 'id'>): Promise<QuizQuestionResponse> {
    return await QuizQuestionResponse.query().insert(data);
  }
}

export default QuizQuestionResponse;