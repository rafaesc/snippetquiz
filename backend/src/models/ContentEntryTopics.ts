import { Model, RelationMappings } from 'objection';
import knex from '../db';
import ContentEntry from './ContentEntry';
import AiTopic from './AiTopic';

Model.knex(knex);

export interface ContentEntryTopicsData {
  id?: number;
  content_entry_id: number;
  ai_topic_id: number;
}

export class ContentEntryTopics extends Model {
  static get tableName() {
    return 'content_entry_topics';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  content_entry_id!: number;
  ai_topic_id!: number;

  // Relations
  contentEntry?: ContentEntry;
  aiTopic?: AiTopic;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['content_entry_id', 'ai_topic_id'],
      properties: {
        id: { type: 'integer' },
        content_entry_id: { type: 'integer' },
        ai_topic_id: { type: 'integer' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      contentEntry: {
        relation: Model.BelongsToOneRelation,
        modelClass: ContentEntry,
        join: {
          from: 'content_entry_topics.content_entry_id',
          to: 'content_entries.id'
        }
      },
      aiTopic: {
        relation: Model.BelongsToOneRelation,
        modelClass: AiTopic,
        join: {
          from: 'content_entry_topics.ai_topic_id',
          to: 'ai_topics.id'
        }
      }
    };
  }
}

export default ContentEntryTopics;