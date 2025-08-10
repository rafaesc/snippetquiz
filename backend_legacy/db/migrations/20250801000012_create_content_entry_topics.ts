import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('content_entry_topics', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('content_entry_id').notNullable();
    table.bigInteger('topic_id').notNullable();
    
    table.foreign('content_entry_id').references('id').inTable('content_entries').onDelete('CASCADE').onUpdate('CASCADE');
    table.foreign('topic_id').references('id').inTable('topics').onDelete('CASCADE').onUpdate('CASCADE');
    table.unique(['content_entry_id', 'topic_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('content_entry_topics');
}
