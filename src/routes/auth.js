const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();

// --------------------
// Register
// --------------------
router.post('/register', async (req, res) => {
  const { nombre, apellido, tipoDocumento, numeroDocumento } = req.body;

  if (!nombre || !apellido || !numeroDocumento) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    const nombreCompleto = `${nombre} ${apellido}`;
    const correoGenerado = `${nombre.toLowerCase()}.${apellido.toLowerCase()}@pascual.edu`;
    const contrasenaGenerada = numeroDocumento;

    const hashedPassword = await bcrypt.hash(contrasenaGenerada, 10);

    const query = `
      INSERT INTO "Usuario" ("Documento", "Nombre", "Correo", "Contraseña", "CantidadHoras")
      VALUES ($1, $2, $3, $4, $5)
    `;
    const values = [numeroDocumento, nombreCompleto, correoGenerado, hashedPassword, 10];

    await req.db.query(query, values);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      correo: correoGenerado,
      contraseña: contrasenaGenerada
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    if (error.code === '23505') {
      res.status(400).json({ error: 'El documento o correo ya existe' });
    } else {
      res.status(500).json({ error: 'Error interno del servidor', details: error.message });
    }
  }
});

// --------------------
// Login
// --------------------
router.post('/login', async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const correo = `${usuario}@pascual.edu`;

    const query = `
      SELECT "Documento", "Nombre", "Correo", "Contraseña"
      FROM "Usuario"
      WHERE "Correo" = $1
    `;
    const result = await req.db.query(query, [correo]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const user = result.rows[0];

    const isValidPassword = await bcrypt.compare(contrasena, user.Contraseña);
    if (!isValidPassword) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign(
      { documento: user.Documento, nombre: user.Nombre, correo: user.Correo },
      'secret_key',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        Documento: user.Documento,
        Nombre: user.Nombre,
        Correo: user.Correo
      }
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// --------------------
// Middleware para verificar token
// --------------------
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = {
      Documento: decoded.documento,
      Nombre: decoded.nombre,
      Correo: decoded.correo
    };
    next();
  });
};

// --------------------
// Obtener perfil
// --------------------
router.get('/profile', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

// --------------------
// Actualizar perfil
// --------------------
router.put('/update-profile', verifyToken, async (req, res) => {
  try {
    const { nombre, correo, password } = req.body;
    if (!nombre || !correo) return res.status(400).json({ error: 'Nombre y correo son obligatorios' });

    let query = 'UPDATE "Usuario" SET "Nombre" = $1, "Correo" = $2';
    const values = [nombre, correo];

    if (password && password.trim() !== '') {
      const hashed = await bcrypt.hash(password, 10);
      query += ', "Contraseña" = $3 WHERE "Documento" = $4';
      values.push(hashed, req.user.Documento);
    } else {
      query += ' WHERE "Documento" = $3';
      values.push(req.user.Documento);
    }

    await req.db.query(query, values);

    res.json({ message: 'Perfil actualizado correctamente' });
  } catch (error) {
    console.error('Error actualizando perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// --------------------
// Exportamos solo router
// --------------------
module.exports = router;

// Exportar middleware por separado
module.exports.verifyToken = verifyToken;
