import { Model, RelationMappings } from 'objection';
import knex from '../db';
import Question from './Question';

Model.knex(knex);

export type ContentType = 'selected_text' | 'full_html';

export interface ContentEntryData {
  id?: number;
  content_type: ContentType;
  content?: string;
  source_url?: string;
  bucket_object_url?: string;
  page_title?: string;
  created_at?: Date;
  prompt_summary?: string;
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
  bucket_object_url?: string;
  page_title?: string;
  created_at!: Date;
  prompt_summary?: string;

  // Relations
  questions?: Question[];

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['content_type'],
      properties: {
        id: { type: 'integer' },
        content_type: { type: 'string', enum: ['selected_text', 'full_html'] },
        content: { type: 'string' },
        source_url: { type: 'string' },
        bucket_object_url: { type: 'string' },
        page_title: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        prompt_summary: { type: 'string' }
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
      }
    };
  }
}

export default ContentEntry;