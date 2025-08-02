import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('ai_topics', (table) => {
    table.bigIncrements('id').primary();
    table.uuid('user_id').notNullable();
    table.text('topic').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    table.foreign('user_id').references('id').inTable('users').onDelete('SET NULL').onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('ai_topics');
}