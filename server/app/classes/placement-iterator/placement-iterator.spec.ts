/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { MAX_BOARD_WIDTH, NO_POINTS } from '@app/classes/constants/board-constant';
import { BASIC_COMMAND } from '@app/classes/constants/game-manager-constant';
import { DEFAULT_DICTIONARY_ID } from '@common/constants/dictionary-constants';
import { Bonus, CommandType, Orientation } from '@common/enums/enums';
import { Board, Tile } from '@common/interfaces/board-interface';
import { PlaceCommand } from '@common/interfaces/command-interface';
import { expect } from 'chai';
import { PlacementIterator } from './placement-iterator';

describe('Placement Iterator Tests', () => {
    let iterator: PlacementIterator;
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

    it('isValid() should reutrn false for a placement that has no letters', () => {
        command = {
            senderName: '',
            lettersToPlace: '',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        iterator = new PlacementIterator(command, board);
        expect(iterator.isValid()).equal(false);
    });

    it('isValid() should return true for a placement that has more than 0 letters and that is in the bounds of the board', () => {
        command = {
            senderName: '',
            lettersToPlace: 'vendre',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        iterator = new PlacementIterator(command, board);
        expect(iterator.isValid()).equal(true);
    });

    it('isValid() should return false for a placement that has more than 0 letters and that are out of the bounds of the board', () => {
        command = {
            senderName: '',
            lettersToPlace: 'vendre',
            orientation: Orientation.Vertical,
            placement: { coordH: 15, coordV: 15 },

            commandType: CommandType.Place,
        };
        iterator = new PlacementIterator(command, board);
        expect(iterator.isValid()).equal(false);
    });

    it('isValid() should return false for a placement that has more than 0 letters and that are out of the bounds of the board', () => {
        command = {
            senderName: '',
            lettersToPlace: 'vendre',
            orientation: Orientation.Horizontal,
            placement: { coordH: 15, coordV: 15 },

            commandType: CommandType.Place,
        };
        iterator = new PlacementIterator(command, board);
        expect(iterator.isValid()).equal(false);
    });

    it('next() should return increment the horizontal coord if the orientation is also Horizontal', () => {
        command = {
            senderName: '',
            lettersToPlace: 'vendre',
            orientation: Orientation.Horizontal,

            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        iterator = new PlacementIterator(command, board);
        iterator.next();
        expect(iterator.getCoord()).equal(7 + 1);
    });

    it('next() should return increment the vertical coord if the orientation is also Vertical', () => {
        command = {
            senderName: '',
            lettersToPlace: 'vendre',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },

            commandType: CommandType.Place,
        };
        iterator = new PlacementIterator(command, board);
        iterator.next();
        expect(iterator.getCoord()).equal(7 + 1);
    });

    it('getModifiedPosition() should modify only the horizontal coordinate when the command orientation is horizontal', () => {
        command = {
            senderName: '',
            lettersToPlace: 'vendre',
            orientation: Orientation.Horizontal,
            placement: { coordH: 7, coordV: 7 },

            commandType: CommandType.Place,
        };
        const newCoord = 5;
        iterator = new PlacementIterator(command, board);
        const position = iterator.getModifiedPosition(newCoord);
        expect(position.coordH).equal(newCoord);
        expect(position.coordV).equal(command.placement.coordV);
    });

    it('getModifiedPosition() should modify only the vertical coordinate when the command orientation is vertical', () => {
        command = {
            senderName: '',
            lettersToPlace: 'vendre',
            orientation: Orientation.Vertical,

            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        const newCoord = 5;
        iterator = new PlacementIterator(command, board);
        const position = iterator.getModifiedPosition(newCoord);
        expect(position.coordV).equal(newCoord);
        expect(position.coordH).equal(command.placement.coordH);
    });

    it('getTileAtCoord() should return the tile at the horizontal coord if the command orientation is horizontal', () => {
        command = {
            senderName: '',
            lettersToPlace: 'vendre',
            orientation: Orientation.Horizontal,

            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        board.content[8][7].tile.letter = 'a';
        const newCoord = 8;
        iterator = new PlacementIterator(command, board);
        expect(iterator.getTileAtCoord(newCoord).tile.letter).equal('a');
    });

    it('getTileAtCoord() should return the tile at the vertical coord if the command orientation is vertical', () => {
        command = {
            senderName: '',
            lettersToPlace: 'vendre',
            orientation: Orientation.Vertical,

            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        board.content[7][8].tile.letter = 'a';
        const newCoord = 8;
        iterator = new PlacementIterator(command, board);
        expect(iterator.getTileAtCoord(newCoord).tile.letter).equal('a');
    });

    it('placeLetter() should place a letter if there is no letter placed and increment the nbLetterPlaced', () => {
        command = {
            senderName: '',
            lettersToPlace: 'v',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },

            commandType: CommandType.Place,
        };
        iterator = new PlacementIterator(command, board);
        iterator.placeLetter();
        expect(board.content[7][7].tile.letter).equal('v');
        expect(iterator.nbLetterPlaced).equal(1);
    });

    it('placeLetter() should not place a letter if there is annother letter placed at that position', () => {
        command = {
            senderName: '',
            lettersToPlace: 'a',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },

            commandType: CommandType.Place,
        };
        board.content[7][7].tile.letter = 'v';
        iterator = new PlacementIterator(command, board);
        iterator.placeLetter();
        expect(board.content[7][7].tile.letter).equal('v');
        expect(iterator.nbLetterPlaced).equal(0);
    });

    it('removeLetter() should remove the letter placed by a placement indicated in the command and if the placement was made this turn', () => {
        command = {
            senderName: '',
            lettersToPlace: 'v',

            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        board.content[7][7].tile.letter = 'v';
        board.content[7][7].placedThisTurn = true;

        iterator = new PlacementIterator(command, board);
        iterator.removeLetter();
        expect(board.content[7][7].tile.letter).equal('');
    });
    it('removeLetter() should not remove the letter placed by the command and if the placement was not made this turn', () => {
        command = {
            senderName: '',
            lettersToPlace: 'v',
            orientation: Orientation.Vertical,

            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        board.content[7][7].tile.letter = 'v';

        iterator = new PlacementIterator(command, board);
        iterator.removeLetter();
        expect(board.content[7][7].tile.letter).equal('v');
    });

    it('removeCheck() should remove the placedthisturn check if the placement failed', () => {
        command = {
            senderName: '',
            lettersToPlace: 'v',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },

            commandType: CommandType.Place,
        };
        board.content[7][7].tile.letter = 'v';
        board.content[7][7].placedThisTurn = true;

        iterator = new PlacementIterator(command, board);
        iterator.removeCheck();
        expect(board.content[7][7].placedThisTurn).equal(false);
    });

    it('removeCheck() should not remove the placedthisturn check if the placement failed but the letter was not placed by the last command', () => {
        command = {
            senderName: '',
            lettersToPlace: 'qwe',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },

            commandType: CommandType.Place,
        };
        board.content[7][7].tile.letter = 'v';
        board.content[7][7].placedThisTurn = true;

        iterator = new PlacementIterator(command, board);
        iterator.removeCheck();
        expect(board.content[7][7].placedThisTurn).equal(true);
    });

    it('if placeLetter places a letter from a bonus tile, it sets its value to 0', () => {
        command = {
            senderName: '',
            lettersToPlace: 'Tente',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },

            commandType: CommandType.Place,
        };

        iterator = new PlacementIterator(command, board);
        iterator.placeLetter();
        expect(board.content[7][7].tile.value).equal(NO_POINTS);
    });

    it('getNbCheckedRemoved() should return the number of checkedRemoved', () => {
        command = BASIC_COMMAND;
        iterator = new PlacementIterator(command, board);
        expect(iterator.getNbCheckedRemoved()).equal(0);
    });

    it('getLetterAtPosition() should return the letter at the specified position', () => {
        command = BASIC_COMMAND;
        board.content[0][0].tile.letter = 'a';
        iterator = new PlacementIterator(command, board);

        expect(iterator.getLetterAtPosition({ coordH: 0, coordV: 0 })).equal('a');
    });

    it('setCoordWithOrientation() should set the coordinate of the corresponding Vertical Orientation ', () => {
        command = BASIC_COMMAND;
        iterator = new PlacementIterator(command, board);
        iterator.setCoordWithOrientation(7, Orientation.Vertical);
        expect(iterator.getPosition().coordV).equal(7);
    });

    it('setCoordWithOrientation() should set the coordinate of the corresponding Horizontal Orientation', () => {
        command = BASIC_COMMAND;
        iterator = new PlacementIterator(command, board);
        iterator.setCoordWithOrientation(7, Orientation.Horizontal);
        expect(iterator.getPosition().coordH).equal(7);
    });

    it('setCoordWithOrientation() should return the coordinate of the corresponding VErtical Orientation', () => {
        command = BASIC_COMMAND;
        iterator = new PlacementIterator(command, board);
        command.orientation = Orientation.Vertical;
        expect(iterator.getCoordWithOrientation(Orientation.Vertical)).equal(iterator.getCoord());
    });

    it('setCoordWithOrientation() should return the coordinate of the corresponding Horizontal Orientation', () => {
        command = BASIC_COMMAND;
        iterator = new PlacementIterator(command, board);
        command.orientation = Orientation.Horizontal;
        expect(iterator.getCoordWithOrientation(Orientation.Horizontal)).equal(iterator.getCoord());
    });

    it('getOppositeOrientation() should return the opposite Orientation of the orientation argument', () => {
        command = BASIC_COMMAND;
        iterator = new PlacementIterator(command, board);
        expect(iterator.getOppositeOrientation(Orientation.Horizontal)).equal(Orientation.Vertical);
    });

    it('getOppositeOrientation() should return the opposite Orientation of the orientation argument', () => {
        command = BASIC_COMMAND;
        iterator = new PlacementIterator(command, board);
        expect(iterator.getOppositeOrientation(Orientation.Vertical)).equal(Orientation.Horizontal);
    });

    it('getHorizontalRightNeighbor() should return the right hand neighbor of that position', () => {
        command = BASIC_COMMAND;
        board.content[1][0].tile.letter = 'a';
        iterator = new PlacementIterator(command, board);
        expect(iterator.getHorizontalRightNeighbor({ coordH: 0, coordV: 0 }, board)).equal('a');
    });

    it('getHorizontalRightNeighbor() should return no neighbor if the horizontal coord is on the right boarder', () => {
        command = BASIC_COMMAND;
        iterator = new PlacementIterator(command, board);
        expect(iterator.getHorizontalRightNeighbor({ coordH: 14, coordV: 0 }, board)).equal('');
    });

    it('getHorizontalLeftNeighbor() should return the left hand neighbor of that position', () => {
        command = BASIC_COMMAND;
        board.content[0][0].tile.letter = 'a';
        iterator = new PlacementIterator(command, board);
        expect(iterator.getHorizontalLeftNeighbor({ coordH: 1, coordV: 0 }, board)).equal('a');
    });

    it('getHorizontalLeftNeighbor() should return no neighbor if the horizontal coord is on the left boarder', () => {
        command = BASIC_COMMAND;
        iterator = new PlacementIterator(command, board);
        expect(iterator.getHorizontalLeftNeighbor({ coordH: 0, coordV: 0 }, board)).equal('');
    });

    it('getVerticalUpNeighbor() should return the upper hand neighbor of that position', () => {
        command = BASIC_COMMAND;
        board.content[0][0].tile.letter = 'a';
        iterator = new PlacementIterator(command, board);
        expect(iterator.getVerticalUpNeighbor({ coordH: 0, coordV: 1 }, board)).equal('a');
    });

    it('getVerticalUpNeighbor() should return no neighbor if the vertical coord is on the top boarder', () => {
        command = BASIC_COMMAND;
        iterator = new PlacementIterator(command, board);
        expect(iterator.getVerticalUpNeighbor({ coordH: 0, coordV: 0 }, board)).equal('');
    });

    it('getVerticalDownNeighbor() should return the lower hand neighbor of that position', () => {
        command = BASIC_COMMAND;
        board.content[0][1].tile.letter = 'a';
        iterator = new PlacementIterator(command, board);
        expect(iterator.getVerticalDownNeighbor({ coordH: 0, coordV: 0 }, board)).equal('a');
    });

    it('getVerticalDownNeighbor() should return no neighbor if the position is on the lower boarder', () => {
        command = BASIC_COMMAND;
        iterator = new PlacementIterator(command, board);
        expect(iterator.getVerticalDownNeighbor({ coordH: 0, coordV: 14 }, board)).equal('');
    });

    it('getDirectionalNeighbor() should return the right hand neighbor of that position when the orientation is Horizontal', () => {
        command = BASIC_COMMAND;
        board.content[1][0].tile.letter = 'a';
        command.orientation = Orientation.Horizontal;
        iterator = new PlacementIterator(command, board);
        expect(iterator.getDirectionalNeighbor({ coordH: 0, coordV: 0 }, board)).equal('a');
    });

    it('getDirectionalNeighbor() should return the lower hand neighbor of that position', () => {
        command = BASIC_COMMAND;
        board.content[0][1].tile.letter = 'a';
        command.orientation = Orientation.Vertical;
        iterator = new PlacementIterator(command, board);
        expect(iterator.getDirectionalNeighbor({ coordH: 0, coordV: 0 }, board)).equal('a');
    });
});
