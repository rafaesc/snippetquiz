import { Model, RelationMappings } from 'objection';
import knex from '../db';
import User from './User';
import Quiz from './Quiz';
import QuestionResponse from './QuestionResponse';

Model.knex(knex);

export interface QuizCompletionData {
  id?: number;
  user_id: string;
  quiz_id: number;
  completed_at?: Date;
}

export class QuizCompletion extends Model {
  static get tableName() {
    return 'quiz_completions';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  user_id!: string;
  quiz_id!: number;
  completed_at!: Date;

  // Relations
  user?: User;
  quiz?: Quiz;
  questionResponses?: QuestionResponse[];

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'quiz_id'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'string' },
        quiz_id: { type: 'integer' },
        completed_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'quiz_completions.user_id',
          to: 'users.id'
        }
      },
      quiz: {
        relation: Model.BelongsToOneRelation,
        modelClass: Quiz,
        join: {
          from: 'quiz_completions.quiz_id',
          to: 'quizzes.id'
        }
      },
      questionResponses: {
        relation: Model.HasManyRelation,
        modelClass: QuestionResponse,
        join: {
          from: 'quiz_completions.id',
          to: 'question_responses.completion_id'
        }
      }
    };
  }

  static async findByUserId(userId: string): Promise<QuizCompletion[]> {
    return this.query().where('user_id', userId);
  }

  static async findByQuizId(quizId: number): Promise<QuizCompletion[]> {
    return this.query().where('quiz_id', quizId);
  }

  static async createCompletion(data: Omit<QuizCompletionData, 'id' | 'completed_at'>): Promise<QuizCompletion> {
    return this.query().insert(data);
  }
}

export default QuizCompletion;