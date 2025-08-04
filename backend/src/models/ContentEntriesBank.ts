import { Model, RelationMappings } from 'objection';
import knex from '../db';
import ContentEntry from './ContentEntry';
import ContentBank from './ContentBank';

Model.knex(knex);

export interface ContentEntriesBankData {
  id?: number;
  content_entry_id: number;
  content_bank_id: number;
}

export class ContentEntriesBank extends Model {
  static get tableName() {
    return 'content_entries_bank';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  content_entry_id!: number;
  content_bank_id!: number;

  // Relations
  contentEntry?: ContentEntry;
  contentBank?: ContentBank;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['content_entry_id', 'content_bank_id'],
      properties: {
        id: { type: 'integer' },
        content_entry_id: { type: 'integer' },
        content_bank_id: { type: 'integer' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      contentEntry: {
        relation: Model.BelongsToOneRelation,
        modelClass: ContentEntry,
        join: {
          from: 'content_entries_bank.content_entry_id',
          to: 'content_entries.id'
        }
      },
      contentBank: {
        relation: Model.BelongsToOneRelation,
        modelClass: ContentBank,
        join: {
          from: 'content_entries_bank.content_bank_id',
          to: 'content_banks.id'
        }
      }
    };
  }
}

export default ContentEntriesBank;