import { Model, RelationMappings } from 'objection';
import knex from '../db';
import ContentEntry from './ContentEntry';
import QuestionOption from './QuestionOption';
import QuestionResponse from './QuestionResponse';

Model.knex(knex);

// Define question types
export type QuestionType = 'multiple_choice' | 'single_answer' | 'true_false';

export interface QuestionData {
  id?: number;
  content: string;
  type: QuestionType;
  source_content_id?: number;
  created_at?: Date;
}

export class Question extends Model {
  static get tableName() {
    return 'questions';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  content!: string;
  type!: QuestionType;
  source_content_id?: number;
  created_at!: Date;

  // Relations
  sourceContent?: ContentEntry;
  options?: QuestionOption[];
  responses?: QuestionResponse[];

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['content', 'type'],
      properties: {
        id: { type: 'integer' },
        content: { type: 'string', minLength: 1 },
        type: { type: 'string', enum: ['multiple_choice', 'single_answer', 'true_false'] },
        source_content_id: { type: 'integer' },
        created_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      sourceContent: {
        relation: Model.BelongsToOneRelation,
        modelClass: ContentEntry,
        join: {
          from: 'questions.source_content_id',
          to: 'content_entries.id'
        }
      },
      options: {
        relation: Model.HasManyRelation,
        modelClass: QuestionOption,
        join: {
          from: 'questions.id',
          to: 'question_options.question_id'
        }
      },
      responses: {
        relation: Model.HasManyRelation,
        modelClass: QuestionResponse,
        join: {
          from: 'questions.id',
          to: 'question_responses.question_id'
        }
      }
    };
  }

  static async createQuestion(data: Omit<QuestionData, 'id' | 'created_at'>): Promise<Question> {
    return this.query().insert(data);
  }

  async getCorrectOption(): Promise<QuestionOption | undefined> {
    const options = await this.$relatedQuery('options').where('is_correct', true);
    return options[0];
  }
}

export default Question;