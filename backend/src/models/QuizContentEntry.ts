import { Model, RelationMappings } from 'objection';
import knex from '../db';
import Quiz from './Quiz';
import ContentEntry from './ContentEntry';

Model.knex(knex);

export interface QuizContentEntryData {
  id?: number;
  quiz_id: number;
  content_entry_id: number;
}

export class QuizContentEntry extends Model {
  static get tableName() {
    return 'quiz_content_entries';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  quiz_id!: number;
  content_entry_id!: number;

  // Relations
  quiz?: Quiz;
  contentEntry?: ContentEntry;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['quiz_id', 'content_entry_id'],
      properties: {
        id: { type: 'integer' },
        quiz_id: { type: 'integer' },
        content_entry_id: { type: 'integer' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      quiz: {
        relation: Model.BelongsToOneRelation,
        modelClass: Quiz,
        join: {
          from: 'quiz_content_entries.quiz_id',
          to: 'quizzes.id'
        }
      },
      contentEntry: {
        relation: Model.BelongsToOneRelation,
        modelClass: ContentEntry,
        join: {
          from: 'quiz_content_entries.content_entry_id',
          to: 'content_entries.id'
        }
      }
    };
  }

  static async findByQuizId(quizId: number): Promise<QuizContentEntry[]> {
    return this.query().where('quiz_id', quizId);
  }

  static async createEntry(data: Omit<QuizContentEntryData, 'id'>): Promise<QuizContentEntry> {
    return this.query().insert(data);
  }
}

export default QuizContentEntry;