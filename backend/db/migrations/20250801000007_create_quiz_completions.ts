import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('quiz_completions', (table) => {
    table.bigIncrements('id').primary();
    table.uuid('user_id').notNullable();
    table.bigInteger('quiz_id').notNullable();
    table.timestamp('completed_at').defaultTo(knex.fn.now());
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
    table.foreign('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE').onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('quiz_completions');
}