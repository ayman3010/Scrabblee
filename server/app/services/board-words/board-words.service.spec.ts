/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { MAX_BOARD_WIDTH } from '@app/classes/constants/board-constant';
import { DEFAULT_DICTIONARY_ID } from '@common/constants/dictionary-constants';
import { Bonus, Orientation } from '@common/enums/enums';
import { Board, LinkedWordOnBoard, Tile } from '@common/interfaces/board-interface';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { BoardWordsService } from './board-words.service';

describe('BoardWordsService test', () => {
    let boardWordsService: BoardWordsService;
    let testBoard: Board;
    beforeEach(() => {
        const tile: Tile[][] = [];
        for (let coordH = 0; coordH <= MAX_BOARD_WIDTH; coordH++) {
            tile[coordH] = [];
            for (let coordV = 0; coordV <= MAX_BOARD_WIDTH; coordV++) {
                tile[coordH][coordV] = { bonus: Bonus.Base, tile: { letter: '', value: 0 }, placedThisTurn: false };
            }
        }
        testBoard = { content: tile, dictionaryId: DEFAULT_DICTIONARY_ID, placementAchieved: false };
        boardWordsService = new BoardWordsService();
    });

    afterEach(async () => {
        sinon.restore();
    });

    it('listWordsOnboard() calls listBoardWords() with the right arguments ', () => {
        const spy = sinon.spy(boardWordsService as any, 'listBoardWords');
        boardWordsService.listWordsOnboard(testBoard);
        expect(spy.called).to.be.true;
        expect(spy.calledWith(testBoard, Orientation.Vertical));
        expect(spy.called).to.be.true;
        expect(spy.calledWith(testBoard, Orientation.Horizontal));
    });

    it('listBoardWords() returns an empty boardWord when the board is empty when searching Vertically', () => {
        expect(boardWordsService['listBoardWords'](testBoard, Orientation.Vertical)).to.be.eql([
            {
                position: { coordH: 7, coordV: 7 },
                word: '',
                orientation: Orientation.Vertical,
            },
        ]);
    });

    it('listBoardWords() returns an empty boardWord when the board is empty when searching Horizontal', () => {
        expect(boardWordsService['listBoardWords'](testBoard, Orientation.Horizontal)).to.be.eql([
            {
                position: { coordH: 7, coordV: 7 },
                word: '',
                orientation: Orientation.Horizontal,
            },
        ]);
    });

    it('listLinkedWords() returns linked word', () => {
        sinon.stub(boardWordsService as any, 'listBoardWords').returns([
            {
                position: { coordH: 0, coordV: 0 },
                word: 'ab',
                orientation: Orientation.Vertical,
            },
            {
                position: { coordH: 0, coordV: 3 },
                word: 'c',
                orientation: Orientation.Vertical,
            },
            {
                position: { coordH: 1, coordV: 4 },
                word: 'd',
                orientation: Orientation.Vertical,
            },
        ]);
        const expected: LinkedWordOnBoard[] = [
            {
                position: { coordH: 0, coordV: 0 },
                word: 'ab',
                orientation: Orientation.Vertical,
                linkedWords: ['', 'c'],
            },
            {
                position: { coordH: 0, coordV: 3 },
                word: 'c',
                orientation: Orientation.Vertical,
                linkedWords: [],
            },
            {
                position: { coordH: 1, coordV: 4 },
                word: 'd',
                orientation: Orientation.Vertical,
                linkedWords: [],
            },
        ];
        const returnValue = boardWordsService['listLinkedWords'](testBoard, Orientation.Vertical);
        expect(returnValue).eql(expected);
    });

    it('listLinkedWords() returns linked word', () => {
        sinon.stub(boardWordsService as any, 'listBoardWords').returns([
            {
                position: { coordH: 0, coordV: 0 },
                word: 'ab',
                orientation: Orientation.Horizontal,
            },
            {
                position: { coordH: 4, coordV: 0 },
                word: 'c',
                orientation: Orientation.Horizontal,
            },
            {
                position: { coordH: 1, coordV: 1 },
                word: 'd',
                orientation: Orientation.Horizontal,
            },
        ]);
        const expected: LinkedWordOnBoard[] = [
            {
                position: { coordH: 0, coordV: 0 },
                word: 'ab',
                orientation: Orientation.Horizontal,
                linkedWords: ['', '', 'c'],
            },
            {
                position: { coordH: 4, coordV: 0 },
                word: 'c',
                orientation: Orientation.Horizontal,
                linkedWords: [],
            },
            {
                position: { coordH: 1, coordV: 1 },
                word: 'd',
                orientation: Orientation.Horizontal,
                linkedWords: [],
            },
        ];
        const returnValue = boardWordsService['listLinkedWords'](testBoard, Orientation.Horizontal);
        expect(returnValue).eql(expected);
    });

    it('listVerticalBoardWords() returns the vertical words on the board ', () => {
        testBoard.content[0][0].tile.letter = 'a';
        testBoard.content[0][1].tile.letter = 'b';
        testBoard.content[0][2].tile.letter = 'c';

        testBoard.content[0][13].tile.letter = 'c';
        testBoard.content[0][14].tile.letter = 'a';

        testBoard.content[1][4].tile.letter = 'a';
        testBoard.content[1][5].tile.letter = 'b';

        testBoard.content[1][14].tile.letter = 'a';
        expect(boardWordsService['listBoardWords'](testBoard, Orientation.Vertical)).to.be.eql([
            {
                position: { coordH: 0, coordV: 0 },
                word: 'abc',
                orientation: Orientation.Vertical,
            },
            {
                position: { coordH: 0, coordV: 13 },
                word: 'ca',
                orientation: Orientation.Vertical,
            },
            {
                position: { coordH: 1, coordV: 4 },
                word: 'ab',
                orientation: Orientation.Vertical,
            },
            {
                position: { coordH: 1, coordV: 14 },
                word: 'a',
                orientation: Orientation.Vertical,
            },
        ]);
    });

    it('listHorizontalBoardWords() returns the horizontal words on the board ', () => {
        testBoard.content[7][5].tile.letter = 'b';
        testBoard.content[8][5].tile.letter = 'c';

        testBoard.content[13][5].tile.letter = 'c';
        testBoard.content[14][5].tile.letter = 'a';

        testBoard.content[1][6].tile.letter = 'a';
        testBoard.content[2][6].tile.letter = 'b';

        testBoard.content[14][6].tile.letter = 'a';
        expect(boardWordsService['listBoardWords'](testBoard, Orientation.Horizontal)).to.be.eql([
            {
                position: { coordH: 7, coordV: 5 },
                word: 'bc',
                orientation: Orientation.Horizontal,
            },
            {
                position: { coordH: 13, coordV: 5 },
                word: 'ca',
                orientation: Orientation.Horizontal,
            },
            {
                position: { coordH: 1, coordV: 6 },
                word: 'ab',
                orientation: Orientation.Horizontal,
            },
            {
                position: { coordH: 14, coordV: 6 },
                word: 'a',
                orientation: Orientation.Horizontal,
            },
        ]);
    });

    it('mergeHorizontalVertical should call it self when horizontal words list is longer than vertical word list', () => {
        const horizontalWord: LinkedWordOnBoard = {
            position: { coordV: 7, coordH: 7 },
            word: '',
            orientation: Orientation.Horizontal,
            linkedWords: [],
        };
        const verticalWord: LinkedWordOnBoard = {
            position: { coordV: 7, coordH: 7 },
            word: '',
            orientation: Orientation.Vertical,
            linkedWords: [],
        };
        const expectedWordsOnBoard: LinkedWordOnBoard[] = [verticalWord, horizontalWord, horizontalWord];
        const horizontalWords = [horizontalWord, horizontalWord];
        const verticalWords = [verticalWord];
        expect(boardWordsService['mergeHorizontalVertical'](horizontalWords, verticalWords)).eql(expectedWordsOnBoard);
    });

    it('mergeHorizontalVertical merges an array of word board in one array', () => {
        const expectedWordsOnBoard: LinkedWordOnBoard[] = [];
        const horizontalWord: LinkedWordOnBoard = {
            position: { coordV: 7, coordH: 7 },
            word: '',
            orientation: Orientation.Horizontal,
            linkedWords: [],
        };
        const verticalWord: LinkedWordOnBoard = {
            position: { coordV: 7, coordH: 7 },
            word: '',
            orientation: Orientation.Vertical,
            linkedWords: [],
        };
        expectedWordsOnBoard.push(horizontalWord);
        expectedWordsOnBoard.push(verticalWord);
        const horizontalWords = [horizontalWord];
        const verticalWords = [verticalWord];
        expect(boardWordsService['mergeHorizontalVertical'](horizontalWords, verticalWords)).eql(expectedWordsOnBoard);
    });

    it('isLastLetterInWord() returns the right booleans', () => {
        expect(boardWordsService['isLastLetterInWord'](testBoard, { coordH: 0, coordV: 0 }, Orientation.Vertical)).to.be.true;
        expect(boardWordsService['isLastLetterInWord'](testBoard, { coordH: 14, coordV: 0 }, Orientation.Vertical)).to.be.true;
        testBoard.content[0][1].tile.letter = 'b';
        expect(boardWordsService['isLastLetterInWord'](testBoard, { coordH: 0, coordV: 0 }, Orientation.Vertical)).to.be.false;
        testBoard.content[0][0].tile.letter = '';
    });

    it('isLastLetterInWord() returns the right booleans for a horizontal orientation', () => {
        expect(boardWordsService['isLastLetterInWord'](testBoard, { coordH: 0, coordV: 0 }, Orientation.Horizontal)).to.be.true;
        expect(boardWordsService['isLastLetterInWord'](testBoard, { coordH: 14, coordV: 14 }, Orientation.Horizontal)).to.be.true;
        testBoard.content[1][0].tile.letter = 'b';
        expect(boardWordsService['isLastLetterInWord'](testBoard, { coordH: 0, coordV: 0 }, Orientation.Horizontal)).to.be.false;
        testBoard.content[0][0].tile.letter = '';
    });
});
