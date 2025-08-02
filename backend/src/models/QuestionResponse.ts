import { Model, RelationMappings } from 'objection';
import knex from '../db';
import QuizCompletion from './QuizCompletion';
import Question from './Question';
import QuestionOption from './QuestionOption';

Model.knex(knex);

export interface QuestionResponseData {
  id?: number;
  completion_id: number;
  question_id: number;
  is_correct: boolean;
  response_time: string; // interval as string
  selected_option_id?: number;
}

export class QuestionResponse extends Model {
  static get tableName() {
    return 'question_responses';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  completion_id!: number;
  question_id!: number;
  is_correct!: boolean;
  response_time!: string;
  selected_option_id?: number;

  // Relations
  completion?: QuizCompletion;
  question?: Question;
  selectedOption?: QuestionOption;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['completion_id', 'question_id', 'is_correct', 'response_time'],
      properties: {
        id: { type: 'integer' },
        completion_id: { type: 'integer' },
        question_id: { type: 'integer' },
        is_correct: { type: 'boolean' },
        response_time: { type: 'string' },
        selected_option_id: { type: 'integer' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      completion: {
        relation: Model.BelongsToOneRelation,
        modelClass: QuizCompletion,
        join: {
          from: 'question_responses.completion_id',
          to: 'quiz_completions.id'
        }
      },
      question: {
        relation: Model.BelongsToOneRelation,
        modelClass: Question,
        join: {
          from: 'question_responses.question_id',
          to: 'questions.id'
        }
      },
      selectedOption: {
        relation: Model.BelongsToOneRelation,
        modelClass: QuestionOption,
        join: {
          from: 'question_responses.selected_option_id',
          to: 'question_options.id'
        }
      }
    };
  }

  static async createResponse(data: Omit<QuestionResponseData, 'id'>): Promise<QuestionResponse> {
    return this.query().insert(data);
  }

  static async findByCompletionId(completionId: number): Promise<QuestionResponse[]> {
    return this.query().where('completion_id', completionId);
  }
}

export default QuestionResponse;