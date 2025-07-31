import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('questions', (table) => {
    table.increments('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('quiz_id').unsigned().notNullable().references('id').inTable('quizzes').onDelete('CASCADE');
    table.integer('source_id').unsigned().nullable().references('id').inTable('source').onDelete('SET NULL');
    table.text('question_text').notNullable();
    table.timestamp('created_date').defaultTo(knex.fn.now());
    table.timestamp('updated_date').defaultTo(knex.fn.now());

    table.index(['user_id']);
    table.index(['quiz_id']);
    table.index(['source_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('questions');
}