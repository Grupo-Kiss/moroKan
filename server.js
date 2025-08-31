const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Servir los archivos estáticos de la carpeta 'game'
app.use(express.static('game'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/game/index.html');
});

io.on('connection', (socket) => {
  console.log('Un jugador se ha conectado:', socket.id);

  // Evento para cuando un jugador se desconecta
  socket.on('disconnect', () => {
    console.log('Un jugador se ha desconectado:', socket.id);
    // Notificar al otro jugador que su oponente se ha ido
    socket.broadcast.emit('oponente_desconectado');
  });

  // Evento para retransmitir un movimiento al otro jugador
  socket.on('movimiento', (data) => {
    console.log('Movimiento recibido:', data);
    // Enviamos el movimiento al otro jugador conectado
    socket.broadcast.emit('movimiento', data);
  });

  // Puedes añadir más eventos de juego aquí
  // Por ejemplo: 'inicio_partida', 'chat_mensaje', etc.
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
