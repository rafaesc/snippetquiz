import { Model } from 'objection';
import knex from '../db';
import { User } from './User';
import { Quiz } from './Quiz';
import { Source } from './Source';
import { Alternative } from './Alternative';

// Bind the model to the knex instance
Model.knex(knex);

export interface QuestionData {
  id?: number;
  user_id: number;
  quiz_id: number;
  source_id?: number;
  question_text: string;
  created_date?: Date;
  updated_date?: Date;
}

export class Question extends Model {
  static get tableName() {
    return 'questions';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  user_id!: number;
  quiz_id!: number;
  source_id?: number;
  question_text!: string;
  created_date!: Date;
  updated_date!: Date;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'quiz_id', 'question_text'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        quiz_id: { type: 'integer' },
        source_id: { type: 'integer' },
        question_text: { type: 'string', minLength: 1 },
        created_date: { type: 'string', format: 'date-time' },
        updated_date: { type: 'string', format: 'date-time' }
      }
    };
  }

  static get relationMappings() {
    return {
      user: {
        relation: Model.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'questions.user_id',
          to: 'users.id'
        }
      },
      quiz: {
        relation: Model.BelongsToOneRelation,
        modelClass: Quiz,
        join: {
          from: 'questions.quiz_id',
          to: 'quizzes.id'
        }
      },
      source: {
        relation: Model.BelongsToOneRelation,
        modelClass: Source,
        join: {
          from: 'questions.source_id',
          to: 'source.id'
        }
      },
      alternatives: {
        relation: Model.HasManyRelation,
        modelClass: Alternative,
        join: {
          from: 'questions.id',
          to: 'alternatives.question_id'
        }
      }
    };
  }

  static async findByQuizId(quizId: number): Promise<Question[]> {
    return this.query().where('quiz_id', quizId);
  }

  static async createQuestion(questionData: Omit<QuestionData, 'id' | 'created_date' | 'updated_date'>): Promise<Question> {
    return this.query().insert(questionData);
  }
}

export default Question;