const SYSTEM_VERSION = '1.0.1';

const BOARD = document.getElementById('board');
const CONTROLS_SELECTION = document.getElementById('controls');

const DIRECTION = window.innerWidth >= window.innerHeight ? 'landscape' : 'portrait';
//const RAD = w / 5;
const TAU = Math.PI * 2;

const LAYERS = 2;
const HEX_WIDTH = Math.max(window.innerWidth, window.innerHeight) * 0.05;
const HEX_HEIGHT = HEX_WIDTH;
//const HEX_HEIGHT = window.innerHeight * 0.05 + 5;
const RAD = HEX_WIDTH * 2;
const CENTER_X = window.innerWidth / 2 - (HEX_WIDTH / 2);
const CENTER_Y = window.innerHeight / 2 - (HEX_HEIGHT / 2);

let first_turn_white = true;
let first_turn_black = true;


let selected_piece_element;
let selected_piece_object;
let moving_a_piece = false;

const CELL_ARRAY = [];
const PIECE_ARRAY = [];

const PLAYERS = {
    BLACK: 'negro',
    WHITE: 'blanco',
}

let current_player_turn = PLAYERS.WHITE;

const DATA_TYPES = {
    CELL: 'CELL',
    PIECE: 'PIECE',
}
const DIRECTION_TYPES = {
    TOP_LEFT: 'top_left',
    TOP_RIGHT: 'top_right',
    MIDDLE_LEFT: 'middle_left',
    MIDDLE_RIGHT: 'middle_right',
    BOTTOM_LEFT: 'bottom_left',
    BOTTOM_RIGHT: 'bottom_right',
}

const COLORS = {
    ORANGE: {
        color: 'orange',
        hex: '#ff5624'
    },
    MAGENTA: {
        color: 'magenta',
        hex: '#872996'
    },
    GREEN: {
        color: 'green',
        hex: '#44b94a'
    },
    GRAY: {
        color: 'gray',
        hex: '#c1cac8'
    },
    YELLOW: {
        color: 'yellow',
        hex: '#ffe951'
    },
    BLUE: {
        color: 'blue',
        hex: '#162061'
    },
}

const NOTIFICATION_TYPES = {
    VICTORY_MODAL: 'victory modal',
    INSTRUCTIONS: 'instructions',
    ABOUT: 'about',
}

class Piece {
    constructor(pieceId, player) {
        this.pieceId = pieceId;
        this.player = player;
        this.cellId = null;
        //Define Colours depending on piece
        //Pieces and color are defined and cannot be random. It must be like this.
        switch (pieceId) {
            case 1:
                this.setcolor_top_left = COLORS.ORANGE;
                this.setcolor_top_right = COLORS.MAGENTA;
                this.setcolor_middle_left = COLORS.ORANGE;
                this.setcolor_middle_right = COLORS.MAGENTA;
                this.setcolor_bottom_left = COLORS.GREEN;
                this.setcolor_bottom_right = COLORS.GRAY;
                if (this.player == PLAYERS.BLACK) {
                    this.imgTitle = "./imgs/FichasNegras/black-01.svg"
                } else {
                    this.imgTitle = "./imgs/FichasBlancas/white-01.svg"
                }
                break;
            case 2:
                this.setcolor_top_left = COLORS.ORANGE;
                this.setcolor_top_right = COLORS.YELLOW;
                this.setcolor_middle_left = COLORS.GRAY;
                this.setcolor_middle_right = COLORS.YELLOW;
                this.setcolor_bottom_left = COLORS.GREEN;
                this.setcolor_bottom_right = COLORS.ORANGE;
                if (this.player == PLAYERS.BLACK) {
                    this.imgTitle = "./imgs/FichasNegras/black-02.svg"
                } else {
                    this.imgTitle = "./imgs/FichasBlancas/white-02.svg"
                }
                break;
            case 3:
                this.setcolor_top_left = COLORS.ORANGE;
                this.setcolor_top_right = COLORS.YELLOW;
                this.setcolor_middle_left = COLORS.ORANGE;
                this.setcolor_middle_right = COLORS.GREEN;
                this.setcolor_bottom_left = COLORS.GRAY;
                this.setcolor_bottom_right = COLORS.MAGENTA;
                if (this.player == PLAYERS.BLACK) {
                    this.imgTitle = "./imgs/FichasNegras/black-03.svg"
                } else {
                    this.imgTitle = "./imgs/FichasBlancas/white-03.svg"
                }
                break;
            case 4:
                this.setcolor_top_left = COLORS.BLUE;
                this.setcolor_top_right = COLORS.BLUE;
                this.setcolor_middle_left = COLORS.ORANGE;
                this.setcolor_middle_right = COLORS.MAGENTA;
                this.setcolor_bottom_left = COLORS.GREEN;
                this.setcolor_bottom_right = COLORS.GRAY;
                if (this.player == PLAYERS.BLACK) {
                    this.imgTitle = "./imgs/FichasNegras/black-04.svg"
                } else {
                    this.imgTitle = "./imgs/FichasBlancas/white-04.svg"
                }
                break;
            case 5:
                //QUDAK PIECE !!
                this.setcolor_top_left = COLORS.GRAY;
                this.setcolor_top_right = COLORS.GREEN;
                this.setcolor_middle_left = COLORS.BLUE;
                this.setcolor_middle_right = COLORS.MAGENTA;
                this.setcolor_bottom_left = COLORS.YELLOW;
                this.setcolor_bottom_right = COLORS.ORANGE;
                if (this.player == PLAYERS.BLACK) {
                    this.imgTitle = "./imgs/FichasNegras/black-Qudak.svg"
                } else {
                    this.imgTitle = "./imgs/FichasBlancas/white-Qudak.svg"
                }
                break;
            case 6:
                this.setcolor_top_left = COLORS.BLUE;
                this.setcolor_top_right = COLORS.GRAY;
                this.setcolor_middle_left = COLORS.YELLOW;
                this.setcolor_middle_right = COLORS.MAGENTA;
                this.setcolor_bottom_left = COLORS.GREEN;
                this.setcolor_bottom_right = COLORS.YELLOW;
                if (this.player == PLAYERS.BLACK) {
                    this.imgTitle = "./imgs/FichasNegras/black-06.svg"
                } else {
                    this.imgTitle = "./imgs/FichasBlancas/white-06.svg"
                }
                break;
            case 7:
                this.setcolor_top_left = COLORS.BLUE;
                this.setcolor_top_right = COLORS.YELLOW;
                this.setcolor_middle_left = COLORS.ORANGE;
                this.setcolor_middle_right = COLORS.MAGENTA;
                this.setcolor_bottom_left = COLORS.GREEN;
                this.setcolor_bottom_right = COLORS.ORANGE;
                if (this.player == PLAYERS.BLACK) {
                    this.imgTitle = "./imgs/FichasNegras/black-07.svg"
                } else {
                    this.imgTitle = "./imgs/FichasBlancas/white-07.svg"
                }
                break;
            case 8:
                this.setcolor_top_left = COLORS.GREEN;
                this.setcolor_top_right = COLORS.GREEN;
                this.setcolor_middle_left = COLORS.ORANGE;
                this.setcolor_middle_right = COLORS.MAGENTA;
                this.setcolor_bottom_left = COLORS.BLUE;
                this.setcolor_bottom_right = COLORS.ORANGE;
                if (this.player == PLAYERS.BLACK) {
                    this.imgTitle = "./imgs/FichasNegras/black-08.svg"
                } else {
                    this.imgTitle = "./imgs/FichasBlancas/white-08.svg"
                }
                break;
            case 9:
                this.setcolor_top_left = COLORS.BLUE;
                this.setcolor_top_right = COLORS.YELLOW;
                this.setcolor_middle_left = COLORS.MAGENTA;
                this.setcolor_middle_right = COLORS.ORANGE;
                this.setcolor_bottom_left = COLORS.GRAY;
                this.setcolor_bottom_right = COLORS.ORANGE;
                if (this.player == PLAYERS.BLACK) {
                    this.imgTitle = "./imgs/FichasNegras/black-09.svg"
                } else {
                    this.imgTitle = "./imgs/FichasBlancas/white-09.svg"
                }
                break;
            case 10:
                this.setcolor_top_left = COLORS.BLUE;
                this.setcolor_top_right = COLORS.YELLOW;
                this.setcolor_middle_left = COLORS.ORANGE;
                this.setcolor_middle_right = COLORS.MAGENTA;
                this.setcolor_bottom_left = COLORS.GREEN;
                this.setcolor_bottom_right = COLORS.ORANGE;
                if (this.player == PLAYERS.BLACK) {
                    this.imgTitle = "./imgs/FichasNegras/black-10.svg"
                } else {
                    this.imgTitle = "./imgs/FichasBlancas/white-10.svg"
                }
                break;
            case 11:
                this.setcolor_top_left = COLORS.GREEN;
                this.setcolor_top_right = COLORS.YELLOW;
                this.setcolor_middle_left = COLORS.ORANGE;
                this.setcolor_middle_right = COLORS.ORANGE;
                this.setcolor_bottom_left = COLORS.BLUE;
                this.setcolor_bottom_right = COLORS.MAGENTA;
                if (this.player == PLAYERS.BLACK) {
                    this.imgTitle = "./imgs/FichasNegras/black-11.svg"
                } else {
                    this.imgTitle = "./imgs/FichasBlancas/white-11.svg"
                }
                break;
        }

    }
    get getCellId() {
        return this.cellId;
    }
    get getPieceId() {
        return this.pieceId;
    }
    get getPlayer() {
        return this.player;
    }
    get getimgTitle() {
        return this.imgTitle;
    }
    get getcolor_top_left() {
        return this.color_top_left;
    }
    get getcolor_top_right() {
        return this.color_top_right;
    }
    get getcolor_middle_left() {
        return this.color_middle_left;
    }
    get getcolor_middle_right() {
        return this.color_middle_right;
    }
    get getcolor_bottom_left() {
        return this.color_bottom_left;
    }
    get getcolor_bottom_right() {
        return this.color_bottom_right;
    }

    set setcolor_top_left(newColor) {
        this.color_top_left = newColor;
    }
    set setcolor_top_right(newColor) {
        this.color_top_right = newColor;
    }
    set setcolor_middle_left(newColor) {
        this.color_middle_left = newColor;
    }
    set setcolor_middle_right(newColor) {
        this.color_middle_right = newColor;
    }
    set setcolor_bottom_left(newColor) {
        this.color_bottom_left = newColor;
    }
    set setcolor_bottom_right(newColor) {
        this.color_bottom_right = newColor;
    }

    set setCellId(newCell) {
        this.cellId = newCell;
    }
}


class Cell {
    constructor(posX, posY, cellId) {
        this.posX = posX;
        this.posY = posY;
        this.cellId = cellId;
        this.isEmpty = true;
        this.cell_top_left = null;
        this.cell_top_right = null;
        this.cell_middle_left = null;
        this.cell_middle_right = null;
        this.cell_bottom_left = null;
        this.cell_bottom_right = null;
    }

    get getPosX() {
        return this.posX;
    }
    get getPosY() {
        return this.posY;
    }
    get getIsEmpty() {
        return this.isEmpty;
    }
    get getCellId() {
        return this.cellId;
    }
    get getcell_top_left() {
        return this.cell_top_left;
    }
    get getcell_top_right() {
        return this.cell_top_right;
    }
    get getcell_middle_left() {
        return this.cell_middle_left;
    }
    get getcell_middle_right() {
        return this.cell_middle_right;
    }
    get getcell_bottom_left() {
        return this.cell_bottom_left;
    }
    get getcell_bottom_right() {
        return this.cell_bottom_right;
    }


    set setPosX(newPos) {
        this.posX = newPos;
    }
    set setPosY(newPos) {
        this.posY = newPos;
    }
    set setIsEmpty(newValue) {
        this.isEmpty = newValue;
    }
    set setCellId(newCellId) {
        this.cellId = newCellId;
    }
    set setcell_top_left(newCell) {
        this.cell_top_left = newCell;
    }
    set setcell_top_right(newCell) {
        this.cell_top_right = newCell;
    }
    set setcell_middle_left(newCell) {
        this.cell_middle_left = newCell;
    }
    set setcell_middle_right(newCell) {
        this.cell_middle_right = newCell;
    }
    set setcell_bottom_left(newCell) {
        this.cell_bottom_left = newCell;
    }
    set setcell_bottom_right(newCell) {
        this.cell_bottom_right = newCell;
    }
}