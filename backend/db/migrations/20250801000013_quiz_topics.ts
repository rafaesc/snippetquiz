import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('quiz_topics', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('quiz_id').notNullable();
    table.string('ai_topic_name').notNullable();

    table.foreign('quiz_id').references('id').inTable('quizzes').onDelete('CASCADE').onUpdate('CASCADE');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('quiz_topics');
}
