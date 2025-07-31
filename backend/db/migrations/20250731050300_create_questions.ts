import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('questions', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('quiz_id').unsigned().notNullable();
    table.foreign('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE');
    table.integer('source_id').unsigned();
    table.foreign('source_id').references('id').inTable('source').onDelete('SET NULL');
    table.string('question_text').notNullable();
    
    // Add indexes for better performance
    table.index('user_id');
    table.index('quiz_id');
    table.index('source_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('questions');
}