import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('quiz_content_entries', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('quiz_id').notNullable();
    table.bigInteger('content_entry_id').notNullable();
    
    table.foreign('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE').onUpdate('CASCADE');
    table.foreign('content_entry_id').references('id').inTable('content_entries').onDelete('CASCADE').onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('quiz_content_entries');
}