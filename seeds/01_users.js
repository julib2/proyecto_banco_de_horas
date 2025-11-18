exports.seed = function(knex) {
  // Deletes ALL existing entries
  return knex('Usuario').del()
    .then(function () {
      // Inserts seed entries
      return knex('Usuario').insert([
        {
          Documento: '1025649206',
          Nombre: 'Katheryn Suarez',
          Correo: 'katheryn.suarez@pascual.edu',
          Contraseña: '$2a$10$TZAOdUnQS0jY12x4Fm/Wn.teZ1vItE7upWD/ImNQ/.BsRkzELEUvS',
          CantidadHoras: 20
        },
        {
          Documento: '123456789',
          Nombre: 'Juan Perez',
          Correo: 'juan perez.juan@pascual.edu',
          Contraseña: '$2a$10$ajPUIgbuCHQa.L/ePvKcZ.rn9hGI88fToovHgCzr.NiMQviN/BF/K',
          CantidadHoras: 20
        },
        {
          Documento: '23242526',
          Nombre: 'paulina castaño',
          Correo: 'paulina.castaño@pascual.edu',
          Contraseña: '$2a$10$f2KDDH/XW4TBnrmtw0wafeO3V05m38rB160IYTcx9we0tDj.kvJ3G',
          CantidadHoras: 20
        },
        {
          Documento: '987654321',
          Nombre: 'Ana Gomez',
          Correo: 'ana.gomez@pascual.edu',
          Contraseña: '$2a$10$2tByw95nSGFb1MsTPAYxEe0fxgEr864ZLGozP5SZMFYu6Y5TZbVoy',
          CantidadHoras: 20
        },
        {
          Documento: '999999999',
          Nombre: 'Nuevo Usuario',
          Correo: 'nuevo.usuario@pascual.edu',
          Contraseña: '$2a$10$hWtVp/u5RhgMeyhjWfhS8.lrf5/JM.XB2BBa5wKu0lC8A.jctR6kq',
          CantidadHoras: 20
        }
      ]);
    });
};
