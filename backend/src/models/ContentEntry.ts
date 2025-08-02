import { Model, RelationMappings } from 'objection';
import knex from '../db';
import ContentBank from './ContentBank';
import AiTopic from './AiTopic';
import Question from './Question';
import QuizContentEntry from './QuizContentEntry';

Model.knex(knex);

export type ContentType = 'selected_text' | 'full_html';

export interface ContentEntryData {
  id?: number;
  bank_id: number;
  content_type: ContentType;
  content?: string;
  bucket_object_url?: string;
  source_url?: string;
  page_title?: string;
  created_at?: Date;
  prompt_summary?: string;
  ai_topic_id?: number;
}

export class ContentEntry extends Model {
  static get tableName() {
    return 'content_entries';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  bank_id!: number;
  content_type!: ContentType;
  content?: string;
  bucket_object_url?: string;
  source_url?: string;
  page_title?: string;
  created_at!: Date;
  prompt_summary?: string;
  ai_topic_id?: number;

  // Relations
  contentBank?: ContentBank;
  aiTopic?: AiTopic;
  questions?: Question[];
  quizContentEntries?: QuizContentEntry[];

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['bank_id', 'content_type', 'content'],
      properties: {
        id: { type: 'integer' },
        bank_id: { type: 'integer' },
        content_type: { type: 'string', enum: ['selected_text', 'full_html'] },
        content: { type: 'string', minLength: 1 },
        source_url: { type: 'string' },
        bucket_object_url: { type: 'string' },
        page_title: { type: 'string' },
        created_at: { type: 'string', format: 'date-time' },
        prompt_summary: { type: 'string' },
        ai_topic_id: { type: 'integer' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      contentBank: {
        relation: Model.BelongsToOneRelation,
        modelClass: ContentBank,
        join: {
          from: 'content_entries.bank_id',
          to: 'content_banks.id'
        }
      },
      aiTopic: {
        relation: Model.BelongsToOneRelation,
        modelClass: AiTopic,
        join: {
          from: 'content_entries.ai_topic_id',
          to: 'ai_topics.id'
        }
      },
      questions: {
        relation: Model.HasManyRelation,
        modelClass: Question,
        join: {
          from: 'content_entries.id',
          to: 'questions.source_content_id'
        }
      },
      quizContentEntries: {
        relation: Model.HasManyRelation,
        modelClass: QuizContentEntry,
        join: {
          from: 'content_entries.id',
          to: 'quiz_content_entries.content_entry_id'
        }
      }
    };
  }

  static async findByBankId(bankId: number): Promise<ContentEntry[]> {
    return this.query().where('bank_id', bankId);
  }

  static async createEntry(data: Omit<ContentEntryData, 'id' | 'created_at'>): Promise<ContentEntry> {
    return this.query().insert(data);
  }
}

export default ContentEntry;