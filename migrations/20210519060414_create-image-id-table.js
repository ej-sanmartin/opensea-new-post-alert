
exports.up = function(knex) {
    return knex.schema.createTable('images', table => {
        table.increments();
        table.text('open_sea_id').notNullable();
        table.timestamps(true, true);
    });
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists('images');
};
