import { Model, RelationMappings } from 'objection';
import knex from '../db';
import User from './User';
import ContentEntry from './ContentEntry';

Model.knex(knex);

export interface AiTopicData {
  id?: number;
  user_id: string;
  topic: string;
  created_at?: Date;
}

export class AiTopic extends Model {
  static get tableName() {
    return 'ai_topics';
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
          from: 'ai_topics.user_id',
          to: 'users.id'
        }
      },
      contentEntries: {
        relation: Model.HasManyRelation,
        modelClass: ContentEntry,
        join: {
          from: 'ai_topics.id',
          to: 'content_entries.ai_topic_id'
        }
      }
    };
  }

  static async findByUserId(userId: string): Promise<AiTopic[]> {
    return this.query().where('user_id', userId);
  }

  static async createTopic(data: Omit<AiTopicData, 'id' | 'created_at'>): Promise<AiTopic> {
    return this.query().insert(data);
  }
}

export default AiTopic;