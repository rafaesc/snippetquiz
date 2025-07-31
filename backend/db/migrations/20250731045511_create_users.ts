import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('external_id').notNullable();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.timestamp('created_date').defaultTo(knex.fn.now());
    
    // Add indexes
    table.index('email');
    table.index('external_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}

