function addRotationButtons() {
    //Buttons are not present, here they will be created, assigned functionality, and placed


    let rotate_left_button_element = document.createElement('div');
    rotate_left_button_element.id = 'rotate_left';
    rotate_left_button_element.classList.add('ui_operation_buttons');
    rotate_left_button_element.innerHTML = 'Rotar a la <br> izquierda';
    rotate_left_button_element.title = 'Rotar a la izquierda';
    rotate_left_button_element.addEventListener('click', rotatePieceLeft);
    CONTROLS_SELECTION.appendChild(rotate_left_button_element);

    let empty_space = document.createElement('span');
    empty_space.classList.add('ui_operation_spacer');
    empty_space.innerHTML = ' ';
    empty_space.id = 'ui_operation_spacer';
    CONTROLS_SELECTION.appendChild(empty_space);

    let rotate_right_button_element = document.createElement('div');
    rotate_right_button_element.id = 'rotate_right';
    rotate_right_button_element.classList.add('ui_operation_buttons');
    rotate_right_button_element.innerHTML = 'Rotar a la <br> derecha';
    rotate_right_button_element.title = 'Rotar a la derecha';
    rotate_right_button_element.addEventListener('click', rotatePieceRight);
    CONTROLS_SELECTION.appendChild(rotate_right_button_element);

}

function removeRotationButtons() {
    //Removes the buttons that allows rotation.
    const CONTROLS_SELECTION = document.getElementById('controls');
    //This function may be called when removing a piece from board. this buttons may not exist
    if (document.getElementById('rotate_right')) {
        CONTROLS_SELECTION.removeChild(document.getElementById('rotate_right'));
        CONTROLS_SELECTION.removeChild(document.getElementById('rotate_left'));
        CONTROLS_SELECTION.removeChild(document.getElementById('ui_operation_spacer'));
    }
}


function showNotification(notification, type) {
    //This function creates a notification
    //'notification' parameter is the string or messege
    //'type' defines what kind of notif is.
    let gray_overlay = document.createElement('div');
    gray_overlay.id = 'gray_overlay';
    gray_overlay.addEventListener('click', closeNotification);

    let notification_element = document.createElement('div');
    notification_element.id = 'notifications';
    notification_element.classList.add('notification_modal');
    let notification_body = document.createElement('div');
    notification_body.id = 'notification_body';


    let notification_footer = document.createElement('div');
    notification_footer.id = 'notification_footer';

    let close_button = document.createElement('div');
    close_button.id = 'notification_close_button';
    close_button.innerHTML = 'X';
    close_button.addEventListener('click', closeNotification);

    let notification_body_content;
    let notification_header;
    let second_line;
    let embed;

    if (type == NOTIFICATION_TYPES.VICTORY_MODAL) {
        notification_header = document.createElement('header');
        notification_header.id = 'notification_header';
        notification_element.classList.add('notification_victory');

        notification_header.classList.add('notification_header_victory');
        notification_header.innerHTML = 'VICTORIA';

        notification_body_content = document.createElement('p');
        notification_body_content.innerHTML = notification;

        second_line = document.createElement('p');
        second_line.innerHTML = '<br><i>Haz click fuera de este modal para cerrarlo y continuar.</i>';

        let restart_button = document.createElement('button');
        restart_button.innerHTML = 'Reiniciar Juego';
        restart_button.addEventListener('click', reset_game);
        notification_footer.appendChild(restart_button);

    } else if(type == NOTIFICATION_TYPES.ABOUT){
        notification_header = document.createElement('header');
        notification_header.id = 'notification_header';
        notification_header.classList.add('notification_header_victory');
        notification_header.innerHTML = 'Acerca de:';

        notification_body_content = document.createElement('p');
        notification_body_content.innerHTML = 'Kan es un juego ideado por <b><a href="https://www.moroarte.com/" target="_blank">Diego Colombres</a><b> y desarrollado en versión digital por <b><a href="https://julianmmame.com.ar/" target="_blank">Julián Amé</a><b>';

        second_line = document.createElement('p');
        second_line.innerHTML = `<br><i>Versión ${SYSTEM_VERSION}</i><br><a href="https://github.com/imperioame/MoroArte-GranKan" target="_blank">Link al repositorio</a>`;

    }
    if (type == NOTIFICATION_TYPES.INSTRUCTIONS || type == NOTIFICATION_TYPES.ABOUT) {
        notification_element.classList.add('notification_instructions');

        embed = document.createElement('embed');
        embed.src = './imgs/KAN_Reglas.pdf#toolbar=0';
        embed.id = 'instructions';

        let p = document.createElement('p');
        
        p.innerHTML = type == NOTIFICATION_TYPES.ABOUT ? 'Presiona aquí para continuar el juego' : 'Presiona aquí para empezar el juego';
        notification_footer.appendChild(p);
    }

    if (notification_header) notification_element.appendChild(notification_header);
    if (close_button) notification_element.appendChild(close_button);
    if (notification_body_content) notification_body.appendChild(notification_body_content);
    if (second_line) notification_body.appendChild(second_line);
    if (embed) notification_body.appendChild(embed);
    if (notification_body) notification_element.appendChild(notification_body);
    if (notification_footer) notification_element.appendChild(notification_footer);

    gray_overlay.appendChild(notification_element);
    document.getElementsByTagName('body')[0].appendChild(gray_overlay);
}

function closeNotification(e) {
    //destroys previosly generated notification
    e.stopPropagation();

    let notification_container = document.getElementById('gray_overlay');
    if (!notification_container) {
        console.error('Trying to close a notification that does not exist. This is an error.');
    }

    notification_container.remove();
}


function createSkipTurnButton() {
    //Creates an ui button to skip turn
    let div = document.createElement('div');
    div.id = 'skip_button';
    div.classList.add('ui_operation_buttons');
    div.innerHTML = 'Saltear <br> turno';
    div.title = 'Saltear turno';
    if (DIRECTION == 'landscape') {
        div.style.right = `${document.getElementsByClassName('pieces_board')[0].offsetWidth + HEX_WIDTH}px`;
    } else {
        div.style.right = `${HEX_WIDTH}px`;
    }

    div.addEventListener('click', changeTurn);
    CONTROLS_SELECTION.appendChild(div);
}

function rotateSkipButton() {
    //Rotates the ui 'skip turn' button to match player's side
    const skip_button = document.getElementById('skip_button');
    if (DIRECTION != 'landscape') {
        return;
    }

    if (checkCurrentTurn() == PLAYERS.BLACK) {
        skip_button.style.right = `${document.getElementsByClassName('pieces_board')[0].offsetWidth + HEX_WIDTH}px`;
        skip_button.style.removeProperty('left');

    } else {
        skip_button.style.left = `${document.getElementsByClassName('pieces_board')[0].offsetWidth + HEX_WIDTH}px`;
        skip_button.style.removeProperty('right');
    }
}

function rotateBoard() {
    let player1 = document.getElementById('player1');
    let player2 = document.getElementById('player2');
    player1.classList.toggle('rotated_player1');
    player2.classList.toggle('rotated_player2');
}


function createAboutButton(){
    let div = document.createElement('div');
    div.id = 'about_button';
    let img = document.createElement('img');
    img.src = './imgs/about.png';
    img.title = 'Acerca del juego';

    div.addEventListener('click', function(){
        showNotification('', NOTIFICATION_TYPES.ABOUT);
    });

    div.appendChild(img);
    document.getElementsByTagName('body')[0].appendChild(div);
}