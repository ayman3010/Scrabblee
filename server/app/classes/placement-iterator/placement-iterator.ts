import { BoardIterator } from '@app/classes/board-iterator/board-iterator';
import { LETTERS_VALUE, MAX_BOARD_WIDTH, MIN_BOARD_WIDTH, NO_LETTER, NO_POINTS } from '@app/classes/constants/board-constant';
import { Orientation } from '@common/enums/enums';
import { Board, Bonus, Position } from '@common/interfaces/board-interface';
import { PlaceCommand } from '@common/interfaces/command-interface';

export class PlacementIterator extends BoardIterator {
    board: Board;

    private lettersToPlace: string;
    private lettersToRemove: string;
    private letterCount: number;
    private nbCheckedRemoved: number;
    private placedLettersPositions: Position[];

    constructor(command: PlaceCommand, board: Board) {
        super(command, board);
        this.lettersToPlace = command.lettersToPlace;
        this.lettersToRemove = command.lettersToPlace;
        this.letterCount = 0;
        this.nbLetterPlaced = 0;
        this.nbLetterRemoved = 0;
        this.nbCheckedRemoved = 0;
        this.placedLettersPositions = [];
    }

    isValid(): boolean {
        if (this.lettersToPlace.length === 0) return false;

        return super.getOrientation() === Orientation.Horizontal
            ? this.coordH > MIN_BOARD_WIDTH - 1 && this.coordH < MAX_BOARD_WIDTH + 1
            : this.coordV > MIN_BOARD_WIDTH - 1 && this.coordV < MAX_BOARD_WIDTH + 1;
    }

    next(): void {
        if (super.getOrientation() === Orientation.Horizontal) {
            this.coordH += 1;
        } else {
            this.coordV += 1;
        }
    }

    placeLetter(): void {
        if (this.board.content[this.coordH][this.coordV].tile.letter === NO_LETTER) {
            this.board.content[this.coordH][this.coordV].tile.letter = this.lettersToPlace[this.letterCount];
            if (this.lettersToPlace[this.letterCount] === this.lettersToPlace[this.letterCount].toUpperCase()) {
                this.board.content[this.coordH][this.coordV].tile.value = NO_POINTS;
            } else {
                this.board.content[this.coordH][this.coordV].tile.value = LETTERS_VALUE[this.lettersToPlace[this.letterCount].toUpperCase()];
            }
            this.board.content[this.coordH][this.coordV].placedThisTurn = true;
            this.placedLettersPositions.push(this.getCoords());
            this.letterCount++;
            this.nbLetterPlaced++;
        }
    }

    removeLetters(coords: Position[]): void {
        for (const coord of coords) {
            this.board.content[coord.coordH][coord.coordV].tile.letter = NO_LETTER;
            this.board.content[coord.coordH][coord.coordV].placedThisTurn = false;
        }
    }

    removeLetter(): void {
        if (
            this.board.content[this.coordH][this.coordV].tile.letter === this.lettersToRemove[this.letterCount] &&
            this.board.content[this.coordH][this.coordV].placedThisTurn
        ) {
            this.board.content[this.coordH][this.coordV].tile.letter = NO_LETTER;
            this.board.content[this.coordH][this.coordV].placedThisTurn = false;
            this.letterCount++;
            this.nbLetterRemoved++;
        }
    }

    removeCheck(): void {
        if (
            this.board.content[this.coordH][this.coordV].tile.letter === this.lettersToPlace[this.letterCount] &&
            this.board.content[this.coordH][this.coordV].placedThisTurn
        ) {
            this.board.content[this.coordH][this.coordV].placedThisTurn = false;
            this.letterCount++;
            this.nbCheckedRemoved++;
        }
    }

    removeChecksAndBonuses(coords: Position[]): void {
        for (const coord of coords) {
            this.board.content[coord.coordH][coord.coordV].placedThisTurn = false;
            this.board.content[coord.coordH][coord.coordV].bonus = Bonus.Base;
        }
    }

    getPlacedLettersPositions(): Position[] {
        return this.placedLettersPositions;
    }

    getNbCheckedRemoved(): number {
        return this.nbCheckedRemoved;
    }

    getOppositeOrientation(orientation: Orientation): Orientation {
        return orientation === Orientation.Horizontal ? Orientation.Vertical : Orientation.Horizontal;
    }

    getLetterAtPosition(position: Position): string {
        return this.board.content[position.coordH][position.coordV].tile.letter;
    }

    getCoordWithOrientation(orientation: Orientation): number {
        return orientation === Orientation.Horizontal ? this.coordH : this.coordV;
    }

    setCoordWithOrientation(coord: number, orientation: Orientation): void {
        if (orientation === Orientation.Horizontal) {
            this.coordH = coord;
        } else this.coordV = coord;
    }

    getDirectionalNeighbor(position: Position, board: Board): string {
        return this.orientation === Orientation.Horizontal
            ? this.getHorizontalRightNeighbor(position, board)
            : this.getVerticalDownNeighbor(position, board);
    }

    getHorizontalRightNeighbor(position: Position, board: Board): string {
        if (position.coordH >= MAX_BOARD_WIDTH) {
            return '';
        }
        return board.content[position.coordH + 1][position.coordV].tile.letter;
    }

    getHorizontalLeftNeighbor(position: Position, board: Board): string {
        if (position.coordH <= MIN_BOARD_WIDTH) {
            return '';
        }
        return board.content[position.coordH - 1][position.coordV].tile.letter;
    }

    getVerticalUpNeighbor(position: Position, board: Board): string {
        if (position.coordV <= MIN_BOARD_WIDTH) {
            return '';
        }
        return board.content[position.coordH][position.coordV - 1].tile.letter;
    }

    getVerticalDownNeighbor(position: Position, board: Board): string {
        if (position.coordV >= MAX_BOARD_WIDTH) {
            return '';
        }
        return board.content[position.coordH][position.coordV + 1].tile.letter;
    }
}
