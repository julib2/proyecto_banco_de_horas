/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('Usuario', function(table) {
      table.string('Documento', 20).primary();
      table.string('Nombre', 100).notNullable();
      table.string('Correo', 100).unique().notNullable();
      table.string('Contraseña', 100).notNullable();
      table.integer('CantidadHoras').notNullable().defaultTo(20);
    })
    .createTable('Categoria', function(table) {
      table.increments('Id').primary();
      table.string('Nombre', 100).unique().notNullable();
      table.text('Descripcion');
    })
    .createTable('Confirmacion', function(table) {
      table.increments('Id').primary();
      table.string('Fk_Usuario', 20).references('Documento').inTable('Usuario');
      table.timestamp('FechaConfirmacion').notNullable().defaultTo(knex.fn.now());
      table.boolean('Confirmado').notNullable();
    })
    .createTable('Mensaje', function(table) {
      table.increments('Id').primary();
      table.string('Fk_Usuario', 20).references('Documento').inTable('Usuario');
      table.timestamp('FechaHora').defaultTo(knex.fn.now());
      table.text('Contenido').notNullable();
    })
    .createTable('Transaccion', function(table) {
      table.increments('Id').primary();
      table.string('Fk_Usuario', 20).references('Documento').inTable('Usuario');
      table.timestamp('Fecha').notNullable().defaultTo(knex.fn.now());
      table.integer('Horas').notNullable();
    })
    .createTable('Asesoria', function(table) {
      table.increments('Id').primary();
      table.string('EstudianteDocumento', 20).references('Documento').inTable('Usuario').nullable();
      table.string('TutorDocumento', 20).notNullable().references('Documento').inTable('Usuario');
      table.integer('CategoriaId').notNullable().references('Id').inTable('Categoria');
      table.timestamp('FechaSolicitud').notNullable().defaultTo(knex.fn.now());
      table.timestamp('FechaAsesoria');
      table.integer('HorasSolicitadas').notNullable();
      table.string('Estado', 50).notNullable().defaultTo('Pendiente');
      table.string('Tema', 255);
    })
    .then(() => {
      return knex('Categoria').insert([
        { Id: 1, Nombre: 'Asignaturas', Descripcion: 'Categoría para asesorías en asignaturas académicas' },
        { Id: 2, Nombre: 'Deportes', Descripcion: 'Categoría para asesorías en deportes' },
        { Id: 3, Nombre: 'Arte', Descripcion: 'Categoría para asesorías en arte' }
      ]);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('Asesoria')
    .dropTableIfExists('Transaccion')
    .dropTableIfExists('Mensaje')
    .dropTableIfExists('Confirmacion')
    .dropTableIfExists('Categoria')
    .dropTableIfExists('Usuario');
};
