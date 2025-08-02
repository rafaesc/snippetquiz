import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('question_responses', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('completion_id').notNullable();
    table.bigInteger('question_id').notNullable();
    table.boolean('is_correct').notNullable();
    table.specificType('response_time', 'interval').notNullable();
    table.bigInteger('selected_option_id').nullable();
    
    table.foreign('completion_id').references('id').inTable('quiz_completions').onDelete('CASCADE').onUpdate('CASCADE');
    table.foreign('question_id').references('id').inTable('questions').onDelete('CASCADE').onUpdate('CASCADE');
    table.foreign('selected_option_id').references('id').inTable('question_options').onDelete('SET NULL').onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('question_responses');
}