import { Model, RelationMappings } from 'objection';
import knex from '../db';
import User from './User';
import ContentEntry from './ContentEntry';
import Quiz from './Quiz';

Model.knex(knex);

export interface ContentBankData {
  id?: number;
  user_id: string;
  name: string;
  created_at?: Date;
  updated_at?: Date;
}

export class ContentBank extends Model {
  static get tableName() {
    return 'content_banks';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  user_id!: string;
  name!: string;
  created_at!: Date;
  updated_at!: Date;

  // Relations
  user?: User;
  contentEntries?: ContentEntry[];
  quizzes?: Quiz[];

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'name'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'string' },
        name: { type: 'string', minLength: 1 },
        created_at: { type: 'string', format: 'date-time' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'content_banks.user_id',
          to: 'users.id'
        }
      },
      contentEntries: {
        relation: Model.HasManyRelation,
        modelClass: ContentEntry,
        join: {
          from: 'content_banks.id',
          to: 'content_entries.bank_id'
        }
      },
      quizzes: {
        relation: Model.HasManyRelation,
        modelClass: Quiz,
        join: {
          from: 'content_banks.id',
          to: 'quizzes.bank_id'
        }
      }
    };
  }

  static async findByUserId(userId: string): Promise<ContentBank[]> {
    return this.query().where('user_id', userId).select('id', 'name');
  }

  static async createBank(data: Omit<ContentBankData, 'id' | 'created_at' | 'updated_at'>): Promise<ContentBank> {
    return this.query().insert(data);
  }
}

export default ContentBank;