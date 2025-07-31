import { Model } from 'objection';
import knex from '../db';
import { User } from './User';
import { Collection } from './Collection';
import { Question } from './Question';

// Bind the model to the knex instance
Model.knex(knex);

export interface QuizData {
  id?: number;
  user_id: number;
  collection_id: number;
  created_date?: Date;
  updated_date?: Date;
}

export class Quiz extends Model {
  static get tableName() {
    return 'quizzes';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  user_id!: number;
  collection_id!: number;
  created_date!: Date;
  updated_date!: Date;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['user_id', 'collection_id'],
      properties: {
        id: { type: 'integer' },
        user_id: { type: 'integer' },
        collection_id: { type: 'integer' },
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
          from: 'quizzes.user_id',
          to: 'users.id'
        }
      },
      collection: {
        relation: Model.BelongsToOneRelation,
        modelClass: Collection,
        join: {
          from: 'quizzes.collection_id',
          to: 'collections.id'
        }
      },
      questions: {
        relation: Model.HasManyRelation,
        modelClass: Question,
        join: {
          from: 'quizzes.id',
          to: 'questions.quiz_id'
        }
      }
    };
  }

  static async findByCollectionId(collectionId: number): Promise<Quiz[]> {
    return this.query().where('collection_id', collectionId);
  }

  static async createQuiz(quizData: Omit<QuizData, 'id' | 'created_date' | 'updated_date'>): Promise<Quiz> {
    return this.query().insert(quizData);
  }
}

export default Quiz;