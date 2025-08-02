import { Model, RelationMappings } from 'objection';
import knex from '../db';
import ContentBank from './ContentBank';
import User from './User';
import QuizCompletion from './QuizCompletion';
import QuizContentEntry from './QuizContentEntry';

Model.knex(knex);

export interface QuizData {
  id?: number;
  bank_id: number;
  created_at?: Date;
  content_entries_count?: number;
  user_id?: string;
}

export class Quiz extends Model {
  static get tableName() {
    return 'quizzes';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  bank_id!: number;
  created_at!: Date;
  content_entries_count!: number;
  user_id?: string;

  // Relations
  contentBank?: ContentBank;
  user?: User;
  completions?: QuizCompletion[];
  quizContentEntries?: QuizContentEntry[];

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['bank_id'],
      properties: {
        id: { type: 'integer' },
        bank_id: { type: 'integer' },
        created_at: { type: 'string', format: 'date-time' },
        content_entries_count: { type: 'integer', minimum: 0 },
        user_id: { type: 'string' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      contentBank: {
        relation: Model.BelongsToOneRelation,
        modelClass: ContentBank,
        join: {
          from: 'quizzes.bank_id',
          to: 'content_banks.id'
        }
      },
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'quizzes.user_id',
          to: 'users.id'
        }
      },
      completions: {
        relation: Model.HasManyRelation,
        modelClass: QuizCompletion,
        join: {
          from: 'quizzes.id',
          to: 'quiz_completions.quiz_id'
        }
      },
      quizContentEntries: {
        relation: Model.HasManyRelation,
        modelClass: QuizContentEntry,
        join: {
          from: 'quizzes.id',
          to: 'quiz_content_entries.quiz_id'
        }
      }
    };
  }

  static async findByBankId(bankId: number): Promise<Quiz[]> {
    return this.query().where('bank_id', bankId);
  }

  static async findByUserId(userId: string): Promise<Quiz[]> {
    return this.query().where('user_id', userId);
  }

  static async createQuiz(data: Omit<QuizData, 'id' | 'created_at'>): Promise<Quiz> {
    return this.query().insert(data);
  }
}

export default Quiz;