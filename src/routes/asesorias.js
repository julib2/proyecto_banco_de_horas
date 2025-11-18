const express = require('express');
const router = express.Router();

// Middleware para verificar token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(403).json({ error: 'No token provided' });
  }
  const jwt = require('jsonwebtoken');
  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    req.userDocumento = decoded.documento;
    next();
  });
};

// Ruta para registrar asesoría
router.post('/tutorias/registrar-asesoria', verifyToken, async (req, res) => {
  const { CategoriaId, Fecha, Hora, Estado, HorasSolicitadas, Tema, Asignatura, Deporte, Arte } = req.body;

  const TutorDocumento = req.userDocumento;
  const UsuarioDocumento = null;

  try {
    // Estado por defecto
    const EstadoFinal = Estado || "Pendiente";

    // Validar fecha
    const fechaAsesoria = new Date(`${Fecha}T${Hora}`);

    // Construir tema
    let temaFinal = Tema;
    if (Asignatura) temaFinal = `${Asignatura}: ${Tema}`;
    if (Deporte) temaFinal = `${Deporte}: ${Tema}`;
    if (Arte) temaFinal = `${Arte}: ${Tema}`;

    const query = `
      INSERT INTO asesoria (estudiantedocumento, tutordocumento, categoriaid, fechaasesoria, estado, horassolicitadas, tema)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
    `;

    const values = [
      UsuarioDocumento,
      TutorDocumento,
      CategoriaId,
      fechaAsesoria,
      EstadoFinal,
      HorasSolicitadas,
      temaFinal
    ];

    const result = await req.db.query(query, values);

    res.status(201).json({
      message: "Asesoría registrada exitosamente",
      id: result.rows[0].id   // ← CORREGIDO
    });

  } catch (error) {
    console.error("❌ ERROR COMPLETO:", error.message);
    console.error(error.stack);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

// Ruta para obtener tutorías pendientes
router.get('/tutorias/pendientes', async (req, res) => {
  try {
    const query = `
      SELECT
        a.id,
        a.estudiantedocumento,
        a.tutordocumento,
        a.categoriaid,
        c.nombre AS categorianombre,
        a.fechaasesoria,
        a.horassolicitadas,
        a.estado,
        a.tema,
        u.nombre AS estudiantenombre,
        t.nombre AS tutornombre
      FROM asesoria a
      LEFT JOIN categoria c ON c.id = a.categoriaid
      LEFT JOIN usuario u ON u.documento = a.estudiantedocumento
      LEFT JOIN usuario t ON t.documento = a.tutordocumento
      WHERE a.estado = 'Pendiente'
      ORDER BY a.fechaasesoria DESC;
    `;

    const result = await req.db.query(query);

    const mapped = result.rows.map(row => ({
      id: row.id,
      usuariodocumento: row.estudiantedocumento,
      tutordocumento: row.tutordocumento,
      categoriaid: row.categoriaid,
      categorianombre: row.categorianombre || "Sin categoría",
      fechaasesoria: row.fechaasesoria,
      horassolicitadas: row.horassolicitadas,
      estado: row.estado,
      tema: row.tema,
      estudiantenombre: row.estudiantenombre,
      tutornombre: row.tutornombre
    }));

    res.json(mapped);

  } catch (error) {
    console.error("Error al obtener tutorías pendientes:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      details: error.message
    });
  }
});

// Ruta para confirmar una tutoría
router.put('/tutorias/:id/confirmar', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'UPDATE Asesoria SET Estado = $1, EstudianteDocumento = $2 WHERE Id = $3';
    await req.db.query(query, ['Confirmada', req.userDocumento, id]);
    res.json({ message: 'Tutoría confirmada' });
  } catch (error) {
    console.error('Error al confirmar tutoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para rechazar una tutoría
router.put('/tutorias/:id/rechazar', async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'UPDATE Asesoria SET Estado = $1 WHERE Id = $2';
    await req.db.query(query, ['Rechazada', id]);
    res.json({ message: 'Tutoría rechazada' });
  } catch (error) {
    console.error('Error al rechazar tutoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener tutorías realizadas por el usuario (como tutor)
router.get('/tutorias/mis-tutorias', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT
        a.id,
        a.estudiantedocumento,
        u.nombre AS estudiantenombre,
        a.categoriaid,
        c.nombre AS categorianombre,
        a.fechaasesoria,
        a.horassolicitadas,
        a.estado,
        a.tema
      FROM asesoria a
      LEFT JOIN categoria c ON c.id = a.categoriaid
      LEFT JOIN usuario u ON u.documento = a.estudiantedocumento
      WHERE a.tutordocumento = $1
      ORDER BY a.fechaasesoria DESC;
    `;

    const result = await req.db.query(query, [req.userDocumento]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener mis tutorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Ruta para obtener tutorías tomadas por el usuario (como estudiante)
router.get('/tutorias/tutorias-tomadas', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT
        a.id,
        a.tutordocumento,
        u.nombre AS tutorNombre,
        a.categoriaid,
        c.nombre AS categorianombre,
        a.fechaasesoria,
        a.horassolicitadas,
        a.estado,
        a.tema
      FROM asesoria a
      LEFT JOIN categoria c ON c.id = a.categoriaid
      LEFT JOIN usuario u ON u.documento = a.tutordocumento
      WHERE a.estudiantedocumento = $1
      ORDER BY a.fechaasesoria DESC;
    `;

    const result = await req.db.query(query, [req.userDocumento]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener tutorías tomadas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
