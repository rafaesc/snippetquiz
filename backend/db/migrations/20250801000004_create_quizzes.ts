import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('quizzes', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('bank_id').nullable();
    table.string('bank_name').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.integer('content_entries_count').notNullable().defaultTo(0);
    table.integer('questions_count').notNullable().defaultTo(0);
    table.timestamp('completed_at').nullable();
    table.uuid('user_id').nullable();
    
    table.foreign('bank_id').references('id').inTable('content_banks').onDelete('SET NULL').onUpdate('CASCADE');
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE').onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('quizzes');
}