// game/js/online.js

// Conexión inicial al servidor. Se asume que el servidor está en el mismo host y puerto.
const socket = io();

// Referencia a la consola de estado y función para actualizarla
const statusConsole = document.getElementById('game-status-console');
function updateStatus(message, type = 'info') {
    if (statusConsole) {
        statusConsole.innerHTML = `<p class="${type}">${message}</p>`;
    }
}

// --- EMITIR EVENTOS (enviar datos al servidor) ---

/**
 * Envía un movimiento al servidor para que lo retransmita al oponente.
 * @param {object} moveData - Información del movimiento (ej: { from: 'A1', to: 'A2', piece: 'white-01' })
 */
function enviarMovimiento(moveData) {
  if (socket) {
    socket.emit('movimiento', moveData);
  }
}

// --- ESCUCHAR EVENTOS (recibir datos del servidor) ---

let myColor = null; // Variable global para guardar el color del jugador
let isGuest = false; // Nueva variable global para indicar si es invitado

// Se ejecuta cuando la conexión con el servidor es exitosa
socket.on('connect', () => {
  console.log('Conectado al servidor con ID:', socket.id);
  // La URL de ngrok se mostrará en setup.js después de que el host inicie la partida online
  updateStatus('Conectado. Esperando a un oponente...');
});

// NUEVO: El servidor nos da la bienvenida como invitado
socket.on('welcome_guest', (data) => {
    isGuest = true;
    myColor = data.assignedColor; // Asignamos el color que nos dio el servidor
    updateStatus(`¡Bienvenido! El host ${data.hostName} te ha asignado el color ${myColor}. Introduce tu nombre y únete.`, 'info');

    // Llamar a una función en setup.js para reconfigurar el modal
    if (typeof configureSetupModalForGuest === 'function') {
        configureSetupModalForGuest(data.assignedColor, data.hostName);
    }
});

// El servidor nos informa que un oponente se ha conectado y la partida está lista
socket.on('game_start', (data) => {
    myColor = data.yourColor;
    updateStatus(`¡Partida iniciada! Juegas con ${myColor}. Tu oponente es ${data.opponentName}.`, 'success');
    
    // Ocultar el modal de configuración
    const setupOverlay = document.getElementById('setup-overlay');
    if(setupOverlay) setupOverlay.style.display = 'none';

    // Actualizar títulos
    const player1Title = document.querySelector('#player1 h2');
    const player2Title = document.querySelector('#player2 h2');
    if (myColor === 'negro') {
        player1Title.textContent = document.getElementById('player1-name').value || 'Tú';
        player2Title.textContent = data.opponentName;
    } else {
        player1Title.textContent = data.opponentName;
        player2Title.textContent = document.getElementById('player1-name').value || 'Tú';
    }

    // Iniciar el tablero y el juego
    initialize(LAYERS);
    allowMovementForPlayer(myColor);
});

// El servidor nos informa que somos espectadores
socket.on('spectator_mode', () => {
    updateStatus('La partida ya ha comenzado. Estás en modo espectador.', 'info');
});

// Escucha los movimientos que envía el oponente
socket.on('movimiento', (moveData) => {
  console.log('Movimiento recibido del oponente:', moveData);

  // <<< GEMINI: LÓGICA PARA REPLICAR EL MOVIMIENTO OPONENTE >>>

  // 1. Encontrar la pieza y la celda en el DOM local
  const pieceObject = PIECE_ARRAY.find(p => p.getPieceId === moveData.pieceId && p.getPlayer === moveData.playerId);
  const pieceElement = returnPieceElementFromObjectEquivalent(pieceObject);
  const cellElement = document.getElementById(moveData.toCellId);
  const cellObject = CELL_ARRAY.find(c => c.getCellId === moveData.toCellId);

  if (!pieceElement || !cellElement || !pieceObject || !cellObject) {
    console.error('No se encontraron los elementos para replicar el movimiento:', moveData);
    return;
  }

  // 2. Levantar la pieza para que sea visible y se pueda posicionar
  updatePieceZIndex(pieceObject);
  pieceElement.style.position = 'fixed';

  // 3. Sincronizar la rotación de la pieza
  pieceObject.setcolor_top_left = moveData.rotation; // Esto necesita una mejor implementación que guarde todos los colores
  pieceElement.dataset.rotation = moveData.rotation;
  pieceElement.style.transform = `rotate(${moveData.rotation}deg)`;
  sychronizeWithArray(PIECE_ARRAY, pieceObject, DATA_TYPES.PIECE);

  // 4. Mover la pieza a la nueva celda
  pieceElement.style.left = cellElement.dataset.xPosition + 'px';
  pieceElement.style.top = cellElement.dataset.yPosition + 'px';

  // 5. Actualizar el estado de los objetos locales
  if (pieceObject.getCellId) {
      const oldCell = CELL_ARRAY.find(c => c.getCellId === pieceObject.getCellId);
      if(oldCell) oldCell.setIsEmpty = true;
  }
  pieceObject.setCellId = cellObject.getCellId;
  cellObject.setIsEmpty = false;
  sychronizeWithArray(PIECE_ARRAY, pieceObject, DATA_TYPES.PIECE);
  sychronizeWithArray(CELL_ARRAY, cellObject, DATA_TYPES.CELL);

  // 6. Cambiar el turno
  changeTurn();

  // 7. Verificar si el movimiento resultó en la eliminación de piezas
  checkAndRemoveSurroundedPiece(pieceObject, checkSurroundingsPieces(cellObject), cellObject);

  // 8. Verificar condición de victoria
  let win_message = checkWinCondition(pieceObject);
  if (win_message) {
      showNotification(win_message, NOTIFICATION_TYPES.VICTORY_MODAL);
      console.warn(win_message);
  }
  // <<< FIN GEMINI >>>
});

// Escucha si el oponente se desconecta
socket.on('oponente_desconectado', () => {
  console.log('El oponente se ha desconectado.');
  updateStatus('Tu oponente se ha desconectado. Esperando a otro jugador...', 'error');
});

// NUEVO: El host se ha desconectado
socket.on('host_disconnected', () => {
    updateStatus('El host se ha desconectado. La partida ha terminado.', 'error');
    // Aquí podrías añadir lógica para reiniciar el juego o volver al menú principal
    location.reload(); // Recargar la página para reiniciar
});

// Se ejecuta cuando el cliente se desconecta del servidor
socket.on('disconnect', () => {
  console.log('Te has desconectado del servidor.');
  updateStatus("Se perdió la conexión con el servidor.", 'error');
});

// Maneja errores de conexión
socket.on('connect_error', (err) => {
  console.error('Error de conexión:', err.message);
  updateStatus("Error de conexión. Intentando reconectar...", 'error');
});