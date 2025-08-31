console.log('setup.js cargado y ejecutándose.');
document.addEventListener('DOMContentLoaded', () => {
    const setupOverlay = document.getElementById('setup-overlay');
    const startSoloButton = document.getElementById('start-solo-button');
    const startOnlineButton = document.getElementById('start-online-button');
    const player1NameInput = document.getElementById('player1-name');
    const player2NameInput = document.getElementById('player2-name'); // Asegúrate de que este ID exista en tu HTML
    const colorSelectionGroup = document.getElementById('color-selection-group');

    // Función expuesta globalmente para que online.js la llame
    window.configureSetupModalForGuest = (assignedColor, hostName) => {
        console.log('configureSetupModalForGuest called.');
        // Ocultar selección de color
        if(colorSelectionGroup) colorSelectionGroup.style.display = 'none';
        
        // Actualizar etiquetas y valores
        player1NameInput.placeholder = 'Introduce tu nombre';
        player1NameInput.value = 'Invitado';
        document.querySelector('label[for="player1-name"]').textContent = 'Tu Nombre';

        // Ocultar campo de nombre del oponente (ya lo sabemos)
        if(player2NameInput) {
            const player2FormGroup = player2NameInput.closest('.form-group');
            if (player2FormGroup) {
                player2FormGroup.style.display = 'none';
                console.log('player2-name form-group hidden for guest.');
            } else {
                console.log('player2-name form-group not found for guest.');
            }
        } else {
            console.log('player2NameInput not found for guest.');
        }

        // Cambiar texto del botón online
        startOnlineButton.textContent = 'Unirme a la Partida';
        startOnlineButton.disabled = false; // Por si estaba deshabilitado

        // Reasignar el evento click del botón online para el flujo de invitado
        startOnlineButton.removeEventListener('click', handleOnlineGameStartHost);
        startOnlineButton.addEventListener('click', () => {
            const guestName = player1NameInput.value.trim() || 'Invitado';
            socket.emit('register_guest', { name: guestName, assignedColor: assignedColor });
            updateStatus(`Uniéndote a la partida de ${hostName}...`);
            // El modal se ocultará cuando el servidor envíe game_start
        });

        // Ocultar botón de jugar solo
        startSoloButton.style.display = 'none';
    };

    function handleLocalGameStart() {
        setupOverlay.style.display = 'none';
        const p1Name = player1NameInput.value.trim();
        const p2Name = document.getElementById('player2-name').value.trim();
        if (p1Name) document.querySelector('#player1 h2').textContent = p1Name;
        if (p2Name) document.querySelector('#player2 h2').textContent = p2Name;
        console.log('Inicializando tablero para juego local...');
        initialize(LAYERS);
        allowMovementForPlayer(PLAYERS.BLACK);
    }

    function handleOnlineGameStartHost() {
        console.log('handleOnlineGameStartHost called.');
        const p1Name = player1NameInput.value.trim() || 'Host';
        const selectedColor = document.querySelector('input[name="player-color"]:checked').value;

        // Desactivar modal y registrar jugador
        if(colorSelectionGroup) colorSelectionGroup.style.display = 'none';
        startOnlineButton.disabled = true;
        startOnlineButton.textContent = 'Esperando Oponente...';
        startSoloButton.style.display = 'none';

        // Ocultar el campo del nombre del oponente
        if(player2NameInput) {
            const player2FormGroup = player2NameInput.closest('.form-group');
            if (player2FormGroup) {
                player2FormGroup.style.display = 'none';
                console.log('player2-name form-group hidden for host.');
            } else {
                console.log('player2-name form-group not found for host.');
            }
        } else {
            console.log('player2NameInput not found for host.');
        }

        socket.emit('register_host', { name: p1Name, color: selectedColor });
        updateStatus(`Esperando a que un oponente se una a tu partida de ${p1Name}...`);

        // Mostrar la URL de ngrok al host
        if (window.location.hostname.includes('ngrok-free.app')) {
            updateStatus(`Conectado. ¡Copia y comparte este vínculo con tu amigo: <b>${window.location.href}</b>`);
        }
    }

    function handleLocalGameStart() {
        setupOverlay.style.display = 'none';
        const p1Name = player1NameInput.value.trim();
        const p2Name = player2NameInput.value.trim();
        if (p1Name) document.querySelector('#player1 h2').textContent = p1Name;
        if (p2Name) document.querySelector('#player2 h2').textContent = p2Name;
        console.log('Inicializando tablero para juego local...');
        initialize(LAYERS);
        allowMovementForPlayer(PLAYERS.BLACK);
    }

    

    // Event listeners iniciales (asumiendo que es host al principio)
    startOnlineButton.addEventListener('click', handleOnlineGameStartHost);
    startSoloButton.addEventListener('click', handleLocalGameStart);
});
