import Knex from 'knex';

//Novas ações de alteração no banco
export async function up(knex: Knex){
    return knex.schema.createTable('items', table => {
        table.increments('id').primary();
        table.string('image').notNullable();
        table.string('title').notNullable();
    })
}

//Rollback
export async function down(knex: Knex){
    return knex.schema.dropTable('items')
}