import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('quiz_generation_instructions', (table) => {
    table.bigIncrements('id').primary();
    table.text('instruction').notNullable();
    table.uuid('user_id').nullable();
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('quiz_generation_instructions');
}