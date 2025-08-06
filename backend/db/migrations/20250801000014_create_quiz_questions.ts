import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('quiz_questions', (table) => {
    table.bigIncrements('id').primary();
    table.text('question').notNullable();
    table.text('content_entry_type').notNullable();
    table.text('content_entry_source_url').nullable();
    table.bigInteger('content_entry_id').nullable();
    table.bigInteger('quiz_id').notNullable();
    
    table.foreign('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE').onUpdate('CASCADE');
    table.foreign('content_entry_id').references('id').inTable('content_entries').onDelete('SET NULL').onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('quiz_questions');
}