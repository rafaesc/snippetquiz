import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('collection_results', (table) => {
    table.increments('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('collection_id').unsigned().notNullable().references('id').inTable('collections').onDelete('CASCADE');
    table.integer('total_answered').notNullable().defaultTo(0);
    table.integer('correct_answers').notNullable().defaultTo(0);
    table.timestamp('created_at').defaultTo(knex.fn.now());

    table.index(['user_id']);
    table.index(['collection_id']);
    table.index(['user_id', 'collection_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('collection_results');
}