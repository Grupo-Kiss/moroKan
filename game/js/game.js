function movePiece(e) {
    //Adds the functionality, when called, to move object until it's released
    moving_a_piece = true;
    const correct_target_piece = e.target.parentNode;
    selected_piece_element = document.getElementById(correct_target_piece.id);
    selected_piece_object = returnPieceObjectFromElementEquivalent(selected_piece_element);

    //If selected piece was placed in a cell, then it's a remove operation. 
    //In this case, player can only do this action.
    if (selected_piece_object.getCellId) {
        releasepiece();
        return;
    }

    updatePieceZIndex(selected_piece_object);
    addRotationButtons();

    //Checks if this piece was placed in a cell. If so, that cell should now be 'empty'
    if (selected_piece_object.getCellId != null) {
        let cell_where_piece_was_placed = CELL_ARRAY.find((cell) => cell.getCellId === selected_piece_object.getCellId);
        cell_where_piece_was_placed.setIsEmpty = true;
        selected_piece_object.setCellId = null;
        sychronizeWithArray(PIECE_ARRAY, selected_piece_object, DATA_TYPES.PIECE);
        sychronizeWithArray(CELL_ARRAY, cell_where_piece_was_placed, DATA_TYPES.CELL);
    }

    //Disables piece movement over all other pieces. Cannot move more than one piece at a time.
    pieceMoviengDisableAllOther();


    e.stopPropagation();
    selected_piece_element.style.position = 'fixed';
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('click', releasepiece);
}

const onMouseMove = (e) => {
    //Defines the function that allows piece to move to mouse
    selected_piece_element.style.left = e.pageX /* - HEX_WIDTH / 2 */ + 'px';
    selected_piece_element.style.top = e.pageY /* - HEX_HEIGHT / 2 */ + 'px';
}

function releasepiece(e) {
    // This places a piece over a board cell. It does not validates if this movement can be done. For that, it calls the validation function

    if (!e) {
        //There is no event data, this means that this function was called while the player was moving its piece
        //(Usually by pressing 'skip turn' without releasing the piece)
        // The piece is dropped, but not snapped to any cell.
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('click', releasepiece);
        //Placing is done, enables movePiece again
        allowMovementForPlayer(checkCurrentTurn());
        removeRotationButtons();
        moving_a_piece = false;

        if (selected_piece_object.getCellId) {
            //this is the situation where a piece is beign removed from the board.
            removePiece(selected_piece_object);
            changeTurn();
        }
        return;
    }

    e.stopPropagation();
    if (!e.target.classList.contains('hex-clip') && !e.target.classList.contains('ui_operation_buttons')) {
        // If it's not a board cell, then the piece is dropped, but not snapped to any cell.
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('click', releasepiece);
        //Placing is done, enables movePiece again
        allowMovementForPlayer(checkCurrentTurn());
        removeRotationButtons();
        moving_a_piece = false;
        return;
    }

    if (validPiecePlacing(e.target, selected_piece_object)) {
        // The movement is acceptable, it places the piece over the board cell

        //Saves cell id on piece.getCellId on piece OBJECT
        selected_piece_object.setCellId = CELL_ARRAY.find((cell) => cell.getCellId == e.target.id).getCellId;
        //Syncrhonices with PIECE_ARRAY
        sychronizeWithArray(PIECE_ARRAY, selected_piece_object, DATA_TYPES.PIECE);

        //Saves cell position on PIECE position on DOM/element
        selected_piece_element.style.left = e.target.dataset.xPosition + 'px';
        selected_piece_element.style.top = e.target.dataset.yPosition + 'px';

        //Sets cell "isempty" to false on cell OBJECT
        const selected_cell_object = CELL_ARRAY.find((cell) => cell.getCellId === selected_piece_object.getCellId);
        selected_cell_object.setIsEmpty = false;
        //Syncrhonices with CELL_ARRAY
        sychronizeWithArray(CELL_ARRAY, selected_cell_object, DATA_TYPES.CELL);


        // Movement done, it removes the 'follow mouse' functionality when piece is selected
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('click', releasepiece);
        //Placing is done, enables movePiece again
        moving_a_piece = false;
        changeTurn();

        //Checks if it's win condition
        let win_message = checkWinCondition(selected_piece_object);
        if (win_message) {
            showNotification(win_message, NOTIFICATION_TYPES.VICTORY_MODAL);
            console.warn(win_message);
        }

        //Now, after placing, it checks if some surrounding piece needs to be removed. It also checks if SELF needed to be removed (called 'suicide')
        checkAndRemoveSurroundedPiece(selected_piece_object, checkSurroundingsPieces(selected_cell_object), selected_cell_object);

        // <<< GEMINI: NOTIFICAR AL SERVIDOR SOBRE EL MOVIMIENTO >>>
        const moveData = {
            pieceId: selected_piece_object.getPieceId,
            playerId: selected_piece_object.getPlayer,
            toCellId: selected_cell_object.getCellId,
            rotation: selected_piece_element.dataset.rotation
        };
        enviarMovimiento(moveData);
        // <<< FIN GEMINI >>>

        removeRotationButtons();
    } else {
        //Cannot be placed here. The current cell is highghted in red.
        const selected_cell = document.getElementById(e.target.id);
        if (selected_cell.classList.contains('hex-clip')) {
            selected_cell.classList.remove("invalidPiecePlacement");
            setTimeout(() => {
                selected_cell.classList.add("invalidPiecePlacement");
            }, 10);
        }
    }

    moving_a_piece = false;
}

function removePiece(pice_to_be_removed) {
    let cell_where_piece_was_placed = CELL_ARRAY.find((cell) => cell.getCellId === pice_to_be_removed.getCellId);
    if (cell_where_piece_was_placed != null && cell_where_piece_was_placed != undefined) {
        //Remember that if the surrounded piece was the current piece, it was not placed yet.
        cell_where_piece_was_placed.setIsEmpty = true;
        pice_to_be_removed.setCellId = null;
        sychronizeWithArray(CELL_ARRAY, cell_where_piece_was_placed, DATA_TYPES.CELL);
    }
    sychronizeWithArray(PIECE_ARRAY, pice_to_be_removed, DATA_TYPES.PIECE);
    const piece_element = returnPieceElementFromObjectEquivalent(pice_to_be_removed);
    if (!piece_element) {
        console.error('Could not find piece in board. This is an error');
        return;
    }

    // Movement done, it removes the 'follow mouse' functionality when piece is selected
    document.removeEventListener('mousemove', onMouseMove);
    document.removeEventListener('click', releasepiece);

    piece_element.style.position = 'absolute';
    piece_element.style.top = document.getElementsByClassName('pieces_board')[0].offsetHeight / 2 - HEX_HEIGHT + document.querySelectorAll('#player1 h2')[0].offsetHeight;
    piece_element.style.left = `${HEX_WIDTH}px`;

}

function validPiecePlacing(clickedCellElement, movingPieceObject) {
    // Checks surrounding pieces and defines if this movement is correct.
    // returns true or false.
    //Firt. it checks if the user clicked a board cell. If so, continue checks
    if (!clickedCellElement.classList.contains('hex-clip')) {
        return false;
    }

    //checks if this cell is empty.
    let cell_data = CELL_ARRAY.find((cell) => cell.getCellId == clickedCellElement.id);
    if (!cell_data.getIsEmpty) {
        return false;
    }

    const piecesPlacedInSurroundingCellsArray = checkSurroundingsPieces(cell_data);
    // Then, it checks if surroundings are empty, if so, it's an automatic true
    if (!piecesPlacedInSurroundingCellsArray.length) {
        return true;
    } else {
        // Then, it checks if surrounding pieces matches color with current piece
        const surroundingPiecesArray = orderSurroundingPieces(cell_data, piecesPlacedInSurroundingCellsArray);

        let validPlacing = true;
        surroundingPiecesArray.forEach((value, key) => {
            //Checks every direction, if this direction has a piece (not null), then matches colours form this piece, and clicked piece.
            //Remember that this comparison is done by checking OPPOSITE directions, e.g. clickedpiece.top_left with direction.bottom_right
            //If there's at least one NON MATCHING COLOUR, then this is an INVALID movement. Returns false.
            if (value != null && validPlacing) {
                const defined_getter = `getcolor_${key}`;
                const defined_oposite_getter = `getcolor_${getOppositeDirection(key)}`;
                validPlacing = movingPieceObject[defined_getter] == value[defined_oposite_getter];
            }
        });

        return validPlacing;
    }
}

function checkSurroundingsPieces(cellObject) {
    //Recieves a cell and generates an array with the surroundings cell ids
    const ID_VALUES_TO_CHECK = [cellObject.getcell_top_left, cellObject.getcell_top_right, cellObject.getcell_middle_left, cellObject.getcell_middle_right, cellObject.getcell_bottom_left, cellObject.getcell_bottom_right];

    //Filters main cell array and gets only cells surrunding current cell
    const surroundingCellsArray = CELL_ARRAY.filter((cellArrayElement) => {
        return ID_VALUES_TO_CHECK.some((cell_id_Number) => {
            return cellArrayElement.getCellId == cell_id_Number;
        });
    });

    // Filters this previous array and generates a new array with only NON empty cells
    const nonEmptyCellsArray = surroundingCellsArray.filter((cell) => cell.getIsEmpty == false);

    // Checks what pieces are placed in these surrounding cells
    const piecesPlacedInSurroundingCellsArray = PIECE_ARRAY.filter((piece) => {
        return nonEmptyCellsArray.some((cell) => {
            return piece.getCellId == cell.getCellId;
        })
    });

    //returns array with surroudning pieces
    //Returns an empty array if there are no surrounding pieces
    return piecesPlacedInSurroundingCellsArray;
}

function orderSurroundingPieces(cellObject, piecesArray) {
    //Recieves a pre-filtered array and a cell, and sorts the elements in the array according to position relative to cell.
    //Returns new associative array with correct positions (relative to cell)

    const surroundingPiecesArray = new Map([
        [DIRECTION_TYPES.TOP_LEFT, piecesArray.find((piece) => piece.getCellId === cellObject.getcell_top_left) || null],
        [DIRECTION_TYPES.TOP_RIGHT, piecesArray.find((piece) => piece.getCellId === cellObject.getcell_top_right) || null],
        [DIRECTION_TYPES.MIDDLE_LEFT, piecesArray.find((piece) => piece.getCellId === cellObject.getcell_middle_left) || null],
        [DIRECTION_TYPES.MIDDLE_RIGHT, piecesArray.find((piece) => piece.getCellId === cellObject.getcell_middle_right) || null],
        [DIRECTION_TYPES.BOTTOM_LEFT, piecesArray.find((piece) => piece.getCellId === cellObject.getcell_bottom_left) || null],
        [DIRECTION_TYPES.BOTTOM_RIGHT, piecesArray.find((piece) => piece.getCellId === cellObject.getcell_bottom_right) || null],
    ]);

    return surroundingPiecesArray;
}

function rotatePieceRight() {
    //This function rotates a piece
    if (!selected_piece_element && !selected_piece_object) {
        console.error("Trying to rotate something that's not corretly saved");
        return;
    }

    //First rotates its color properties
    let auxiliary_color = selected_piece_object.getcolor_top_right;
    selected_piece_object.setcolor_top_right = selected_piece_object.getcolor_top_left;
    selected_piece_object.setcolor_top_left = selected_piece_object.getcolor_middle_left;
    selected_piece_object.setcolor_middle_left = selected_piece_object.getcolor_bottom_left;
    selected_piece_object.setcolor_bottom_left = selected_piece_object.getcolor_bottom_right;
    selected_piece_object.setcolor_bottom_right = selected_piece_object.getcolor_middle_right;
    selected_piece_object.setcolor_middle_right = auxiliary_color;

    //Then, rotates the element
    selected_piece_element.dataset.rotation = parseInt(selected_piece_element.dataset.rotation) + 60;
    selected_piece_element.style.transform = `rotate(${selected_piece_element.dataset.rotation}deg)`;

    sychronizeWithArray(PIECE_ARRAY, selected_piece_object, DATA_TYPES.PIECE);
}

function rotatePieceLeft() {
    //This function rotates a piece
    if (!selected_piece_element && !selected_piece_object) {
        console.error("Trying to rotate something that's not corretly saved");
        return;
    }

    //First rotates its color properties
    let auxiliary_color = selected_piece_object.getcolor_top_right;
    selected_piece_object.setcolor_top_right = selected_piece_object.getcolor_middle_right;
    selected_piece_object.setcolor_middle_right = selected_piece_object.getcolor_bottom_right;
    selected_piece_object.setcolor_bottom_right = selected_piece_object.getcolor_bottom_left;
    selected_piece_object.setcolor_bottom_left = selected_piece_object.getcolor_middle_left;
    selected_piece_object.setcolor_middle_left = selected_piece_object.getcolor_top_left;
    selected_piece_object.setcolor_top_left = auxiliary_color;

    //Then, rotates the element
    selected_piece_element.dataset.rotation = parseInt(selected_piece_element.dataset.rotation) - 60;
    selected_piece_element.style.transform = `rotate(${selected_piece_element.dataset.rotation}deg)`;

    sychronizeWithArray(PIECE_ARRAY, selected_piece_object, DATA_TYPES.PIECE);
}

function checkWinCondition(placed_piece_object) {
    //This function checks if the current movement made the player win.
    //If true, returns win message.
    //There's another win condition, removing oppont qudak piece by invading from two sides. This condition is in checkAndRemoveSurroundedPiece() function.

    //First, it checks the flower, since it doesnt need all pieces, just 7 to be made.
    let playerwon_by_gran_kan_flower = checkGranKanFlower(placed_piece_object);
    if (playerwon_by_gran_kan_flower) {
        return `El jugador <b>${placed_piece_object.getPlayer}</b> ganó por haber armado <br> la Flor Gran Kan`;

    }

    const at_least_one_piece_not_placed = PIECE_ARRAY.some((piece) => piece.getCellId == null && piece.getPlayer == placed_piece_object.getPlayer);

    const cell = CELL_ARRAY.find((cell) => cell.getCellId == placed_piece_object.getCellId);

    if (at_least_one_piece_not_placed) {
        return false;
    }

    //Checks if there's an adversary piece next to this one
    if (checkSurroundingsPieces(cell).some((piece) => piece.getPlayer != placed_piece_object.getPlayer)) {
        return false;
    }

    const at_least_one_surrounding_pieces_does_not_match_player = checkSurroundingsPieces(cell).some((piece) => piece.getPlayer != placed_piece_object.getPlayer);
    if (at_least_one_surrounding_pieces_does_not_match_player) {
        return false;
    }
    return `El jugador <b>${placed_piece_object.getPlayer}</b> ganó por haber <br> colocado todas las piezas`;
}

function checkGranKanFlower(piece) {
    //Checks if all placed pieces made the "Gran Kan flower".
    //The condition of Gran Kan flower is that 7 pieces must be clustered together, 
    const placed_pieces = PIECE_ARRAY.filter((filtered_piece) => filtered_piece.getPlayer == piece.getPlayer && filtered_piece.getCellId != null).length;
    if (placed_pieces < 7) {
        // Not enough pieces placed. 
        // Since the following algorithm is memory intensive, it's preferable to skip if this condition is not matched.
        return false;
    }

    // There must be a center piece, and the remaining 6 pieces surrounding that piece.
    let granKanMade = false;
    let cellObject = CELL_ARRAY.find((cell) => cell.getCellId == piece.getCellId);

    //Gets an array based an all surrounding pieces.
    const surrounding_pieces = checkSurroundingsPieces(cellObject);

    let different_player = surrounding_pieces.some((piece) => piece.getPlayer != cellObject.getPlayer);
    if (surrounding_pieces.length == 6 && !different_player) {
        //Player is placing center piece.
        return true;
    }

    surrounding_pieces.some((surrounding_piece) => {
        //Checks for each surrounding piece it's surroundings
        const surrounding_piece_cell_position_object = CELL_ARRAY.find((recursive_cell) => recursive_cell.getCellId == surrounding_piece.getCellId);
        const surroundings_pieces_of_surrounding_cell = checkSurroundingsPieces(surrounding_piece_cell_position_object);

        //Checks if all pieces are of the same player
        let different_player = surroundings_pieces_of_surrounding_cell.some((piece) => piece.getPlayer != surrounding_piece.getPlayer);
        if (different_player) {
            return false;
        }

        if (surroundings_pieces_of_surrounding_cell.length == 6) {
            // Remember that the length is calculated by surrounding cells. It doesnt aknowledge self. 
            // It's 6 surrounding pieces + self. 

            granKanMade = true;

            /*
            //It doesn't need to include the Qudak piece, if the rules change, uncomment this
            if (surroundings_pieces_of_surrounding_cell.some((piece) => piece.getPieceId == 5) || surrounding_piece.getPieceId == 5) {
                granKanMade = true;
            }
            */
        }
        return granKanMade;
    });
    return granKanMade;
}

function checkAndRemoveSurroundedPiece(placed_piece_object, surrounding_pieces, placed_cell_object) {
    //This function checks if there's any player surrounding an adversary piece

    //It first checks for all surrounding pieces, if THEY are surrounded.
    let surrounded_piece_to_be_removed;
    surrounding_pieces.forEach((surrounding_piece) => {
        let cell_object = CELL_ARRAY.find((cell) => cell.getCellId == surrounding_piece.getCellId);

        const its_surroundings = checkSurroundingsPieces(cell_object);
        const surrounding_enemies_array = its_surroundings.filter((its_surrounding_piece) => its_surrounding_piece.getPlayer != surrounding_piece.getPlayer);

        let how_many_surrounding_enemies = surrounding_enemies_array.length;
        if (!how_many_surrounding_enemies) {
            //nothing here. should return
            return;
        }

        if (how_many_surrounding_enemies >= 2) {
            //piece surrounded by enemies.
            surrounded_piece_to_be_removed = surrounding_piece;
        }
    });

    if (!surrounded_piece_to_be_removed) {
        //The algorithm checked if surrounding pieces where surrounded.
        //Now, it has to check if self is surrounded
        //By game rules, 'suicide' is allowed.

        const its_surroundings = checkSurroundingsPieces(placed_cell_object);
        const surrounding_enemies_array = its_surroundings.filter((its_surrounding_piece) => its_surrounding_piece.getPlayer != placed_piece_object.getPlayer);

        let how_many_surrounding_enemies = surrounding_enemies_array.length;
        if (!how_many_surrounding_enemies) {
            //nothing here. should return
            return;
        }

        if (how_many_surrounding_enemies >= 2) {
            //piece surrounded by enemies.
            surrounded_piece_to_be_removed = placed_piece_object;
            self_removed = true;
        }

        if (!surrounded_piece_to_be_removed) {
            //nothig to do
            return;
        }
    }

    //found a surrounded piece. Should remove from board
    removePiece(surrounded_piece_to_be_removed);

    //If removed piece was Qudak, then is game over for that player.
    if (surrounded_piece_to_be_removed.getPieceId == 5) {
        win_message = `La pieza Qudak del jugador <b>${surrounded_piece_to_be_removed.getPlayer}</b> fue eliminada.<br> El jugador ${surrounded_piece_to_be_removed.getPlayer} <b>PERDIÓ</b> `
        showNotification(win_message, NOTIFICATION_TYPES.VICTORY_MODAL);
        console.warn(win_message);
    }

}

function checkCurrentTurn() {
    return current_player_turn;
}

function allowMovementForPlayer(player) {
    // This function recieves a player and adds function 'movepiece' for all pieces of that player
    const allDomPieces = document.getElementsByClassName('cover_div');

    //if is first turn of each player, it only allows Qudak piece
    if (first_turn_black || first_turn_white) {
        for (let dom_piece of allDomPieces) {
            if (dom_piece.parentNode.dataset.piece_number == 5 && dom_piece.parentNode.dataset.piece_player_color == player) {
                dom_piece.addEventListener("click", movePiece);
                dom_piece.classList.remove('disabled_piece');
            } else {
                //Also disables all other piece movements
                dom_piece.removeEventListener("click", movePiece);
                // Also grays out disabled pieces
                dom_piece.classList.add('disabled_piece');
            }
        }
        return;
    }

    //It's not the first turn of any player. Everything continues normally.
    for (let dom_piece of allDomPieces) {
        if (dom_piece.parentNode.dataset.piece_player_color == player) {
            dom_piece.addEventListener("click", movePiece);
            dom_piece.classList.remove('disabled_piece');
        } else {
            //Also disables opposite player movements
            dom_piece.removeEventListener("click", movePiece);
            // Also grays out disabled pieces
            dom_piece.classList.add('disabled_piece');
        }
    }
}

function pieceMoviengDisableAllOther() {
    //Disables piece movement for all pieces.
    const allDomPieces = document.getElementsByClassName('cover_div');
    for (let dom_piece of allDomPieces) {
        //The only one that does not get grayed is self.
        if (dom_piece.parentNode != selected_piece_element) {
            dom_piece.removeEventListener("click", movePiece);
            //Adds grayed out to show it's locked
            dom_piece.classList.add('disabled_piece');
        }

    }
}

function changeTurn() {
    //There may be a piece currently moving, should finish that movement
    if (moving_a_piece) {
        releasepiece();
    }

    if (first_turn_white && checkCurrentTurn() == PLAYERS.WHITE) {
        first_turn_white = false;
    }
    if (first_turn_black && checkCurrentTurn() == PLAYERS.BLACK) {
        first_turn_black = false;
    }

    rotateSkipButton();
    current_player_turn = current_player_turn == PLAYERS.WHITE ? PLAYERS.BLACK : PLAYERS.WHITE;
    allowMovementForPlayer(checkCurrentTurn());

    if (DIRECTION == 'portrait'){
        rotateBoard();
    }

    return current_player_turn;
}