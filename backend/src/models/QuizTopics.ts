import { Model, RelationMappings } from 'objection';
import knex from '../db';
import Quiz from './Quiz';

Model.knex(knex);

export interface QuizTopicsData {
  id?: number;
  quiz_id: number;
  topic_name: string;
}

export class QuizTopics extends Model {
  static get tableName() {
    return 'quiz_topics';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  quiz_id!: number;
  topic_name!: string;

  // Relations
  quiz?: Quiz;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['quiz_id', 'topic_name'],
      properties: {
        id: { type: 'integer' },
        quiz_id: { type: 'integer' },
        topic_name: { type: 'string' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      quiz: {
        relation: Model.BelongsToOneRelation,
        modelClass: Quiz,
        join: {
          from: 'quiz_topics.quiz_id',
          to: 'quizzes.id'
        }
      },
    };
  }
}

export default QuizTopics;