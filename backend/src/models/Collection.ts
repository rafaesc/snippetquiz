import { Model } from 'objection';
import knex from '../db';
import { User } from './User';
import { Quiz } from './Quiz';
import { Source } from './Source';
import { CollectionResult } from './CollectionResult';

// Bind the model to the knex instance
Model.knex(knex);

export interface CollectionData {
  id?: number;
  user_id: string;
  created_date?: Date;
  name: string;
  updated_date?: Date;
}

// DTO for API responses
export interface CollectionDTO {
  id: number;
  name: string;
  updatedDate: Date;
}

export class Collection extends Model {
  static get tableName() {
    return 'collections';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  user_id!: string;
  created_date!: Date;
  name!: string;
  updated_date!: Date;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'name'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'string', format: 'uuid' },
        created_date: { type: 'string', format: 'date-time' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        updated_date: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'collections.user_id',
          to: 'users.id'
        }
      },
      quizzes: {
        relation: Model.HasManyRelation,
        modelClass: Quiz,
        join: {
          from: 'collections.id',
          to: 'quizzes.collection_id'
        }
      },
      sources: {
        relation: Model.HasManyRelation,
        modelClass: Source,
        join: {
          from: 'collections.id',
          to: 'source.collection_id'
        }
      },
      results: {
        relation: Model.HasManyRelation,
        modelClass: CollectionResult,
        join: {
          from: 'collections.id',
          to: 'collection_results.collection_id'
        }
      }
    };
  }

  static async findByUserId(userId: string): Promise<Collection[]> {
    return this.query().where('user_id', userId);
  }

  static async findByUserIdDTO(userId: string): Promise<CollectionDTO[]> {
    const collections = await this.query()
      .select('id', 'name', 'updated_date')
      .where('user_id', userId);
    
    return collections.map(collection => ({
      id: collection.id,
      name: collection.name,
      updatedDate: collection.updated_date
    }));
  }

  // Convert instance to DTO
  toDTO(): CollectionDTO {
    return {
      id: this.id,
      name: this.name,
      updatedDate: this.updated_date
    };
  }

  static async createCollection(collectionData: Omit<CollectionData, 'id' | 'created_date' | 'updated_date'>): Promise<Collection> {
    return this.query().insert(collectionData);
  }
}

export default Collection;