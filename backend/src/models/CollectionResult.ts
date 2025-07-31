import { Model } from 'objection';
import knex from '../db';
import { User } from './User';
import { Collection } from './Collection';

// Bind the model to the knex instance
Model.knex(knex);

export interface CollectionResultData {
  id?: number;
  user_id: string;
  collection_id: number;
  total_answered: number;
  correct_answers: number;
  created_at?: Date;
}

export class CollectionResult extends Model {
  static get tableName() {
    return 'collection_results';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  user_id!: string;
  collection_id!: number;
  total_answered!: number;
  correct_answers!: number;
  created_at!: Date;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'collection_id', 'total_answered', 'correct_answers'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'string', format: 'uuid' },
        collection_id: { type: 'integer' },
        total_answered: { type: 'integer', minimum: 0 },
        correct_answers: { type: 'integer', minimum: 0 },
        created_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'collection_results.user_id',
          to: 'users.id'
        }
      },
      collection: {
        relation: Model.BelongsToOneRelation,
        modelClass: Collection,
        join: {
          from: 'collection_results.collection_id',
          to: 'collections.id'
        }
      }
    };
  }

  static async findByUserId(userId: string): Promise<CollectionResult[]> {
    return this.query().where('user_id', userId);
  }

  static async findByCollectionId(collectionId: number): Promise<CollectionResult[]> {
    return this.query().where('collection_id', collectionId);
  }

  static async createResult(resultData: Omit<CollectionResultData, 'id' | 'created_at'>): Promise<CollectionResult> {
    return this.query().insert(resultData);
  }

  // Calculate success rate
  get successRate(): number {
    return this.total_answered > 0 ? (this.correct_answers / this.total_answered) * 100 : 0;
  }
}

export default CollectionResult;