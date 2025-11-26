// src/routes/mensajes.js
const express = require('express');
const router = express.Router();

// Middleware de token si quieres proteger las rutas
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

// Crear mensaje
router.post('/mensaje', verifyToken, async (req, res) => {
  const { Contenido } = req.body;
  if (!Contenido) return res.status(400).json({ error: 'Contenido requerido' });

  try {
    const query = `
      INSERT INTO "Mensaje" ("Fk_Usuario", "Contenido")
      VALUES ($1, $2)
      RETURNING "Id"
    `;
    const values = [req.userDocumento, Contenido];
    const result = await req.db.query(query, values);

    res.status(201).json({ message: 'Mensaje enviado', id: result.rows[0].Id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Obtener mensajes (todos o de un chat específico)
router.get('/mensajes', verifyToken, async (req, res) => {
  const chatId = req.query.chatId;
  try {
    let result;
    if (chatId) {
      result = await req.db.query(
        'SELECT * FROM "Mensaje" WHERE "ChatId" = $1 ORDER BY "FechaHora" ASC',
        [chatId]
      );
    } else {
      result = await req.db.query(
        'SELECT * FROM "Mensaje" ORDER BY "FechaHora" DESC'
      );
    }
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
