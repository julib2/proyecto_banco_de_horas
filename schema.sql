CREATE TABLE Usuario (
    Documento VARCHAR(20) PRIMARY KEY,
    Nombre VARCHAR(100) NOT NULL,
    Correo VARCHAR(100) UNIQUE NOT NULL,
    Contraseña VARCHAR(100) NOT NULL,
    CantidadHoras INT NOT NULL DEFAULT 20
);

CREATE TABLE Categoria (
    Id SERIAL PRIMARY KEY,
    Nombre VARCHAR(100) UNIQUE NOT NULL,
    Descripcion TEXT
);

CREATE TABLE Confirmacion (
    Id SERIAL PRIMARY KEY,
    Fk_Usuario VARCHAR(20) REFERENCES Usuario(Documento),
    FechaConfirmacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Confirmado BOOLEAN NOT NULL
);

CREATE TABLE Mensaje (
    Id SERIAL PRIMARY KEY,
    Fk_Usuario VARCHAR(20) REFERENCES Usuario(Documento),
    FechaHora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Contenido TEXT NOT NULL
);

CREATE TABLE Transaccion (
    Id SERIAL PRIMARY KEY,
    Fk_Usuario VARCHAR(20) REFERENCES Usuario(Documento),
    Fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    Horas INT NOT NULL
);

CREATE TABLE Asesoria (
    Id SERIAL PRIMARY KEY,
    EstudianteDocumento VARCHAR(20),
    TutorDocumento VARCHAR(20) NOT NULL,
    CategoriaId INT NOT NULL,
    FechaSolicitud TIMESTAMP NOT NULL DEFAULT NOW(),
    FechaAsesoria TIMESTAMP,
    HorasSolicitadas INT NOT NULL,
    Estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente',
    Tema VARCHAR(255),

    FOREIGN KEY (EstudianteDocumento) REFERENCES Usuario(Documento),
    FOREIGN KEY (TutorDocumento) REFERENCES Usuario(Documento),
    FOREIGN KEY (CategoriaId) REFERENCES Categoria(Id)
);

-- Insertar categorías iniciales
INSERT INTO Categoria (Id, Nombre, Descripcion) VALUES
(1, 'Asignaturas', 'Categoría para asesorías en asignaturas académicas'),
(2, 'Deportes', 'Categoría para asesorías en deportes'),
(3, 'Arte', 'Categoría para asesorías en arte');
