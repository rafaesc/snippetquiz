import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('quiz_question_responses', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('quiz_id').notNullable();
    table.bigInteger('quiz_question_id').notNullable();
    table.bigInteger('quiz_question_option_id').notNullable();

    table.boolean('is_correct').notNullable();
    table.specificType('response_time', 'interval').notNullable();
    
    table.foreign('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE').onUpdate('CASCADE');
    table.foreign('quiz_question_id').references('id').inTable('quiz_questions').onDelete('CASCADE').onUpdate('CASCADE');
    table.foreign('quiz_question_option_id').references('id').inTable('quiz_question_options').onDelete('CASCADE').onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('quiz_question_responses');
}