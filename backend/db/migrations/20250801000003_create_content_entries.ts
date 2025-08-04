import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('content_entries', (table) => {
    table.bigIncrements('id').primary();
    table.text('content_type').notNullable();
    table.text('content').nullable();
    table.text('source_url').nullable();
    table.text('bucket_object_url').nullable();
    table.text('page_title').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.text('prompt_summary').nullable();
    
    table.check('content_type in (\'selected_text\', \'full_html\')', [], 'content_entries_content_type_check');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('content_entries');
}