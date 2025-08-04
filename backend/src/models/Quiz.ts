import { Model, RelationMappings } from 'objection';
import knex from '../db';
import ContentBank from './ContentBank';
import User from './User';

Model.knex(knex);

export interface QuizData {
  id?: number;
  bank_id?: number;
  bank_name?: string;
  created_at?: Date;
  content_entries_count?: number;
  completed_at?: Date;
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
  bank_id?: number;
  bank_name?: string;
  created_at!: Date;
  content_entries_count!: number;
  completed_at?: Date;
  user_id?: string;

  // Relations
  contentBank?: ContentBank;
  user?: User;

  static get jsonSchema() {
    return {
      type: 'object',
      required: [],
      properties: {
        id: { type: 'integer' },
        bank_id: { type: 'integer' },
        bank_name: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        content_entries_count: { type: 'integer', minimum: 0 },
        completed_at: { type: 'string', format: 'date-time' },
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