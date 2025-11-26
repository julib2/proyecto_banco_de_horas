// src/routes/transacciones.js
console.log("🔥 Cargando rutas de transacciones...");

const express = require('express');
const router = express.Router();

// Middleware de token
const jwt = require('jsonwebtoken');
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userDocumento = decoded.documento;
    next();
  });
};

// Crear una transacción de horas
router.post('/transferir', verifyToken, async (req, res) => {
  const { UsuarioReceptor, Horas, Tipo, AsesoriaId } = req.body;

  if (!UsuarioReceptor || !Horas || !Tipo) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    // Obtener horas actuales del emisor
    const userQuery = 'SELECT "CantidadHoras" FROM "Usuario" WHERE "Documento" = $1';
    const userResult = await req.db.query(userQuery, [req.userDocumento]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario emisor no encontrado' });
    }

    const horasDisponibles = userResult.rows[0].CantidadHoras;
    if (horasDisponibles < Horas) {
      return res.status(400).json({ error: 'No tienes suficientes horas' });
    }

    // Restar horas al emisor
    await req.db.query(
      'UPDATE "Usuario" SET "CantidadHoras" = "CantidadHoras" - $1 WHERE "Documento" = $2',
      [Horas, req.userDocumento]
    );

    // Sumar horas al receptor
    await req.db.query(
      'UPDATE "Usuario" SET "CantidadHoras" = "CantidadHoras" + $1 WHERE "Documento" = $2',
      [Horas, UsuarioReceptor]
    );

    // Registrar la transacción
    const insertQuery = `
      INSERT INTO "Transaccion" ("UsuarioEmisor", "UsuarioReceptor", "Horas", "Tipo", "AsesoriaId")
      VALUES ($1, $2, $3, $4, $5)
      RETURNING "Id", "Fecha"
    `;
    const insertValues = [req.userDocumento, UsuarioReceptor, Horas, Tipo, AsesoriaId || null];
    const result = await req.db.query(insertQuery, insertValues);

    res.status(201).json({
      message: 'Transacción completada',
      id: result.rows[0].Id,
      fecha: result.rows[0].Fecha
    });

  } catch (error) {
    console.error('Error al transferir horas:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Obtener todas las transacciones del usuario
router.get('/mis-transacciones', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT * FROM "Transaccion"
      WHERE "UsuarioEmisor" = $1 OR "UsuarioReceptor" = $1
      ORDER BY "Fecha" DESC
    `;
    const result = await req.db.query(query, [req.userDocumento]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener transacciones:', error);
    res.status(500).json({ error: 'Error interno del servidor', details: error.message });
  }
});

// Obtener total de horas del usuario autenticado
router.get('/horas/total', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT COALESCE("CantidadHoras", 0) AS totalhoras
      FROM "Usuario"
      WHERE "Documento" = $1
    `;

    const result = await req.db.query(query, [req.userDocumento]);

    res.json({ totalHoras: result.rows[0].totalhoras });
  } catch (error) {
    console.error('Error al obtener total de horas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
