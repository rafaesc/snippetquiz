import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('questions', (table) => {
    table.bigIncrements('id').primary();
    table.text('content').notNullable();
    table.bigInteger('source_content_id').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.foreign('source_content_id').references('id').inTable('content_entries').onDelete('CASCADE').onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('questions');
}