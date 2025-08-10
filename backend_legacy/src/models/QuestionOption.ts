import { Model, RelationMappings } from 'objection';
import knex from '../db';
import Question from './Question';
import QuestionResponse from './QuestionResponse';

Model.knex(knex);

export interface QuestionOptionData {
  id?: number;
  question_id: number;
  option_text: string;
  option_explanation: string;
  is_correct?: boolean;
}

export class QuestionOption extends Model {
  static get tableName() {
    return 'question_options';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  question_id!: number;
  option_text!: string;
  option_explanation!: string;
  is_correct!: boolean;

  // Relations
  question?: Question;
  responses?: QuestionResponse[];

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['question_id', 'option_text', 'option_explanation'],
      properties: {
        id: { type: 'integer' },
        question_id: { type: 'integer' },
        option_text: { type: 'string', minLength: 1 },
        option_explanation: { type: 'string', minLength: 1 },
        is_correct: { type: 'boolean' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      question: {
        relation: Model.BelongsToOneRelation,
        modelClass: Question,
        join: {
          from: 'question_options.question_id',
          to: 'questions.id'
        }
      },
      responses: {
        relation: Model.HasManyRelation,
        modelClass: QuestionResponse,
        join: {
          from: 'question_options.id',
          to: 'question_responses.selected_option_id'
        }
      }
    };
  }

  static async createOption(data: Omit<QuestionOptionData, 'id'>): Promise<QuestionOption> {
    return this.query().insert(data);
  }

  static async findByQuestionId(questionId: number): Promise<QuestionOption[]> {
    return this.query().where('question_id', questionId);
  }
}

export default QuestionOption;