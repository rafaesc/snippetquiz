import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('source', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.timestamp('created_date').defaultTo(knex.fn.now());
    table.string('link_source');
    table.string('text');
    table.string('prompt_summary');
    table.string('type');
    table.integer('collection_id').unsigned();
    table.foreign('collection_id').references('id').inTable('collections').onDelete('CASCADE');
    
    // Add indexes for better performance
    table.index('user_id');
    table.index('collection_id');
    table.index('type');
    table.index('created_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('source');
}