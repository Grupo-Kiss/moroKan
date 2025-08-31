function createHex(center_X, center_Y, id) {
    //Creo el elemento y lo inserto en el dom con posición fijada.
    let center_X_rounded = Math.round(center_X * 100) / 100;
    let center_Y_rounded = Math.round(center_Y * 100) / 100;

    if (checkEmptyPosition(center_X_rounded, center_Y_rounded)) {
        let hex = document.createElement('div');
        hex.className = "hex-clip";
        hex.id = id;
        hex.dataset.xPosition = center_X_rounded;
        hex.dataset.yPosition = center_Y_rounded;
        hex.style.top = `${center_Y}px`;
        hex.style.left = `${center_X}px`;
        //hex.setAttribute('style', `top: ${center_Y}px; left: ${center_X}px`);
        //hex.innerHTML = id;

        saveToMemory(center_X_rounded, center_Y_rounded, id);
        BOARD.appendChild(hex);
    }
}

function saveToMemory(position_X, position_Y, id) {
    //Creates an object, asignes position and save to array
    let cell = new Cell(position_X, position_Y, id);
    CELL_ARRAY.length != 0 ? defineCellSurroundings(cell) : '';
    CELL_ARRAY.push(cell);
}

function defineCellSurroundings(cellToBeSaved) {
    // checks all surroundings to set attributes
    // Does path tracing
    for (let direction = 1; direction <= 6; direction++) {
        // Direction is used as math factor.
        // Direction Datasheet:
        // 1 = top_right;
        // 2 = middle_right;
        // 3 = bottom_right;
        // 4 = bottom_left;
        // 5 = middle_left;
        // 6 = top_left;

        let dY = cellToBeSaved.getPosY;
        if (direction != 2 && direction != 5) {
            //console.log('NO es desplazamiento horizontal');
            dY = Math.round((cellToBeSaved.getPosY + (direction == 1 || direction == 6 ? -1 : 1) * HEX_HEIGHT) * 100) / 100;
        }
        let dX = Math.round((cellToBeSaved.getPosX + (direction < 4 ? 1 : -1) * HEX_WIDTH / 2) * 100) / 100;



        CELL_ARRAY.forEach(looped_cell => {
            //Checks if this cell's position is near (dx;dy)

            if (looped_cell.getPosX <= dX + HEX_WIDTH / 2 + 5 && looped_cell.getPosX >= dX - HEX_WIDTH / 2 - 5) {
                //console.log('validé dX')
                if (looped_cell.getPosY <= dY + HEX_WIDTH / 2 + 5 && looped_cell.getPosY >= dY - HEX_WIDTH / 2 - 5) {
                    //console.log('encontré una celda que es contigua a la celda que se está guardano.');
                    //saves in cellToBeSaved the proximity attribute corresponding to what DIRECTION defines
                    // It also saves OPPOSITE direction in looped_cell
                    // remember that this function detects proximity for pieces previously saved. That means if there was a match in the ifs statements, the looped_cell did not have saved the proximity information
                    switch (direction) {
                        case 1:
                            cellToBeSaved.setcell_top_right = looped_cell.getCellId;
                            looped_cell.setcell_bottom_left = cellToBeSaved.getCellId;
                            break;
                        case 2:
                            cellToBeSaved.setcell_middle_right = looped_cell.getCellId;
                            looped_cell.setcell_middle_left = cellToBeSaved.getCellId;
                            break;
                        case 3:
                            cellToBeSaved.setcell_bottom_right = looped_cell.getCellId;
                            looped_cell.setcell_top_left = cellToBeSaved.getCellId;
                            break;
                        case 4:
                            cellToBeSaved.setcell_bottom_left = looped_cell.getCellId;
                            looped_cell.setcell_top_right = cellToBeSaved.getCellId;
                            break;
                        case 5:
                            cellToBeSaved.setcell_middle_left = looped_cell.getCellId;
                            looped_cell.setcell_middle_right = cellToBeSaved.getCellId;
                            break;
                        case 6:
                            cellToBeSaved.setcell_top_left = looped_cell.getCellId;
                            looped_cell.setcell_bottom_right = cellToBeSaved.getCellId;
                            break;
                        default:
                            break;
                    }



                    //console.log(cellToBeSaved);
                    //console.log(looped_cell);

                }
            }
        });
    }
}

function checkEmptyPosition(position_X, position_Y) {
    //Checks if position in board is occupied, if so, reutns false

    return !CELL_ARRAY.some((cell) => {
        // checks surroundings wit +/- 0.01

        let x_pos_is_in_range = cell.getPosX <= position_X + 0.01 && cell.getPosX >= position_X - 0.01
        let y_pos_is_in_range = cell.getPosY <= position_Y + 0.01 && cell.getPosY >= position_Y - 0.01

        return x_pos_is_in_range && y_pos_is_in_range
    });
}

let hexcount = 0;

function recursiveHexagon(center_X, center_Y, depth, r) {
    //Creates recursively all hexagons
    if (depth == 0) {
        createHex(center_X, center_Y, hexcount++);
    } else {
        recursiveHexagon(center_X, center_Y, depth - 1, r / 2)
        for (let a = 0; a < TAU; a += TAU / 6) {
            let x = center_X + r * Math.cos(a);
            let y = center_Y + r * Math.sin(a);

            if (depth > 0) {
                recursiveHexagon(x, y, depth - 1, r / 2);
            }
        }
    }
}

function createPieces() {
    // Create all pieces in memory

    console.error('Tenemos que consultar si el usuario ya jugó antes (es decir, verificar si existe algo en el localStorage. Si es así, no debemos cargar el tablero de cero, sino utilizar la data que se encuentra en el localStorage.');
    let piecenumber = 1;
    let playercolor = PLAYERS.BLACK;
    for (let i = 1; i <= 22; i++) {
        PIECE_ARRAY.push(new Piece(piecenumber, playercolor));
        if (piecenumber == 11) {
            piecenumber = 1;
            playercolor = PLAYERS.WHITE;
        } else {
            piecenumber++;
        }
        //Create piece in DOM and distribute it in aside
        createDomPiece(PIECE_ARRAY[PIECE_ARRAY.length - 1]);
        //Adds movement functionality for all FIRST PLAYER pieces.
        allowMovementForPlayer(checkCurrentTurn());
    }
    //console.log(PIECE_ARRAY);
}

function createDomPiece(pieceObject) {
    //This creates a piece element and places it in the dom
    let piece = document.createElement('div');
    piece.className = `piece ${pieceObject.player == PLAYERS.BLACK ? 'black_player_piece' : 'white_player_piece'}`;
    piece.id = `Player_${pieceObject.getPlayer}-Piece_${pieceObject.getPieceId}`;
    piece.dataset.piece_number = pieceObject.getPieceId;
    piece.dataset.rotation = 0;
    if (pieceObject.getPieceId == 5 || pieceObject.getPieceId == 16) {
        piece.dataset.z_index = 24;
    } else {
        piece.dataset.z_index = PIECE_ARRAY.length - 1;
    }
    piece.style.zIndex = piece.dataset.z_index;
    piece.dataset.piece_player_color = pieceObject.getPlayer;

    piece.style.position = 'absolute';
    let y_axis, x_axis;
    if (DIRECTION == 'landscape') {
        y_axis = Math.ceil(pieceObject.getPieceId / 2) * (HEX_HEIGHT * 1.15) + document.getElementsByClassName('pieces_board')[0].offsetHeight / 2 - (HEX_HEIGHT * 3 * 1.15) + document.querySelectorAll('#player1 h2')[0].offsetHeight;
        x_axis = (PIECE_ARRAY.indexOf(pieceObject) % 2) * (HEX_WIDTH * 1.15) + (HEX_WIDTH / 6);
    } else {
        x_axis = Math.ceil(pieceObject.getPieceId / 2) * (HEX_WIDTH * 1.15) + document.getElementsByClassName('pieces_board')[0].offsetWidth / 2 - (HEX_WIDTH * 3 * 1.15);
        y_axis = (PIECE_ARRAY.indexOf(pieceObject) % 2) * (HEX_HEIGHT * 1.15) + (HEX_HEIGHT / 6) + document.querySelectorAll('#player1 h2')[0].offsetHeight + HEX_HEIGHT / 2;
    }
    piece.style.top = `${y_axis}px`;


    if (pieceObject.getPlayer == PLAYERS.BLACK) {
        piece.style.left = `${x_axis}px`;
    } else {
        piece.style.right = `${x_axis}px`;
    }

    let image = document.createElement('img');
    image.src = pieceObject.getimgTitle;
    piece.appendChild(image);
    //piece.innerHTML = pieceObject.getPieceId;

    //Creates a transparent element to cover svg, and hosts functionality (onclicks)
    let coverDiv = document.createElement('div');
    coverDiv.className = 'cover_div';
    piece.appendChild(coverDiv);

    //Place it in correspondent players aside
    let playerAside = pieceObject.getPlayer == PLAYERS.BLACK ? document.getElementById('player1').getElementsByClassName('pieces_board')[0] : document.getElementById('player2').getElementsByClassName('pieces_board')[0];
    playerAside.appendChild(piece);
}

function initialize(max_layers) {
    recursiveHexagon(CENTER_X, CENTER_Y, max_layers, RAD);
    createPieces();
    createSkipTurnButton();
    createAboutButton();
    showNotification('',NOTIFICATION_TYPES.INSTRUCTIONS);
}

/*
window.onload = function () {
    console.log('inicializando...');
    initialize(LAYERS);
};
*/