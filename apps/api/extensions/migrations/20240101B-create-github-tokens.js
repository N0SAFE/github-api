export default {
  async up(knex) {
    await knex.schema.createTable('github_tokens', (table) => {
      table.uuid('id').primary();
      table.uuid('user_id').notNullable();
      table.text('access_token').notNullable();
      table.text('refresh_token');
      table.timestamp('expires_at');
      table.text('token_type');
      table.text('scope');
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at').defaultTo(knex.fn.now());
      
      table.foreign('user_id').references('id').inTable('directus_users');
    });
  },

  async down(knex) {
    await knex.schema.dropTable('github_tokens');
  }
};