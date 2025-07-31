import { Model } from 'objection';
import knex from '../db';
import { Question } from './Question';

// Bind the model to the knex instance
Model.knex(knex);

export interface AlternativeData {
  id?: number;
  question_id: number;
  text: string;
  correct?: boolean;
  created_date?: Date;
  updated_date?: Date;
}

export class Alternative extends Model {
  static get tableName() {
    return 'alternatives';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  question_id!: number;
  text!: string;
  correct!: boolean;
  created_date!: Date;
  updated_date!: Date;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['question_id', 'text'],
      properties: {
        id: { type: 'integer' },
        question_id: { type: 'integer' },
        text: { type: 'string', minLength: 1 },
        correct: { type: 'boolean' },
        created_date: { type: 'string', format: 'date-time' },
        updated_date: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    return {
      question: {
        relation: Model.BelongsToOneRelation,
        modelClass: Question,
        join: {
          from: 'alternatives.question_id',
          to: 'questions.id'
        }
      }
    };
  }

  static async findByQuestionId(questionId: number): Promise<Alternative[]> {
    return this.query().where('question_id', questionId);
  }

  static async findCorrectByQuestionId(questionId: number): Promise<Alternative[]> {
    return this.query().where('question_id', questionId).where('correct', true);
  }

  static async createAlternative(alternativeData: Omit<AlternativeData, 'id' | 'created_date' | 'updated_date'>): Promise<Alternative> {
    return this.query().insert(alternativeData);
  }
}

export default Alternative;