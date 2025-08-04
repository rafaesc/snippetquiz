import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('question_options', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('question_id').notNullable();
    table.text('option_text').notNullable();
    table.text('option_explanation').notNullable();
    table.boolean('is_correct').notNullable().defaultTo(false);
    
    table.foreign('question_id').references('id').inTable('questions').onDelete('CASCADE').onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('question_options');
}