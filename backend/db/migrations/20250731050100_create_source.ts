import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('source', (table) => {
    table.increments('id').primary();
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('created_date').defaultTo(knex.fn.now());
    table.string('link_source');
    table.text('text');
    table.text('prompt_summary');
    table.string('type').notNullable();
    table.integer('collection_id').unsigned().references('id').inTable('collections').onDelete('CASCADE');

    table.index(['user_id']);
    table.index(['collection_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('source');
}