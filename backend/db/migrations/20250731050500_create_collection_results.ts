import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('collection_results', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.integer('collection_id').unsigned().notNullable();
    table.foreign('collection_id').references('id').inTable('collections').onDelete('CASCADE');
    table.integer('total_answered').notNullable();
    table.integer('correct_answers').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Add indexes for better performance
    table.index('user_id');
    table.index('collection_id');
    table.index('created_at');
    table.index(['user_id', 'collection_id']); // Composite index for user-collection queries
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('collection_results');
}