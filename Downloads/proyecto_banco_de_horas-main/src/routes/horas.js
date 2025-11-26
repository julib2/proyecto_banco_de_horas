const express = require('express');
const router = express.Router();
const knex = require('../db/knex'); // db sigue en src/db
const { verifyToken } = require('./auth'); // ahora correcto

router.get('/historial', verifyToken, async (req, res) => {
    const usuarioDocumento = req.user.Documento;

    try {
        const transacciones = await knex('Transaccion')
            .where('UsuarioEmisor', usuarioDocumento)
            .orWhere('UsuarioReceptor', usuarioDocumento)
            .orderBy('Fecha', 'desc');

        res.json(transacciones);
    } catch (error) {
        console.error('Error al obtener historial de horas:', error);
        res.status(500).json({ error: 'Error al obtener historial de horas' });
    }
});

module.exports = router;
