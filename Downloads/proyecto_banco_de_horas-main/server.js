// server.js
require('dotenv').config({ path: '../.env' });

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Rutas
const authRoutes = require('./src/routes/auth');
const asesoriasRoutes = require('./src/routes/asesorias');
const mensajesRoutes = require('./src/routes/mensajes');
const transaccionesRoutes = require('./src/routes/transacciones');
const horasRoutes = require('./src/routes/horas');

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------------------
// Middlewares (solo una vez)
// -------------------------------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------------------
// Crear servidor HTTP y Socket.IO
// -------------------------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] },
  serveClient: true
});

// -------------------------------
// Conexión PostgreSQL
// -------------------------------
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
    console.error('❌ Error PostgreSQL:', err.message);
  });

app.use((req, res, next) => {
  req.db = db;
  next();
});

// -------------------------------
// Archivos estáticos
// -------------------------------
app.use(express.static(path.join(__dirname, 'src/public')));

// -------------------------------
// Rutas HTML
// -------------------------------
app.get('/', (req, res) =>
  res.sendFile(path.join(__dirname, 'src/public/views/login.html'))
);

app.get('/chat', (req, res) =>
  res.sendFile(path.join(__dirname, 'src/public/views/chat.html'))
);

// -------------------------------
// Routers API
// -------------------------------
app.use('/api/auth', authRoutes);
app.use('/api/asesorias', asesoriasRoutes);
app.use('/api/mensajes', mensajesRoutes);
app.use('/api/transacciones', transaccionesRoutes);
app.use('/api/horas', horasRoutes);

// -------------------------------
// Socket.IO
// -------------------------------
io.on('connection', (socket) => {
  console.log('Usuario conectado:', socket.id);

  socket.on('joinChat', ({ chatId }) => {
    socket.join(`chat_${chatId}`);
  });

  socket.on('sendMessage', async ({ chatId, sender, receiver, content }) => {
    try {
      const result = await db.query(
        `INSERT INTO "Mensaje" ("Fk_Usuario", "Contenido", "UsuarioReceptor", "ChatId")
         VALUES ($1, $2, $3, $4) RETURNING "Id", "FechaHora"`,
        [sender, content, receiver, chatId]
      );

      const newMessage = {
        id: result.rows[0].Id,
        sender,
        receiver,
        content,
        chatId,
        fechaHora: result.rows[0].FechaHora,
      };

      io.to(`chat_${chatId}`).emit('receiveMessage', newMessage);
    } catch (error) {
      console.error('Error guardando mensaje:', error);
      socket.emit('errorMessage', 'No se pudo guardar el mensaje');
    }
  });
});

// -------------------------------
// Iniciar servidor
// -------------------------------
server.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
 