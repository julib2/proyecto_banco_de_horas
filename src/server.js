// server.js
require('dotenv').config({ path: '../.env' });
console.log('🔍 DB_USER:', process.env.DB_USER);

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('src/public'));

// Conexión a PostgreSQL
const db = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '5432'),
});

db.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch((err) => {
    console.error('❌ Error de conexión:', err);
    process.exit(1);
  });

// Inyectar conexión en rutas
app.use('/api/auth', (req, res, next) => {
  req.db = db;
  next();
}, authRoutes);

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

console.log('🔍 Variables de entorno:');
console.log('Host:', process.env.DB_HOST);
console.log('Port:', process.env.DB_PORT);
console.log('User:', process.env.DB_USER);
console.log('Password:', typeof process.env.DB_PASSWORD, process.env.DB_PASSWORD);


module.exports = { app, db };


