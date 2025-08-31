const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

let connectedPlayers = 0;

// Servir los archivos estáticos de la carpeta raíz del proyecto
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  connectedPlayers++;
  console.log(`Jugador conectado. Total: ${connectedPlayers}`);

  // Si hay 2 jugadores, notificar a ambos que la partida está lista.
  if (connectedPlayers === 2) {
    io.emit('players_ready');
  }

  // Si hay más de 2, entra en modo espectador (funcionalidad futura)
  if (connectedPlayers > 2) {
    socket.emit('spectator_mode');
  }

  // Evento para cuando un jugador se desconecta
  socket.on('disconnect', () => {
    connectedPlayers--;
    console.log(`Jugador desconectado. Total: ${connectedPlayers}`);
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
