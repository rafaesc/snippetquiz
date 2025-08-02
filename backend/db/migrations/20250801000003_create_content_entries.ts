import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('content_entries', (table) => {
    table.bigIncrements('id').primary();
    table.bigInteger('bank_id').notNullable();
    table.text('content_type').notNullable();
    table.text('content').nullable();
    table.text('source_url').nullable();
    table.text('bucket_object_url').nullable();
    table.text('page_title').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.text('prompt_summary').nullable();
    table.bigInteger('ai_topic_id').nullable();
    
    table.foreign('bank_id').references('id').inTable('content_banks').onDelete('CASCADE').onUpdate('CASCADE');
    table.foreign('ai_topic_id').references('id').inTable('ai_topics').onDelete('SET NULL').onUpdate('CASCADE');
    table.check('content_type in (\'selected_text\', \'full_html\')', [], 'content_entries_content_type_check');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('content_entries');
}