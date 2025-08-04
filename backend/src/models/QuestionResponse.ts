import { Model, RelationMappings } from 'objection';
import knex from '../db';
import Quiz from './Quiz';
import Question from './Question';
import QuestionOption from './QuestionOption';

Model.knex(knex);

export interface QuestionResponseData {
  id?: number;
  quiz_id: number;
  question_id?: number;
  selected_option_id?: number;
  is_correct: boolean;
  response_time: string; // interval as string
}

export class QuestionResponse extends Model {
  static get tableName() {
    return 'question_responses';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  quiz_id!: number;
  question_id?: number;
  selected_option_id?: number;
  is_correct!: boolean;
  response_time!: string;

  // Relations
  quiz?: Quiz;
  question?: Question;
  selectedOption?: QuestionOption;

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['quiz_id', 'is_correct', 'response_time'], // Updated required fields
      properties: {
        id: { type: 'integer' },
        quiz_id: { type: 'integer' },
        question_id: { type: 'integer' },
        selected_option_id: { type: 'integer' },
        is_correct: { type: 'boolean' },
        response_time: { type: 'string' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      quiz: { // Changed from completion to quiz
        relation: Model.BelongsToOneRelation,
        modelClass: Quiz,
        join: {
          from: 'question_responses.quiz_id',
          to: 'quizzes.id'
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

  static async findByQuizId(quizId: number): Promise<QuestionResponse[]> {
    return this.query().where('quiz_id', quizId);
  }
}

export default QuestionResponse;