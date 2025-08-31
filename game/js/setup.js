document.addEventListener('DOMContentLoaded', () => {
    const setupOverlay = document.getElementById('setup-overlay');
    const startSoloButton = document.getElementById('start-solo-button');
    const startOnlineButton = document.getElementById('start-online-button');
    const player1NameInput = document.getElementById('player1-name');
    const player2NameInput = document.getElementById('player2-name');
    const player1Title = document.querySelector('#player1 h2');
    const player2Title = document.querySelector('#player2 h2');

    function handleGameStart() {
        // Ocultar el modal
        setupOverlay.style.display = 'none';

        // Actualizar los nombres de los jugadores
        const p1Name = player1NameInput.value.trim();
        const p2Name = player2NameInput.value.trim();

        if (p1Name) {
            player1Title.textContent = p1Name;
        }
        if (p2Name) {
            player2Title.textContent = p2Name;
        }

        // Iniciar el juego llamando a la función de build.js
        // La variable LAYERS debe estar disponible globalmente desde data.js
        console.log('Inicializando tablero...');
        initialize(LAYERS);
    }

    startOnlineButton.addEventListener('click', () => {
        // La conexión online ya se establece automáticamente con online.js
        handleGameStart();
    });

    startSoloButton.addEventListener('click', () => {
        // Simplemente inicia el juego en modo local "hotseat"
        handleGameStart();
    });
});
