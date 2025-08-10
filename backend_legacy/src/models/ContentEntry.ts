import { Model, RelationMappings } from 'objection';
import knex from '../db';
import Question from './Question';
import Topic from './Topic';

Model.knex(knex);

export type ContentType = 'selected_text' | 'full_html' | 'video_transcript';

export interface ContentEntryData {
  id?: number;
  content_type: ContentType;
  content?: string;
  source_url?: string;
  page_title?: string;
  created_at?: string;
  prompt_summary?: string;
  questions_generated?: boolean;
}

export class ContentEntry extends Model {
  static get tableName() {
    return 'content_entries';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  content_type!: ContentType;
  content?: string;
  source_url?: string;
  page_title?: string;
  created_at!: string;
  prompt_summary?: string;
  questions_generated!: boolean;

  // Relations
  questions?: Question[];
  topics?: Topic[];

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['content_type'],
      properties: {
        id: { type: 'integer' },
        content_type: { type: 'string', enum: ['selected_text', 'full_html', 'video_transcript'] },
        content: { type: 'string' },
        source_url: { type: 'string' },
        page_title: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        prompt_summary: { type: 'string' },
        questions_generated: { type: 'boolean' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      questions: {
        relation: Model.HasManyRelation,
        modelClass: Question,
        join: {
          from: 'content_entries.id',
          to: 'questions.source_content_id'
        }
      },
      topics: {
        relation: Model.ManyToManyRelation,
        modelClass: Topic,
        join: {
          from: 'content_entries.id',
          through: {
            from: 'content_entry_topics.content_entry_id',
            to: 'content_entry_topics.topic_id'
          },
          to: 'topics.id'
        }
      }
    };
  }
}

export default ContentEntry;