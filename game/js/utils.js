function returnPieceObjectFromElementEquivalent(piece_element) {
    //Recieves a dom element piece and returns it's equivalent's object
    return PIECE_ARRAY.find((piece) => {
        return piece.getPieceId == piece_element.dataset.piece_number &&
            piece.getPlayer == piece_element.dataset.piece_player_color;
    });
}

function returnPieceElementFromObjectEquivalent(piece_object) {
    //Recieves a piece object and returns it's equivalent's element
    return document.getElementById(`Player_${piece_object.getPlayer}-Piece_${piece_object.getPieceId}`);
}

function returnCellObjectFromElementEquivalent(cell_element){
    //Recieves a dom element cell and returns it's equivalent's object
    return CELL_ARRAY.find((cell) => {
        return cell.getCellId == cell_element.id
    });
}

function sychronizeWithArray(arrayToBeSynchronized, updatedObject, dataType) {
    //This function receives an array and an object that should be same type as array objects, finds it's own position in array and updates itself 
    arrayToBeSynchronized.forEach((element, index) => {
        if (dataType === DATA_TYPES.PIECE) {

            // This works only for pieces
            if (element.getPieceId === updatedObject.getPieceId &&
                element.getPlayer === updatedObject.getPlayer) {
                arrayToBeSynchronized[index] = updatedObject;
            }
        }

        if (dataType === DATA_TYPES.CELL) {
            // This works only for cells
            if (element.cellId === updatedObject.cellId) {
                arrayToBeSynchronized[index] = updatedObject;
            }
        }

    });
    localStorage.setItem(DATA_TYPES.PIECE, JSON.stringify(PIECE_ARRAY))

};

function updatePieceZIndex(piece_object) {
    //Finds the piece equivalent in dom and sets its z-index to top everything else

    for (let piece of document.getElementsByClassName('piece')) {
        if (piece.dataset.piece_number == piece_object.getPieceId && piece.dataset.piece_player_color == piece_object.getPlayer) {
            piece.dataset.z_index = PIECE_ARRAY.length;
            piece.style.zIndex = `${PIECE_ARRAY.length}`;
        } else {
            piece.dataset.z_index = PIECE_ARRAY.lastIndexOf(piece_object);
            piece.style.zIndex = `${PIECE_ARRAY.lastIndexOf(piece_object)}`;
        }
    }
}


function getOppositeDirection(direction) {
    //returns a string with the oposite direction
    switch (direction) {
        case DIRECTION_TYPES.TOP_LEFT:
            return DIRECTION_TYPES.BOTTOM_RIGHT;
        case DIRECTION_TYPES.TOP_RIGHT:
            return DIRECTION_TYPES.BOTTOM_LEFT;
        case DIRECTION_TYPES.MIDDLE_LEFT:
            return DIRECTION_TYPES.MIDDLE_RIGHT;
        case DIRECTION_TYPES.MIDDLE_RIGHT:
            return DIRECTION_TYPES.MIDDLE_LEFT;
        case DIRECTION_TYPES.BOTTOM_LEFT:
            return DIRECTION_TYPES.TOP_RIGHT;
        case DIRECTION_TYPES.BOTTOM_RIGHT:
            return DIRECTION_TYPES.TOP_LEFT;
        default:
            return 'ERROR';
    }
}


function reset_game(){
    location.reload();
}