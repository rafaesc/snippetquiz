import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('quizzes', (table) => {
    table.increments('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('collection_id').unsigned().notNullable().references('id').inTable('collections').onDelete('CASCADE');
    table.timestamps(true, true);

    table.index(['user_id']);
    table.index(['collection_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('quizzes');
}