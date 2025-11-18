exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('Asesoria').del()
    .then(function () {
      // Inserts seed entries
      return knex('Asesoria').insert([
        {
          Id: 1,
          EstudianteDocumento: '1025649206',
          TutorDocumento: '123456789',
          CategoriaId: 1,
          FechaSolicitud: knex.fn.now(),
          FechaAsesoria: '2025-11-20 10:00:00',
          HorasSolicitadas: 2,
          Estado: 'Pendiente',
          Tema: 'Matemáticas Básicas'
        },
        {
          Id: 2,
          EstudianteDocumento: '23242526',
          TutorDocumento: '987654321',
          CategoriaId: 2,
          FechaSolicitud: knex.fn.now(),
          FechaAsesoria: '2025-11-21 14:00:00',
          HorasSolicitadas: 1,
          Estado: 'Confirmada',
          Tema: 'Fútbol'
        },
        {
          Id: 3,
          EstudianteDocumento: '999999999',
          TutorDocumento: '123456789',
          CategoriaId: 3,
          FechaSolicitud: knex.fn.now(),
          FechaAsesoria: '2025-11-22 16:00:00',
          HorasSolicitadas: 3,
          Estado: 'Completada',
          Tema: 'Pintura'
        }
      ]);
    });
};
