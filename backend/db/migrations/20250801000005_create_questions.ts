import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('questions', (table) => {
    table.bigIncrements('id').primary();
    table.text('question').notNullable();
    table.string('type').notNullable(); // New type column
    table.bigInteger('content_entry_id').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.foreign('content_entry_id').references('id').inTable('content_entries').onDelete('CASCADE').onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('questions');
}