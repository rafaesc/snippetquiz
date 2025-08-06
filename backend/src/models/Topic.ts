import { Model, RelationMappings } from 'objection';
import knex from '../db';
import User from './User';
import ContentEntry from './ContentEntry';

Model.knex(knex);

export interface TopicData {
  id?: number;
  user_id: string;
  topic: string;
  created_at?: Date;
}

export class Topic extends Model {
  static get tableName() {
    return 'topics';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  user_id!: string;
  topic!: string;
  created_at!: Date;

  // Relations
  user?: User;
  contentEntries?: ContentEntry[];

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'topic'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'string' },
        topic: { type: 'string', minLength: 1 },
        created_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'topics.user_id',
          to: 'users.id'
        }
      },
      contentEntries: {
        relation: Model.HasManyRelation,
        modelClass: ContentEntry,
        join: {
          from: 'topics.id',
          to: 'content_entries.topic_id'
        }
      }
    };
  }

  static async findByUserId(userId: string): Promise<Topic[]> {
    return this.query().where('user_id', userId);
  }

  static async createTopic(data: Omit<TopicData, 'id' | 'created_at'>): Promise<Topic> {
    return this.query().insert(data);
  }
}

export default Topic;