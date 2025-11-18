// server.js
require('dotenv').config({ path: '../.env' });
console.log('🔍 DB_USER:', process.env.DB_USER);

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const authRoutes = require('./src/routes/auth');
const asesoriasRoutes = require('./src/routes/asesorias');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('src/public'));

// Conexión a PostgreSQL
const db = new Pool({
  host: 'localhost',
  user: 'kathe_user',
  password: '12345',
  database: 'software-solution-db',
  port: 5432,
});

db.connect()
  .then(() => console.log('✅ Conectado a PostgreSQL'))
  .catch((err) => {
    console.error('❌ Error de conexión a PostgreSQL:', err.message);
    console.log('⚠️  El servidor continuará sin conexión a la base de datos');
  });

// Inyectar conexión en rutas
app.use('/api/auth', (req, res, next) => {
  req.db = db;
  next();
}, authRoutes);

// Rutas API para tutorías
app.use('/api', (req, res, next) => {
  req.db = db;
  next();
}, asesoriasRoutes);

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


