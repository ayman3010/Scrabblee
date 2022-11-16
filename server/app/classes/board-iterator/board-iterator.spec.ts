/* eslint-disable @typescript-eslint/no-magic-numbers */
import { MAX_BOARD_WIDTH } from '@app/classes/constants/board-constant';
import { BASIC_COMMAND } from '@app/classes/constants/game-manager-constant';
import { DEFAULT_DICTIONARY_ID } from '@common/constants/dictionary-constants';
import { CommandType, Direction, Orientation } from '@common/enums/enums';
import { Board, Bonus, Position, Tile } from '@common/interfaces/board-interface';
import { PlaceCommand } from '@common/interfaces/command-interface';
import { expect } from 'chai';
import { BoardIterator } from './board-iterator';

describe('BoardIterator Tests', () => {
    let iterator: BoardIterator;
    let command: PlaceCommand;
    let board: Board;
    const tile: Tile[][] = [];

    beforeEach(() => {
        for (let coordH = 0; coordH <= MAX_BOARD_WIDTH; coordH++) {
            tile[coordH] = [];
            for (let coordV = 0; coordV <= MAX_BOARD_WIDTH; coordV++) {
                tile[coordH][coordV] = { bonus: Bonus.Base, tile: { letter: '', value: 0 }, placedThisTurn: false };
            }
        }
        board = { content: tile, dictionaryId: DEFAULT_DICTIONARY_ID, placementAchieved: false };
    });

    it('getCoord() returns the horizontal coordinate when the iterator is horizontal', () => {
        command = JSON.parse(JSON.stringify(BASIC_COMMAND));
        command.orientation = Orientation.Horizontal;
        command.placement.coordH = 6;
        command.placement.coordV = 9;
        iterator = new BoardIterator(command, board);
        expect(iterator.getCoord()).equal(6);
    });

    it('getCoord() returns the vertical coordinate when the iterator is vertical', () => {
        command = JSON.parse(JSON.stringify(BASIC_COMMAND));
        command.orientation = Orientation.Vertical;
        command.placement.coordH = 6;
        command.placement.coordV = 9;
        iterator = new BoardIterator(command, board);
        expect(iterator.getCoord()).equal(9);
    });

    it('getCoords() returns the full current position of the iterator', () => {
        command = JSON.parse(JSON.stringify(BASIC_COMMAND));
        command.orientation = Orientation.Vertical;
        const position: Position = { coordH: 6, coordV: 9 };
        command.placement.coordH = position.coordH;
        command.placement.coordV = position.coordV;
        iterator = new BoardIterator(command, board);
        expect(iterator.getCoords()).eql(position);
    });

    it('getCurrentTile() returns the tile at the current position of the iterator', () => {
        command = JSON.parse(JSON.stringify(BASIC_COMMAND));
        command.orientation = Orientation.Vertical;
        const position: Position = { coordH: 6, coordV: 9 };
        const expectedTile: Tile = board.content[position.coordH][position.coordV];
        command.placement.coordH = position.coordH;
        command.placement.coordV = position.coordV;
        iterator = new BoardIterator(command, board);
        expect(iterator.getCurrentTile()).eql(expectedTile);
    });

    it('setCoord() set the respective coord according to the orientation for horizontal', () => {
        command = JSON.parse(JSON.stringify(BASIC_COMMAND));
        iterator = new BoardIterator(command, board);
        iterator.setCoord(7);
        expect(iterator.getPosition().coordH).equal(7);
    });

    it('setCoord() set the respective coord according to the orientation for vertical', () => {
        command = JSON.parse(JSON.stringify(BASIC_COMMAND));
        command.orientation = Orientation.Vertical;
        iterator = new BoardIterator(command, board);
        iterator.setCoord(7);
        expect(iterator.getPosition().coordV).equal(7);
    });

    it('setPosition() set the respective position for both coords', () => {
        command = JSON.parse(JSON.stringify(BASIC_COMMAND));
        iterator = new BoardIterator(command, board);
        iterator.setPosition({ coordH: 7, coordV: 7 });
        expect(iterator.getPosition().coordH).equal(7);
        expect(iterator.getPosition().coordV).equal(7);
    });

    it('setOrientation() should set the new orientation passe as argument', () => {
        command = JSON.parse(JSON.stringify(BASIC_COMMAND));
        const newOrientation = Orientation.Vertical;
        iterator = new BoardIterator(command, board);
        iterator.setOrientation(newOrientation);
        expect(iterator.getOrientation()).equal(newOrientation);
    });

    it('getPosition() should return the position pf the command', () => {
        command = {
            senderName: '',
            lettersToPlace: 'qwe',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };

        iterator = new BoardIterator(command, board);
        expect(iterator.getPosition().coordH).equal(command.placement.coordH);
        expect(iterator.getPosition().coordV).equal(command.placement.coordV);
    });

    it('checkNeighbor() should return false while checking a right hand neighbor while on a boarder', () => {
        command = {
            senderName: '',
            lettersToPlace: 'qwe',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        const direction = Direction.Right;
        const position = { coordH: 14, coordV: 2 };

        iterator = new BoardIterator(command, board);
        expect(iterator.checkNeighbor(position, direction, board)).equal(false);
    });

    it('checkNeighbor() should return true while checking a right hand neighbor while at that position their is a neighbor', () => {
        command = {
            senderName: '',
            lettersToPlace: 'a',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        const direction = Direction.Right;
        const position = { coordH: 7, coordV: 7 };
        board.content[8][7].tile.letter = 'a';

        iterator = new BoardIterator(command, board);
        expect(iterator.checkNeighbor(position, direction, board)).equal(true);
    });

    it('checkNeighbor() should return false while checking a left hand neighbor while on a boarder', () => {
        command = {
            senderName: '',
            lettersToPlace: 'qwe',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        const direction = Direction.Left;
        const position = { coordH: 0, coordV: 2 };

        iterator = new BoardIterator(command, board);
        expect(iterator.checkNeighbor(position, direction, board)).equal(false);
    });

    it('checkNeighbor() should return true while checking a left hand neighbor while at that position their is a neighbor', () => {
        command = {
            senderName: '',
            lettersToPlace: 'a',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        const direction = Direction.Left;
        const position = { coordH: 7, coordV: 7 };
        board.content[6][7].tile.letter = 'a';

        iterator = new BoardIterator(command, board);
        expect(iterator.checkNeighbor(position, direction, board)).equal(true);
    });

    it('checkNeighbor() should return false while checking in the up direction neighbor while on a boarder', () => {
        command = {
            senderName: '',
            lettersToPlace: 'qwe',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        const direction = Direction.Up;
        const position = { coordH: 2, coordV: 0 };

        iterator = new BoardIterator(command, board);
        expect(iterator.checkNeighbor(position, direction, board)).equal(false);
    });

    it('checkNeighbor() should return true while checking in the up direction while at that position their is a neighbor', () => {
        command = {
            senderName: '',
            lettersToPlace: 'a',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        const direction = Direction.Up;
        const position = { coordH: 7, coordV: 7 };
        board.content[7][6].tile.letter = 'a';

        iterator = new BoardIterator(command, board);
        expect(iterator.checkNeighbor(position, direction, board)).equal(true);
    });

    it('checkNeighbor() should return false while checking in the down direction neighbor while on a boarder', () => {
        command = {
            senderName: '',
            lettersToPlace: 'qwe',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        const direction = Direction.Down;
        const position = { coordH: 2, coordV: 14 };

        iterator = new BoardIterator(command, board);
        expect(iterator.checkNeighbor(position, direction, board)).equal(false);
    });

    it('checkNeighbor() should return true while checking in the up direction while at that position their is a neighbor', () => {
        command = {
            senderName: '',
            lettersToPlace: 'a',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        const direction = Direction.Down;
        const position = { coordH: 7, coordV: 7 };
        board.content[7][8].tile.letter = 'a';

        iterator = new BoardIterator(command, board);
        expect(iterator.checkNeighbor(position, direction, board)).equal(true);
    });

    it('isNeighborFound() should return true while the command orientation is horizontal and it has a up vertical neighbor', () => {
        command = {
            senderName: '',
            lettersToPlace: 'a',
            orientation: Orientation.Horizontal,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        const position = { coordH: 7, coordV: 7 };
        board.content[7][8].tile.letter = 'a';

        iterator = new BoardIterator(command, board);
        expect(iterator.isNeighborFound(position, board)).equal(true);
    });

    it('isNeighborFound() should return true while the command orientation is horizontal and it has a down vertical neighbor', () => {
        command = {
            senderName: '',
            lettersToPlace: 'a',
            orientation: Orientation.Horizontal,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        const position = { coordH: 7, coordV: 7 };
        board.content[7][6].tile.letter = 'a';

        iterator = new BoardIterator(command, board);
        expect(iterator.isNeighborFound(position, board)).equal(true);
    });

    it('isNeighborFound() should return true while the command orientation is horizontal and it has a down vertical neighbor', () => {
        command = {
            senderName: '',
            lettersToPlace: 'a',
            orientation: Orientation.Horizontal,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        const position = { coordH: 7, coordV: 7 };
        board.content[7][8].tile.letter = 'a';

        iterator = new BoardIterator(command, board);
        expect(iterator.isNeighborFound(position, board)).equal(true);
    });

    it('isNeighborFound() should return true while the command orientation is Vertical and it has a left horizontal neighbor', () => {
        command = {
            senderName: '',
            lettersToPlace: 'a',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        const position = { coordH: 7, coordV: 7 };
        board.content[6][7].tile.letter = 'a';

        iterator = new BoardIterator(command, board);
        expect(iterator.isNeighborFound(position, board)).equal(true);
    });

    it('isNeighborFound() should return true while the command orientation is Vertical and it has a right horizontal neighbor', () => {
        command = {
            senderName: '',
            lettersToPlace: 'a',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        const position = { coordH: 7, coordV: 7 };
        board.content[8][7].tile.letter = 'a';

        iterator = new BoardIterator(command, board);
        expect(iterator.isNeighborFound(position, board)).equal(true);
    });
});
