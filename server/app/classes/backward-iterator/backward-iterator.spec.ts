/* eslint-disable @typescript-eslint/no-magic-numbers */
import { MAX_BOARD_WIDTH } from '@app/classes/constants/board-constant';
import { DEFAULT_DICTIONARY_ID } from '@common/constants/dictionary-constants';
import { CommandType, Orientation } from '@common/enums/enums';
import { Board, Bonus, Tile } from '@common/interfaces/board-interface';
import { PlaceCommand } from '@common/interfaces/command-interface';
import { expect } from 'chai';
import { BackwardIterator } from './backward-iterator';

describe('BackwardIterator Tests', () => {
    let iterator: BackwardIterator;
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

    it('previous() should return decrement the previousV value if the orientation is also Vertical', () => {
        command = {
            senderName: '',
            lettersToPlace: 'vendre',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        iterator = new BackwardIterator(command, board);
        iterator.previous();
        expect(iterator.getPrevious()).equal(7 - 1);
    });

    it('previous() should return decrement the previousV value if the orientation is also Vertical', () => {
        command = {
            senderName: '',
            lettersToPlace: 'vendre',
            orientation: Orientation.Vertical,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        iterator = new BackwardIterator(command, board);
        iterator.previous();
        expect(iterator.getPrevious()).equal(7 - 1);
    });

    it('previous() should return decrement the previousV value if the orientation is also Vertical', () => {
        command = {
            senderName: '',
            lettersToPlace: 'vendre',
            orientation: Orientation.Horizontal,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        iterator = new BackwardIterator(command, board);
        iterator.previous();
        expect(iterator.getPrevious()).equal(7 - 1);
    });

    it('getOrientation() should return the orientation of the command', () => {
        command = {
            senderName: '',
            lettersToPlace: 'vendre',
            orientation: Orientation.Horizontal,
            placement: { coordH: 7, coordV: 7 },
            commandType: CommandType.Place,
        };
        iterator = new BackwardIterator(command, board);
        iterator.previous();
        expect(iterator.getOrientation()).equal(Orientation.Horizontal);
    });
});
