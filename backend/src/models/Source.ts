import { Model } from 'objection';
import knex from '../db';
import { User } from './User';
import { Collection } from './Collection';
import { Question } from './Question';

// Bind the model to the knex instance
Model.knex(knex);

export interface SourceData {
  id?: number;
  user_id: string;
  created_date?: Date;
  link_source?: string;
  text?: string;
  prompt_summary?: string;
  type?: "link" | "text";
  collection_id?: number;
}

export class Source extends Model {
  static get tableName() {
    return 'source';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  user_id!: string;
  created_date!: Date;
  link_source?: string;
  text?: string;
  prompt_summary?: string;
  type?: "link" | "text";
  collection_id?: number;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'string', format: 'uuid' },
        created_date: { type: 'string', format: 'date-time' },
        link_source: { type: 'string', maxLength: 255 },
        text: { type: 'string' },
        prompt_summary: { type: 'string' },
        type: { type: 'string', maxLength: 255 },
        collection_id: { type: 'integer' }
      }
    };
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'source.user_id',
          to: 'users.id'
        }
      },
      collection: {
        relation: Model.BelongsToOneRelation,
        modelClass: Collection,
        join: {
          from: 'source.collection_id',
          to: 'collections.id'
        }
      },
      questions: {
        relation: Model.HasManyRelation,
        modelClass: Question,
        join: {
          from: 'source.id',
          to: 'questions.source_id'
        }
      }
    };
  }

  static async findByCollectionId(collectionId: number): Promise<Source[]> {
    return this.query().where('collection_id', collectionId);
  }

  static async createSource(sourceData: Omit<SourceData, 'id' | 'created_date'>): Promise<Source> {
    return this.query().insert(sourceData);
  }
}

export default Source;