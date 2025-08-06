import { Model, RelationMappings } from 'objection';
import knex from '../db';
import QuizQuestion from './QuizQuestion';
import QuizQuestionResponse from './QuizQuestionResponse';

Model.knex(knex);

export interface QuizQuestionOptionData {
  id?: number;
  quiz_question_id: number;
  option_text: string;
  option_explanation: string;
  is_correct?: boolean;
}

export class QuizQuestionOption extends Model {
  static get tableName() {
    return 'quiz_question_options';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  quiz_question_id!: number;
  option_text!: string;
  option_explanation!: string;
  is_correct!: boolean;

  // Relations
  quizQuestion?: QuizQuestion;
  responses?: QuizQuestionResponse[];

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['quiz_question_id', 'option_text', 'option_explanation'],
      properties: {
        id: { type: 'integer' },
        quiz_question_id: { type: 'integer' },
        option_text: { type: 'string', minLength: 1 },
        option_explanation: { type: 'string', minLength: 1 },
        is_correct: { type: 'boolean' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      quizQuestion: {
        relation: Model.BelongsToOneRelation,
        modelClass: QuizQuestion,
        join: {
          from: 'quiz_question_options.quiz_question_id',
          to: 'quiz_questions.id'
        }
      },
      responses: {
        relation: Model.HasManyRelation,
        modelClass: QuizQuestionResponse,
        join: {
          from: 'quiz_question_options.id',
          to: 'quiz_question_responses.quiz_question_option_id'
        }
      }
    };
  }

  static async createOption(data: Omit<QuizQuestionOptionData, 'id'>): Promise<QuizQuestionOption> {
    return await QuizQuestionOption.query().insert(data);
  }
}

export default QuizQuestionOption;