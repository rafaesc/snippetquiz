import { Model, RelationMappings } from 'objection';
import knex from '../db';
import Quiz from './Quiz';
import ContentEntry from './ContentEntry';
import QuizQuestionOption from './QuizQuestionOption';
import QuizQuestionResponse from './QuizQuestionResponse';
import { QuestionType } from './Question';


Model.knex(knex);

export interface QuizQuestionData {
  id?: number;
  question: string;
  type: QuestionType;
  content_entry_type: string;
  content_entry_source_url?: string;
  content_entry_id?: number;
  quiz_id: number;
}

export class QuizQuestion extends Model {
  static get tableName() {
    return 'quiz_questions';
  }

  static get idColumn() {
    return 'id';
  }

  id!: number;
  question!: string;
  type!: QuestionType;
  content_entry_type!: string;
  content_entry_source_url?: string;
  content_entry_id?: number;
  quiz_id!: number;

  // Relations
  quiz?: Quiz;
  contentEntry?: ContentEntry;
  options?: QuizQuestionOption[];
  responses?: QuizQuestionResponse[];

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['question', 'type', 'content_entry_type', 'quiz_id'],
      properties: {
        id: { type: 'integer' },
        question: { type: 'string', minLength: 1 },
        type: { type: 'string', enum: ['multiple_choice', 'single_answer', 'true_false'] },
        content_entry_type: { type: 'string', minLength: 1 },
        content_entry_source_url: { type: 'string' },
        content_entry_id: { type: 'integer' },
        quiz_id: { type: 'integer' }
      }
    };
  }

  static get relationMappings(): RelationMappings {
    return {
      quiz: {
        relation: Model.BelongsToOneRelation,
        modelClass: Quiz,
        join: {
          from: 'quiz_questions.quiz_id',
          to: 'quizzes.id'
        }
      },
      contentEntry: {
        relation: Model.BelongsToOneRelation,
        modelClass: ContentEntry,
        join: {
          from: 'quiz_questions.content_entry_id',
          to: 'content_entries.id'
        }
      },
      options: {
        relation: Model.HasManyRelation,
        modelClass: QuizQuestionOption,
        join: {
          from: 'quiz_questions.id',
          to: 'quiz_question_options.quiz_question_id'
        }
      },
      responses: {
        relation: Model.HasManyRelation,
        modelClass: QuizQuestionResponse,
        join: {
          from: 'quiz_questions.id',
          to: 'quiz_question_responses.quiz_question_id'
        }
      }
    };
  }

  static async createQuizQuestion(data: Omit<QuizQuestionData, 'id'>): Promise<QuizQuestion> {
    return await QuizQuestion.query().insert(data);
  }
}

export default QuizQuestion;