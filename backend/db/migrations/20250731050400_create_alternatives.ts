import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('alternatives', (table) => {
    table.increments('id').primary();
    table.integer('question_id').unsigned().notNullable();
    table.foreign('question_id').references('id').inTable('questions').onDelete('CASCADE');
    table.string('text').notNullable();
    table.boolean('correct').defaultTo(false);
    
    // Add indexes for better performance
    table.index('question_id');
    table.index('correct');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('alternatives');
}