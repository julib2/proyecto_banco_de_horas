const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// ----------------------
// Middleware: Verificar token
// ----------------------
const verifyToken = (req, res, next) => {
  let token = req.headers['authorization'];
  if (!token) return res.status(403).json({ error: 'No token provided' });

  if (token.startsWith('Bearer ')) token = token.slice(7);

  jwt.verify(token, 'secret_key', (err, decoded) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.userDocumento = decoded.documento;
    next();
  });
};

// ----------------------
// Registrar asesoría
// ----------------------
router.post('/tutorias/registrar-asesoria', verifyToken, async (req, res) => {
  try {
    console.log("REQ.DB = ", req.db);
    const {
      CategoriaId,
      Fecha,
      Hora,
      Estado,
      HorasSolicitadas,
      Tema,
      Asignatura,
      Deporte,
      Arte,
      UsuarioDocumento: EstudianteDocumento
    } = req.body;

    if (!EstudianteDocumento || !CategoriaId || !Fecha || !Hora || !Tema || !HorasSolicitadas) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    // Validar formato de Fecha y Hora
    if (!Fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return res.status(400).json({ error: 'Fecha debe estar en formato YYYY-MM-DD' });
    }
    if (!Hora.match(/^\d{2}:\d{2}$/)) {
      return res.status(400).json({ error: 'Hora debe estar en formato HH:MM' });
    }

    // Validar HorasSolicitadas
    const horas = parseInt(HorasSolicitadas, 10);
    if (!Number.isInteger(horas) || horas <= 0) {
      return res.status(400).json({ error: 'HorasSolicitadas debe ser un número entero positivo' });
    }

    console.log('Validando EstudianteDocumento:', EstudianteDocumento);
    // Validar que el EstudianteDocumento exista en la tabla Usuario
    const validationQuery = 'SELECT 1 FROM "Usuario" WHERE "Documento" = $1';
    const validationResult = await req.db.query(validationQuery, [EstudianteDocumento]);
    console.log('Resultado validación EstudianteDocumento:', validationResult.rowCount);
    if (validationResult.rowCount === 0) {
      return res.status(400).json({ error: 'El EstudianteDocumento proporcionado no existe' });
    }

    console.log('Validando CategoriaId:', CategoriaId);
    // Validar que CategoriaId exista
    const catQuery = 'SELECT 1 FROM "Categoria" WHERE "Id" = $1';
    const catResult = await req.db.query(catQuery, [CategoriaId]);
    console.log('Resultado validación CategoriaId:', catResult.rowCount);
    if (catResult.rowCount === 0) {
      return res.status(400).json({ error: 'CategoriaId no existe' });
    }

    const TutorDocumento = req.userDocumento;
    const EstadoFinal = Estado || "Pendiente";
    const fechaAsesoria = new Date(`${Fecha}T${Hora}`);
    console.log('Fecha:', Fecha, 'Hora:', Hora, 'fechaAsesoria:', fechaAsesoria);
    if (isNaN(fechaAsesoria.getTime())) {
      return res.status(400).json({ error: 'Fecha u hora inválida' });
    }

    let temaFinal = Tema;
    if (Asignatura) temaFinal = `${Asignatura}: ${Tema}`;
    if (Deporte) temaFinal = `${Deporte}: ${Tema}`;
    if (Arte) temaFinal = `${Arte}: ${Tema}`;

    console.log('Inserting values:', [EstudianteDocumento, TutorDocumento, CategoriaId, fechaAsesoria, EstadoFinal, horas, temaFinal]);

    const query = `
      INSERT INTO "Asesoria" ("EstudianteDocumento", "TutorDocumento", "CategoriaId", "FechaAsesoria", "Estado", "HorasSolicitadas", "Tema")
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING "Id"
    `;
    const values = [EstudianteDocumento, TutorDocumento, CategoriaId, fechaAsesoria, EstadoFinal, horas, temaFinal];

    const result = await req.db.query(query, values);

    res.status(201).json({
      message: "Asesoría registrada exitosamente",
      id: result.rows[0].Id
    });

  } catch (error) {
    console.error("❌ ERROR COMPLETO:", error.message);
    console.error(error.stack);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

// ----------------------
// Tutorías pendientes
// ----------------------
router.get('/tutorias/pendientes', async (req, res) => {
  try {
    const query = `
      SELECT
        a."Id",
        a."EstudianteDocumento",
        a."TutorDocumento",
        a."CategoriaId",
        c."Nombre" AS "CategoriaNombre",
        a."FechaAsesoria",
        a."HorasSolicitadas",
        a."Estado",
        a."Tema",
        u."Nombre" AS "EstudianteNombre",
        t."Nombre" AS "TutorNombre"
      FROM "Asesoria" a
      LEFT JOIN "Categoria" c ON c."Id" = a."CategoriaId"
      LEFT JOIN "Usuario" u ON u."Documento" = a."EstudianteDocumento"
      LEFT JOIN "Usuario" t ON t."Documento" = a."TutorDocumento"
      ORDER BY a."FechaAsesoria" DESC;
    `;

    const result = await req.db.query(query);

    const mapped = result.rows.map(row => ({
      id: row.Id,
      usuariodocumento: row.EstudianteDocumento,
      tutordocumento: row.TutorDocumento,
      categoriaid: row.CategoriaId,
      categorianombre: row.CategoriaNombre || "Sin categoría",
      fechaasesoria: row.FechaAsesoria,
      horassolicitadas: row.HorasSolicitadas,
      estado: row.Estado,
      tema: row.Tema,
      estudiantenombre: row.EstudianteNombre || null,
      tutornombre: row.TutorNombre || null
    }));

    res.json(mapped);

  } catch (error) {
    console.error("Error al obtener tutorías pendientes:", error);
    res.status(500).json({ error: "Error interno del servidor", details: error.message });
  }
});

// ----------------------
// Confirmar tutoría
// ----------------------
router.put('/tutorias/:id/confirmar', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'UPDATE "Asesoria" SET "Estado" = $1, "EstudianteDocumento" = $2 WHERE "Id" = $3';
    await req.db.query(query, ['Confirmada', req.userDocumento, id]);
    res.json({ message: 'Tutoría confirmada' });
  } catch (error) {
    console.error('Error al confirmar tutoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ----------------------
// Rechazar tutoría
// ----------------------
router.put('/tutorias/:id/rechazar', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const query = 'UPDATE "Asesoria" SET "Estado" = $1 WHERE "Id" = $2';
    await req.db.query(query, ['Rechazada', id]);
    res.json({ message: 'Tutoría rechazada' });
  } catch (error) {
    console.error('Error al rechazar tutoría:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ----------------------
// Mis tutorías (como tutor)
// ----------------------
router.get('/tutorias/mis-tutorias', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT
        a."Id",
        a."EstudianteDocumento",
        u."Nombre" AS "EstudianteNombre",
        a."CategoriaId",
        c."Nombre" AS "CategoriaNombre",
        a."FechaAsesoria",
        a."HorasSolicitadas",
        a."Estado",
        a."Tema"
      FROM "Asesoria" a
      LEFT JOIN "Categoria" c ON c."Id" = a."CategoriaId"
      LEFT JOIN "Usuario" u ON u."Documento" = a."EstudianteDocumento"
      WHERE a."TutorDocumento" = $1
      ORDER BY a."FechaAsesoria" DESC;
    `;
    const result = await req.db.query(query, [req.userDocumento]);

    const mapped = result.rows.map(row => ({
      id: row.Id,
      estudiantenombre: row.EstudianteNombre || null,
      categoriaid: row.CategoriaId,
      categorianombre: row.CategoriaNombre || 'Sin categoría',
      fechaasesoria: row.FechaAsesoria,
      horassolicitadas: row.HorasSolicitadas,
      estado: row.Estado,
      tema: row.Tema
    }));

    res.json(mapped);
  } catch (error) {
    console.error('Error al obtener mis tutorías:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ----------------------
// Tutorías tomadas (como estudiante)
// ----------------------
router.get('/tutorias/tutorias-tomadas', verifyToken, async (req, res) => {
  try {
    const query = `
      SELECT
        a."Id",
        a."TutorDocumento",
        u."Nombre" AS "TutorNombre",
        a."CategoriaId",
        c."Nombre" AS "CategoriaNombre",
        a."FechaAsesoria",
        a."HorasSolicitadas",
        a."Estado",
        a."Tema"
      FROM "Asesoria" a
      LEFT JOIN "Categoria" c ON c."Id" = a."CategoriaId"
      LEFT JOIN "Usuario" u ON u."Documento" = a."TutorDocumento"
      WHERE a."EstudianteDocumento" = $1
      ORDER BY a."FechaAsesoria" DESC;
    `;
    const result = await req.db.query(query, [req.userDocumento]);

    const mapped = result.rows.map(row => ({
      id: row.Id,
      tutornombre: row.TutorNombre || null,
      categoriaid: row.CategoriaId,
      categorianombre: row.CategoriaNombre || 'Sin categoría',
      fechaasesoria: row.FechaAsesoria,
      horassolicitadas: row.HorasSolicitadas,
      estado: row.Estado,
      tema: row.Tema
    }));

    res.json(mapped);
  } catch (error) {
    console.error('Error al obtener tutorías tomadas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;

