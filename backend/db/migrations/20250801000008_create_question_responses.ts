import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('question_responses', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('quiz_id').notNullable();
    table.bigInteger('question_id').nullable();
    table.bigInteger('selected_option_id').nullable();
    table.boolean('is_correct').notNullable();
    table.specificType('response_time', 'interval').notNullable();
    
    table.foreign('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE').onUpdate('CASCADE');
    table.foreign('question_id').references('id').inTable('questions').onDelete('SET NULL').onUpdate('CASCADE');
    table.foreign('selected_option_id').references('id').inTable('question_options').onDelete('SET NULL').onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('question_responses');
}