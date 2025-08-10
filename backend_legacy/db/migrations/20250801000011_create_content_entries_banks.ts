import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('content_entries_bank', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('content_entry_id').notNullable();
    table.bigInteger('content_bank_id').notNullable();
    
    table.foreign('content_entry_id').references('id').inTable('content_entries').onDelete('CASCADE').onUpdate('CASCADE');
    table.foreign('content_bank_id').references('id').inTable('content_banks').onDelete('CASCADE').onUpdate('CASCADE');
    table.unique(['content_entry_id', 'content_bank_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('content_entries_bank');
}
