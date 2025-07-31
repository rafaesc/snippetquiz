import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('quizzes', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('collection_id').unsigned().notNullable();
    table.foreign('collection_id').references('id').inTable('collections').onDelete('CASCADE');
    table.timestamp('created_date').defaultTo(knex.fn.now());
    table.timestamp('updated_date').defaultTo(knex.fn.now());
    
    // Add indexes for better performance
    table.index('user_id');
    table.index('collection_id');
    table.index('created_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('quizzes');
}