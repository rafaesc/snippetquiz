import { Model, RelationMappings } from 'objection';
import knex from '../db';
import ContentEntry from './ContentEntry';
import Topic from './Topic';

Model.knex(knex);

export interface ContentEntryTopicsData {
  id?: number;
  content_entry_id: number;
  topic_id: number;
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
  topic_id!: number;

  // Relations
  contentEntry?: ContentEntry;
  Topic?: Topic;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['content_entry_id', 'topic_id'],
      properties: {
        id: { type: 'integer' },
        content_entry_id: { type: 'integer' },
        topic_id: { type: 'integer' }
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
      Topic: {
        relation: Model.BelongsToOneRelation,
        modelClass: Topic,
        join: {
          from: 'content_entry_topics.topic_id',
          to: 'topics.id'
        }
      }
    };
  }
}

export default ContentEntryTopics;