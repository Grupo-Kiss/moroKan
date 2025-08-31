const express = require('express');
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

let host = null;

// Servir los archivos estáticos de la carpeta raíz del proyecto
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
  console.log(`Jugador conectado: ${socket.id}`);

  // Si ya hay un host, este nuevo jugador es el invitado.
  if (host) {
    const guestColor = host.color === 'negro' ? 'blanco' : 'negro';
    console.log(`Es un invitado. Se le asigna el color ${guestColor}`);
    socket.emit('welcome_guest', { hostName: host.name, assignedColor: guestColor });
  }

  // Evento para que el HOST se registre
  socket.on('register_host', (data) => {
    host = { id: socket.id, name: data.name, color: data.color };
    console.log(`Host registrado: ${host.name} con color ${host.color}`);
    socket.emit('host_registered');
  });

  // Evento para que el GUEST se registre
  socket.on('register_guest', (data) => {
    if (!host) return; // No debería pasar si el flujo es correcto

    const guest = { id: socket.id, name: data.name, color: data.assignedColor };
    console.log(`Invitado se une: ${guest.name}`);

    // Ambos jugadores están listos, empezamos el juego
    io.to(host.id).emit('game_start', { yourColor: host.color, opponentName: guest.name });
    io.to(guest.id).emit('game_start', { yourColor: guest.color, opponentName: host.name });
  });

  // Evento para cuando un jugador se desconecta
  socket.on('disconnect', () => {
    console.log(`Jugador desconectado: ${socket.id}`);
    if (host && host.id === socket.id) {
        host = null; // El host se ha ido, el lobby se reinicia
        console.log("El Host se ha desconectado. Reiniciando lobby.");
        socket.broadcast.emit('host_disconnected');
    }
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
