import { MAX_BOARD_WIDTH, MIN_BOARD_WIDTH } from '@app/classes/constants/board-constant';
import { Direction, Orientation } from '@common/enums/enums';
import { Board, Position, Tile } from '@common/interfaces/board-interface';
import { PlaceCommand } from '@common/interfaces/command-interface';

export class BoardIterator {
    board: Board;

    nbLetterPlaced: number;
    nbLetterRemoved: number;
    previousValueH: number;
    previousValueV: number;

    protected orientation: Orientation;
    protected coordH: number;
    protected coordV: number;

    constructor(command: PlaceCommand, board: Board) {
        this.orientation = command.orientation;
        this.board = board;
        this.coordH = command.placement.coordH;
        this.coordV = command.placement.coordV;
        this.previousValueV = this.coordV;
        this.previousValueH = this.coordH;
    }

    getCoord(): number {
        return this.orientation === Orientation.Horizontal ? this.coordH : this.coordV;
    }

    getCoords(): Position {
        return { coordH: this.coordH, coordV: this.coordV };
    }

    getCurrentTile(): Tile {
        return this.board.content[this.coordH][this.coordV];
    }

    setCoord(coord: number): void {
        if (this.orientation === Orientation.Horizontal) {
            this.coordH = coord;
        } else this.coordV = coord;
    }

    getPosition(): Position {
        return { coordH: this.coordH, coordV: this.coordV };
    }

    setPosition(position: Position): void {
        this.coordH = position.coordH;
        this.coordV = position.coordV;
    }

    getOrientation(): Orientation {
        return this.orientation;
    }

    setOrientation(orientation: Orientation): void {
        this.orientation = orientation;
    }

    getModifiedPosition(coord: number): Position {
        return this.orientation === Orientation.Horizontal ? { coordH: coord, coordV: this.coordV } : { coordH: this.coordH, coordV: coord };
    }

    getTileAtCoord(coord: number): Tile {
        return this.orientation === Orientation.Horizontal ? this.board.content[coord][this.coordV] : this.board.content[this.coordH][coord];
    }

    isNeighborFound(position: Position, board: Board): boolean {
        return this.orientation === Orientation.Horizontal
            ? this.checkNeighbor(position, Direction.Up, board) || this.checkNeighbor(position, Direction.Down, board)
            : this.checkNeighbor(position, Direction.Right, board) || this.checkNeighbor(position, Direction.Left, board);
    }

    checkNeighbor(position: Position, direction: Direction, board: Board): boolean {
        switch (direction) {
            case Direction.Right:
                if (position.coordH === MAX_BOARD_WIDTH) {
                    return false;
                }
                return board.content[position.coordH + 1][position.coordV].tile.letter !== '';
            case Direction.Left:
                if (position.coordH === MIN_BOARD_WIDTH) {
                    return false;
                }
                return board.content[position.coordH - 1][position.coordV].tile.letter !== '';
            case Direction.Up:
                if (position.coordV === MIN_BOARD_WIDTH) {
                    return false;
                }
                return board.content[position.coordH][position.coordV - 1].tile.letter !== '';
            case Direction.Down:
                if (position.coordV === MAX_BOARD_WIDTH) {
                    return false;
                }
                return board.content[position.coordH][position.coordV + 1].tile.letter !== '';
        }
    }
}
