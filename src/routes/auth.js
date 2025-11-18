const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { nombre, apellido, tipoDocumento, numeroDocumento } = req.body;

  console.log('Body recibido:', req.body);
  console.log('nombre:', nombre, 'tipo:', typeof nombre);
  console.log('apellido:', apellido, 'tipo:', typeof apellido);

  if (!nombre || !apellido || !numeroDocumento) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    // Generar correo y contraseña
    const nombreCompleto = `${nombre} ${apellido}`;
    const correoGenerado = `${nombre.toLowerCase()}.${apellido.toLowerCase()}@pascual.edu`;
    const contrasenaGenerada = numeroDocumento;

    console.log('Datos procesados:', { nombre, apellido, tipoDocumento, numeroDocumento });
    console.log('Correo generado:', correoGenerado);
    console.log('Contraseña generada:', contrasenaGenerada);

    // Insertar en la tabla Usuario (contraseña en texto plano)
    const query = 'INSERT INTO usuario (documento, nombre, correo, contraseña, cantidadhoras) VALUES ($1, $2, $3, $4, $5)';
    const values = [numeroDocumento, nombreCompleto, correoGenerado, contrasenaGenerada, 20];

    await req.db.query(query, values);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      correo: correoGenerado,
      contraseña: contrasenaGenerada
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    if (error.code === '23505') { // Violación de unicidad
      res.status(400).json({ error: 'El documento o correo ya existe' });
    } else {
      res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
  }
});

// Login
router.post('/login', async (req, res) => {
  const { usuario, contrasena, rol } = req.body;

  try {
    // Construir el correo completo
    const correo = `${usuario}@pascual.edu`;

    // Buscar usuario por correo
    const query = 'SELECT documento, nombre, correo, contraseña FROM usuario WHERE correo = $1';
    const result = await req.db.query(query, [correo]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];
    const isValidPassword = contrasena === user.contraseña;

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      { documento: user.documento, nombre: user.nombre, correo: user.correo },
      'secret_key',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        documento: user.documento,
        nombre: user.nombre,
        correo: user.correo
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userDocumento = decoded.documento;
    req.userNombre = decoded.nombre;
    req.userCorreo = decoded.correo;
    next();
  });
};

// Protected route example
router.get('/profile', verifyToken, (req, res) => {
  res.json({
    user: {
      documento: req.userDocumento,
      nombre: req.userNombre,
      correo: req.userCorreo
    }
  });
});

module.exports = router;
