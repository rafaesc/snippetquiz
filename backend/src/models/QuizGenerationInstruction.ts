import { Model, RelationMappings } from 'objection';
import knex from '../db';
import User from './User';

Model.knex(knex);

export interface QuizGenerationInstructionData {
  id?: number;
  instruction: string;
  user_id?: string;
  updated_at?: Date;
}

export class QuizGenerationInstruction extends Model {
  static get tableName() {
    return 'quiz_generation_instructions';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  instruction!: string;
  user_id?: string;
  updated_at!: Date;

  // Relations
  user?: User;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['instruction'],
      properties: {
        id: { type: 'integer' },
        instruction: { type: 'string', minLength: 1 },
        user_id: { type: 'string' },
        updated_at: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'quiz_generation_instructions.user_id',
          to: 'users.id'
        }
      }
    };
  }

  static async findByUserId(userId: string): Promise<QuizGenerationInstruction[]> {
    return this.query().where('user_id', userId);
  }

  static async createInstruction(data: Omit<QuizGenerationInstructionData, 'id' | 'updated_at'>): Promise<QuizGenerationInstruction> {
    return this.query().insert(data);
  }
}

export default QuizGenerationInstruction;