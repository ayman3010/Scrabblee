/* eslint-disable dot-notation */
/* eslint-disable max-lines */
import { NO_POINTS } from '@app/classes/constants/board-constant';
import { BoardService } from '@app/services/board/board.service';
import { WordValidationService } from '@app/services/word-validation/word-validation.service';
import { CommandType, Orientation } from '@common/enums/enums';
import { Board, Position } from '@common/interfaces/board-interface';
import { PlaceCommand } from '@common/interfaces/command-interface';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { PointCalculationService } from './point-calculation.service';

describe('PointCalculation Service Tests', () => {
    let mockPlacement: Position;
    let board: Board;
    let wordValidationServiceStub: sinon.SinonStubbedInstance<WordValidationService>;
    let boardService: BoardService;
    let service: PointCalculationService;

    beforeEach(() => {
        wordValidationServiceStub = sinon.createStubInstance(WordValidationService);
        wordValidationServiceStub.inDictionary.returns(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        boardService = new BoardService(wordValidationServiceStub as any as WordValidationService);
        service = new PointCalculationService(boardService);
        board = BoardService.createBoard();
    });

    it('pointCalculator() should return the right amount of points for a vertical placement', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[7][7].tile.value = 1;
        board.content[7][8].tile.letter = 'o';
        board.content[7][8].tile.value = 1;
        board.content[7][9].tile.letter = 'u';
        board.content[7][9].tile.value = 1;
        board.content[7][10].tile.letter = 'p';
        board.content[7][10].tile.value = 3;
        board.content[7][11].tile.letter = 'e';
        board.content[7][11].tile.value = 1;
        const calculatedValue = 16;
        mockPlacement = { coordH: 7, coordV: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'loupe',
            orientation: Orientation.Vertical,
            placement: mockPlacement,

            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service['pointCalculator'](command, board)).equal(calculatedValue);
    });

    it('pointCalculator() should return the right amount of points for a vertical placement on the border', () => {
        board.content[0][0].tile.letter = 'l';
        board.content[0][1].tile.letter = 'o';
        board.content[0][2].tile.letter = 'u';
        board.content[0][3].tile.letter = 'p';
        board.content[0][4].tile.letter = 'e';
        board.content[0][0].tile.value = 1;
        board.content[0][1].tile.value = 1;
        board.content[0][2].tile.value = 1;
        board.content[0][3].tile.value = 3;
        board.content[0][4].tile.value = 1;
        const calculatedValue = 30;
        mockPlacement = { coordH: 0, coordV: 0 };
        const command: PlaceCommand = {
            lettersToPlace: 'loupe',
            orientation: Orientation.Vertical,

            placement: mockPlacement,
            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service['pointCalculator'](command, board)).equal(calculatedValue);
    });

    it('pointCalculator() should return the right amount of points for a vertical placement on the bottom right border', () => {
        board.content[14][10].tile.letter = 'l';
        board.content[14][11].tile.letter = 'o';
        board.content[14][12].tile.letter = 'u';
        board.content[14][13].tile.letter = 'p';
        board.content[14][14].tile.letter = 'e';
        board.content[14][10].tile.value = 1;
        board.content[14][11].tile.value = 1;
        board.content[14][12].tile.value = 1;
        board.content[14][13].tile.value = 3;
        board.content[14][14].tile.value = 1;
        const calculatedValue = 24;
        mockPlacement = { coordH: 14, coordV: 11 };
        const command: PlaceCommand = {
            lettersToPlace: 'loupe',
            orientation: Orientation.Vertical,
            placement: mockPlacement,

            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service['pointCalculator'](command, board)).equal(calculatedValue);
    });
    it('pointCalculator() should return the correct number of points for vertical placement which creates horizontal words', () => {
        board.content[7][7].tile.letter = 'v';
        board.content[7][7].tile.value = 4;
        board.content[7][7].placedThisTurn = true;
        board.content[8][7].tile.letter = 'a';
        board.content[8][7].tile.value = 1;
        board.content[8][7].placedThisTurn = true;
        board.content[9][7].tile.letter = 's';
        board.content[9][7].tile.value = 1;
        board.content[9][7].placedThisTurn = true;

        board.content[7][8].tile.letter = 'a';
        board.content[7][8].tile.value = 1;
        board.content[7][9].tile.value = 1;
        board.content[7][9].tile.letter = 's';

        const calculatedValue = 24;
        mockPlacement = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'vas',

            orientation: Orientation.Vertical,
            placement: mockPlacement,
            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service['pointCalculator'](command, board)).equal(calculatedValue);
    });

    it('pointCalculator() should return the right amount of points for a horizontal placement', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[8][7].tile.letter = 'o';
        board.content[9][7].tile.letter = 'u';
        board.content[10][7].tile.letter = 'p';
        board.content[11][7].tile.letter = 'e';
        board.content[7][7].tile.value = 1;
        board.content[8][7].tile.value = 1;
        board.content[9][7].tile.value = 1;
        board.content[10][7].tile.value = 3;
        board.content[11][7].tile.value = 1;
        const calculatedValue = 16;
        mockPlacement = { coordV: 7, coordH: 7 };
        const command = {
            senderName: '',
            commandType: CommandType.None,
            lettersToPlace: 'loupe',

            orientation: Orientation.Horizontal,
            placement: mockPlacement,
        };
        expect(service['pointCalculator'](command, board)).equal(calculatedValue);
    });

    it('pointCalculator() should return the right amount of points for a horizontal placement on the border', () => {
        board.content[0][0].tile.letter = 'l';
        board.content[1][0].tile.letter = 'o';
        board.content[2][0].tile.letter = 'u';
        board.content[3][0].tile.letter = 'p';
        board.content[4][0].tile.letter = 'e';
        board.content[0][0].tile.value = 1;
        board.content[1][0].tile.value = 1;
        board.content[2][0].tile.value = 1;
        board.content[3][0].tile.value = 3;
        board.content[4][0].tile.value = 1;
        const calculatedValue = 30;
        mockPlacement = { coordH: 0, coordV: 0 };
        const command = {
            senderName: '',
            commandType: CommandType.None,
            lettersToPlace: 'loupe',

            orientation: Orientation.Horizontal,
            placement: mockPlacement,
        };
        expect(service['pointCalculator'](command, board)).equal(calculatedValue);
    });
    it('pointCalculator() should return the correct number of points for horizontal placement which creates vertical words', () => {
        board.content[7][7].tile.letter = 'v';
        board.content[7][7].tile.value = 4;
        board.content[7][7].placedThisTurn = true;
        board.content[8][7].tile.letter = 'a';
        board.content[8][7].tile.value = 1;
        board.content[8][7].placedThisTurn = true;
        board.content[9][7].tile.letter = 's';
        board.content[9][7].tile.value = 1;
        board.content[9][7].placedThisTurn = true;

        board.content[7][8].tile.letter = 'a';
        board.content[7][8].tile.value = 1;
        board.content[7][9].tile.letter = 's';
        board.content[7][9].tile.value = 1;

        const calculatedValue = 24;
        mockPlacement = { coordV: 7, coordH: 7 };
        const command = {
            senderName: '',
            commandType: CommandType.None,
            lettersToPlace: 'vas',

            orientation: Orientation.Horizontal,
            placement: mockPlacement,
        };
        expect(service['pointCalculator'](command, board)).equal(calculatedValue);
    });

    it('pointCalculator() and pointCalculator() should 0 if the board.content is empty', () => {
        const calculatedValue = 0;
        mockPlacement = { coordH: 7, coordV: 7 };
        const command = {
            senderName: '',
            commandType: CommandType.None,
            lettersToPlace: '',

            orientation: Orientation.Horizontal,
            placement: mockPlacement,
        };
        expect(service['pointCalculator'](command, board)).equal(calculatedValue);
        expect(service['pointCalculator'](command, board)).equal(calculatedValue);
    });

    it('calculatePoints() should 0 if the board.content is empty', () => {
        const calculatedValue = 0;
        mockPlacement = { coordH: 7, coordV: 7 };
        const command: PlaceCommand = {
            lettersToPlace: '',

            orientation: Orientation.Vertical,
            placement: mockPlacement,
            commandType: CommandType.Place,
            senderName: '',
        };

        expect(service.calculatePoints(command, board)).equal(calculatedValue);
    });

    it('calculatePoints() should return only the value of a vertical placement if their are no horizontal words', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[7][8].tile.letter = 'o';
        board.content[7][9].tile.letter = 'u';
        board.content[7][10].tile.letter = 'p';
        board.content[7][11].tile.letter = 'e';
        board.content[7][7].tile.value = 1;
        board.content[7][8].tile.value = 1;
        board.content[7][9].tile.value = 1;
        board.content[7][10].tile.value = 3;
        board.content[7][11].tile.value = 1;
        const calculatedValue = 16;
        const wordPlaced = 'loupe';
        mockPlacement = { coordH: 7, coordV: 7 };
        const command: PlaceCommand = {
            lettersToPlace: wordPlaced,
            orientation: Orientation.Vertical,

            placement: mockPlacement,
            commandType: CommandType.Place,
            senderName: '',
        };

        expect(service.calculatePoints(command, board)).equal(calculatedValue);
    });

    it('calculatePoints() should return only the value of a horizontal words on the border', () => {
        board.content[0][14].tile.letter = 'l';
        board.content[1][14].tile.letter = 'o';
        board.content[2][14].tile.letter = 'u';
        board.content[3][14].tile.letter = 'p';
        board.content[4][14].tile.letter = 'e';
        board.content[0][14].tile.value = 1;
        board.content[1][14].tile.value = 1;
        board.content[2][14].tile.value = 1;
        board.content[3][14].tile.value = 3;
        board.content[4][14].tile.value = 1;
        const calculatedValue = 30;
        const wordPlaced = 'loupe';
        mockPlacement = { coordH: 0, coordV: 14 };
        const command: PlaceCommand = {
            lettersToPlace: wordPlaced,
            orientation: Orientation.Horizontal,

            placement: mockPlacement,
            commandType: CommandType.Place,
            senderName: '',
        };

        expect(service.calculatePoints(command, board)).equal(calculatedValue);
    });

    it('calculatePoints() should return the right amount of points for a horizontal and vertical placement on the border', () => {
        board.content[0][0].tile.letter = 'v';
        board.content[0][0].tile.value = 4;
        board.content[0][0].placedThisTurn = true;
        board.content[0][1].tile.letter = 'e';
        board.content[0][1].tile.value = 1;
        board.content[0][1].placedThisTurn = true;
        board.content[0][2].tile.letter = 'n';
        board.content[0][2].tile.value = 1;
        board.content[0][2].placedThisTurn = true;
        board.content[0][3].tile.letter = 't';
        board.content[0][3].tile.value = 1;
        board.content[0][3].placedThisTurn = true;
        board.content[0][4].tile.letter = 'r';
        board.content[0][4].tile.value = 1;
        board.content[0][4].placedThisTurn = true;
        board.content[0][5].tile.letter = 'e';
        board.content[0][5].tile.value = 1;
        board.content[0][5].placedThisTurn = true;

        board.content[1][0].tile.letter = 'a';
        board.content[1][0].tile.value = 1;
        board.content[2][0].tile.letter = 's';
        board.content[2][0].tile.value = 1;

        const calculatedValue = 48;
        const wordPlaced = 'ventre';
        mockPlacement = { coordH: 0, coordV: 0 };
        const command: PlaceCommand = {
            lettersToPlace: wordPlaced,
            orientation: Orientation.Vertical,
            placement: mockPlacement,

            commandType: CommandType.Place,
            senderName: '',
        };

        expect(service.calculatePoints(command, board)).equal(calculatedValue);
    });

    it('calculatePoints() should return only the value of a horizontal placement if their are no vertical words', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[8][7].tile.letter = 'o';
        board.content[9][7].tile.letter = 'u';
        board.content[10][7].tile.letter = 'p';
        board.content[11][7].tile.letter = 'e';
        board.content[7][7].tile.value = 1;
        board.content[8][7].tile.value = 1;
        board.content[9][7].tile.value = 1;
        board.content[10][7].tile.value = 3;
        board.content[11][7].tile.value = 1;
        mockPlacement = { coordH: 7, coordV: 7 };
        const wordPlaced = 'loupe';
        const calculatedValue = 16;
        const command: PlaceCommand = {
            lettersToPlace: wordPlaced,
            orientation: Orientation.Horizontal,
            placement: mockPlacement,

            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service.calculatePoints(command, board)).equal(calculatedValue);
    });

    it('calculatePoints() returns the correct value if a new letter forms a horizontal and vertical word', () => {
        board.content[7][7].tile.letter = 'v';
        board.content[7][7].tile.value = 4;
        board.content[7][7].placedThisTurn = true;
        board.content[7][8].tile.letter = 'e';
        board.content[7][8].tile.value = 1;
        board.content[7][8].placedThisTurn = true;
        board.content[7][9].tile.letter = 'n';
        board.content[7][9].tile.value = 1;
        board.content[7][9].placedThisTurn = true;
        board.content[7][10].tile.letter = 't';
        board.content[7][10].tile.value = 1;
        board.content[7][10].placedThisTurn = true;
        board.content[7][11].tile.letter = 'r';
        board.content[7][11].tile.value = 1;
        board.content[7][11].placedThisTurn = true;
        board.content[7][12].tile.letter = 'e';
        board.content[7][12].tile.value = 1;
        board.content[7][12].placedThisTurn = true;
        const wordPlaced = 'ventre';
        board.content[8][7].tile.letter = 'a';
        board.content[8][7].tile.value = 1;
        board.content[8][7].placedThisTurn = true;
        board.content[9][7].tile.letter = 's';
        board.content[9][7].tile.value = 1;
        board.content[9][7].placedThisTurn = true;

        const calculatedValue = 32;
        mockPlacement = { coordH: 7, coordV: 7 };
        const command: PlaceCommand = {
            lettersToPlace: wordPlaced,
            orientation: Orientation.Vertical,

            placement: mockPlacement,
            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service.calculatePoints(command, board)).equal(calculatedValue);
    });

    it('calculatePoints() returns the correct value for a word formed on multiple bonus tiles', () => {
        board.content[7][1].tile.letter = 'l';
        board.content[7][1].tile.value = 1;
        board.content[7][1].placedThisTurn = true;
        board.content[7][2].tile.letter = 'o';
        board.content[7][2].tile.value = 1;
        board.content[7][2].placedThisTurn = true;
        board.content[7][3].tile.letter = 'u';
        board.content[7][3].tile.value = 1;
        board.content[7][3].placedThisTurn = true;
        board.content[7][4].tile.letter = 'p';
        board.content[7][4].tile.value = 3;
        board.content[7][4].placedThisTurn = true;
        const wordPlaced = 'loup';

        board.content[8][2].tile.letter = 'u';
        board.content[8][2].tile.value = 1;
        board.content[8][2].placedThisTurn = true;
        board.content[9][2].tile.letter = 'i';
        board.content[9][2].tile.value = 1;

        const calculatedValue = 11;
        mockPlacement = { coordH: 7, coordV: 1 };
        const command: PlaceCommand = {
            lettersToPlace: wordPlaced,
            orientation: Orientation.Vertical,
            placement: mockPlacement,
            commandType: CommandType.Place,

            senderName: '',
        };
        expect(service.calculatePoints(command, board)).equal(calculatedValue);
    });

    it('calculatePoints() returns the correct value for a word formed on multiple bonus tiles ON THE BORDER', () => {
        board.content[7][0].tile.letter = 'l';
        board.content[7][0].tile.value = 1;
        board.content[7][0].placedThisTurn = true;
        board.content[7][1].tile.letter = 'o';
        board.content[7][1].tile.value = 1;
        board.content[7][1].placedThisTurn = true;
        board.content[7][2].tile.letter = 'u';
        board.content[7][2].tile.value = 1;
        board.content[7][2].placedThisTurn = true;
        board.content[7][3].tile.letter = 'p';
        board.content[7][3].tile.value = 3;
        board.content[7][3].placedThisTurn = true;
        const wordPlaced = 'loup';

        board.content[8][1].tile.letter = 'u';
        board.content[8][1].tile.value = 1;
        board.content[9][1].placedThisTurn = true;
        board.content[9][1].tile.letter = 'i';
        board.content[9][1].tile.value = 1;

        const calculatedValue = 32;
        mockPlacement = { coordH: 7, coordV: 0 };
        const command: PlaceCommand = {
            lettersToPlace: wordPlaced,

            orientation: Orientation.Vertical,
            placement: mockPlacement,
            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service.calculatePoints(command, board)).equal(calculatedValue);
    });

    it('calculatePoints() returns the correct value for a word formed on dark blue tiles', () => {
        board.content[9][9].tile.letter = 'l';
        board.content[9][9].tile.value = 1;
        board.content[9][9].placedThisTurn = true;
        board.content[9][10].tile.letter = 'o';
        board.content[9][10].tile.value = 1;
        board.content[9][10].placedThisTurn = true;

        board.content[9][11].tile.letter = 'u';
        board.content[9][11].tile.value = 1;
        board.content[9][11].placedThisTurn = true;

        board.content[9][12].tile.letter = 'p';
        board.content[9][12].tile.value = 3;
        board.content[9][12].placedThisTurn = true;

        const wordPlaced = 'loupe';
        board.content[10][11].tile.letter = 'u';
        board.content[10][11].tile.value = 1;

        board.content[11][11].tile.letter = 'i';
        board.content[11][11].tile.value = 1;
        board.content[11][11].placedThisTurn = true;

        const calculatedValue = 14;
        mockPlacement = { coordH: 9, coordV: 9 };
        const command: PlaceCommand = {
            lettersToPlace: wordPlaced,

            orientation: Orientation.Vertical,
            placement: mockPlacement,
            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service.calculatePoints(command, board)).equal(calculatedValue);
    });

    it('calculatePoints() should return only the value of a horizontal placement on a dark blue tile', () => {
        board.content[9][9].tile.letter = 'l';
        board.content[9][9].tile.value = 1;
        board.content[9][9].placedThisTurn = true;
        board.content[10][9].tile.letter = 'o';
        board.content[10][9].tile.value = 1;
        board.content[10][9].placedThisTurn = true;
        board.content[11][9].tile.letter = 'u';
        board.content[11][9].tile.value = 1;
        board.content[11][9].placedThisTurn = true;
        board.content[12][9].tile.letter = 'p';
        board.content[12][9].tile.value = 3;
        board.content[12][9].placedThisTurn = true;
        const wordPlaced = 'loup';

        mockPlacement = { coordH: 9, coordV: 9 };
        const command: PlaceCommand = {
            lettersToPlace: wordPlaced,
            orientation: Orientation.Horizontal,
            placement: mockPlacement,
            commandType: CommandType.Place,

            senderName: '',
        };
        const calculatedValue = 8;
        expect(service.calculatePoints(command, board)).equal(calculatedValue);
    });

    it('calculatePoints() should return only the value of a vertical placement on a dark blue tile', () => {
        board.content[9][9].tile.letter = 'l';
        board.content[9][9].tile.value = 1;
        board.content[9][9].placedThisTurn = true;
        board.content[9][10].tile.letter = 'o';
        board.content[9][10].tile.value = 1;
        board.content[9][10].placedThisTurn = true;
        board.content[9][11].tile.letter = 'u';
        board.content[9][11].tile.value = 1;
        board.content[9][11].placedThisTurn = true;
        board.content[9][12].tile.letter = 'p';
        board.content[9][12].tile.value = 3;
        board.content[9][12].placedThisTurn = true;

        const wordPlaced = 'loup';
        const command: PlaceCommand = {
            lettersToPlace: wordPlaced,
            orientation: Orientation.Vertical,

            placement: mockPlacement,
            commandType: CommandType.Place,
            senderName: '',
        };
        mockPlacement = { coordH: 9, coordV: 9 };
        const calculatedValue = 8;
        expect(service.calculatePoints(command, board)).equal(calculatedValue);
    });

    it('simpleCalculation() should return the value of a vertical placement on a dark blue tile', () => {
        board.content[9][9].tile.letter = 'l';
        board.content[9][9].tile.value = 1;
        board.content[9][9].placedThisTurn = true;
        board.content[9][10].tile.letter = 'o';
        board.content[9][10].tile.value = 1;
        board.content[9][10].placedThisTurn = true;
        board.content[9][11].tile.letter = 'u';
        board.content[9][11].tile.value = 1;
        board.content[9][11].placedThisTurn = true;
        board.content[9][12].tile.letter = 'p';
        board.content[9][12].tile.value = 3;
        board.content[9][12].placedThisTurn = true;

        mockPlacement = { coordH: 9, coordV: 9 };
        const calculatedValue = 8;
        const commandForSimple = {
            senderName: '',
            commandType: CommandType.None,
            lettersToPlace: 'loup',

            orientation: Orientation.Horizontal,
            placement: mockPlacement,
        };
        expect(service['simpleCalculation'](commandForSimple, mockPlacement, board)).equal(calculatedValue);
    });

    it('simpleCalculation() should return  the value of a horizontal placement on a dark blue tile', () => {
        board.content[9][9].tile.letter = 'l';
        board.content[9][9].tile.value = 1;
        board.content[9][9].placedThisTurn = true;
        board.content[10][9].tile.letter = 'o';
        board.content[10][9].tile.value = 1;
        board.content[10][9].placedThisTurn = true;
        board.content[11][9].tile.letter = 'u';
        board.content[11][9].tile.value = 1;
        board.content[11][9].placedThisTurn = true;
        board.content[12][9].tile.letter = 'p';
        board.content[12][9].tile.value = 3;
        board.content[12][9].placedThisTurn = true;

        mockPlacement = { coordH: 9, coordV: 9 };
        const calculatedValue = 8;
        const commandForSimple = {
            senderName: '',

            commandType: CommandType.None,
            lettersToPlace: 'loup',
            orientation: Orientation.Vertical,
            placement: mockPlacement,
        };
        expect(service['simpleCalculation'](commandForSimple, mockPlacement, board)).equal(calculatedValue);
    });

    it('simpleCalculation() should return  the value of a horizontal placement on a border', () => {
        board.content[0][0].tile.letter = 'l';
        board.content[0][0].tile.value = 1;
        board.content[0][0].placedThisTurn = true;
        board.content[1][0].tile.letter = 'o';
        board.content[1][0].tile.value = 1;
        board.content[1][0].placedThisTurn = true;
        board.content[2][0].tile.letter = 'u';
        board.content[2][0].tile.value = 1;
        board.content[2][0].placedThisTurn = true;
        board.content[3][0].tile.letter = 'p';
        board.content[3][0].tile.value = 3;
        board.content[3][0].placedThisTurn = true;

        mockPlacement = { coordH: 0, coordV: 0 };
        const calculatedValue = 27;
        const commandForSimple = {
            senderName: '',

            commandType: CommandType.None,
            lettersToPlace: 'loup',
            orientation: Orientation.Vertical,
            placement: mockPlacement,
        };
        expect(service['simpleCalculation'](commandForSimple, mockPlacement, board)).equal(calculatedValue);
    });

    it('pointCalculator() should return  the value of a horizontal placement on a border', () => {
        board.content[0][0].tile.letter = 'v';
        board.content[0][0].tile.value = 4;
        board.content[0][0].placedThisTurn = true;
        board.content[1][0].tile.letter = 'a';
        board.content[1][0].tile.value = 1;
        board.content[1][0].placedThisTurn = true;
        board.content[2][0].tile.letter = 's';
        board.content[2][0].tile.value = 1;
        board.content[2][0].placedThisTurn = true;

        mockPlacement = { coordH: 0, coordV: 0 };
        const command = {
            senderName: '',
            commandType: CommandType.None,

            lettersToPlace: 'vas',
            orientation: Orientation.Horizontal,
            placement: mockPlacement,
        };
        const calculatedValue = 18;
        expect(service['pointCalculator'](command, board)).equal(calculatedValue);
    });

    it('horizontalPointCalculation() should return  the value of a horizontal placement on a border that forms 2 words', () => {
        board.content[7][7].tile.letter = 'v';
        board.content[7][7].tile.value = 4;
        board.content[8][7].tile.letter = 'a';
        board.content[8][7].tile.value = 1;
        board.content[9][7].tile.letter = 's';
        board.content[9][7].tile.value = 1;

        board.content[7][7].tile.letter = 'v';
        board.content[7][7].tile.value = 4;
        board.content[7][7].placedThisTurn = true;
        board.content[7][8].tile.letter = 'a';
        board.content[7][8].tile.value = 1;
        board.content[7][8].placedThisTurn = true;
        board.content[7][9].tile.letter = 's';
        board.content[7][9].tile.value = 1;
        board.content[7][9].placedThisTurn = true;

        mockPlacement = { coordH: 7, coordV: 7 };
        const calculatedValue = 24;
        const command = {
            senderName: '',
            commandType: CommandType.None,
            lettersToPlace: 'vas',

            orientation: Orientation.Horizontal,
            placement: mockPlacement,
        };
        expect(service['pointCalculator'](command, board)).equal(calculatedValue);
    });

    it('simpleCalculation() should return  the value of a horizontal placement on a border', () => {
        board.content[7][0].tile.letter = 'l';
        board.content[7][0].tile.value = 1;
        board.content[7][0].placedThisTurn = true;
        board.content[7][1].tile.letter = 'o';
        board.content[7][1].tile.value = 1;
        board.content[7][1].placedThisTurn = true;
        board.content[7][2].tile.letter = 'u';
        board.content[7][2].tile.value = 1;
        board.content[7][2].placedThisTurn = true;
        board.content[7][3].tile.letter = 'p';
        board.content[7][3].tile.value = 3;
        board.content[7][3].placedThisTurn = true;

        mockPlacement = { coordH: 7, coordV: 0 };
        const calculatedValue = 27;
        const command = {
            senderName: '',
            commandType: CommandType.None,
            lettersToPlace: 'loup',

            orientation: Orientation.Horizontal,
            placement: mockPlacement,
        };
        expect(service['simpleCalculation'](command, mockPlacement, board)).equal(calculatedValue);
    });

    it('pointCalculator() should return  the value of a horizontal placement on a border', () => {
        board.content[7][0].tile.letter = 'l';
        board.content[7][0].tile.value = 1;
        board.content[7][1].tile.letter = 'o';
        board.content[7][1].tile.value = 1;
        board.content[7][2].tile.letter = 'u';
        board.content[7][2].tile.value = 1;
        board.content[7][3].tile.letter = 'p';
        board.content[7][3].tile.value = 3;

        mockPlacement = { coordH: 7, coordV: 0 };
        const calculatedValue = 27;
        const command = {
            senderName: '',
            commandType: CommandType.None,
            lettersToPlace: 'loup',

            orientation: Orientation.Vertical,
            placement: mockPlacement,
        };
        expect(service['pointCalculator'](command, board)).equal(calculatedValue);
    });
    it('simpleCalculation() should return 0 points if they find a word of size 1', () => {
        board.content[7][7].tile.letter = 'o';
        board.content[7][7].tile.value = 1;
        const command = {
            senderName: '',
            commandType: CommandType.None,
            lettersToPlace: 'o',

            orientation: Orientation.Vertical,
            placement: mockPlacement,
        };
        expect(service['simpleCalculation'](command, { coordH: 7, coordV: 7 }, board)).equal(NO_POINTS);
    });
    it('simpleCalculation() should return  no points for a single letter', () => {
        board.content[7][0].tile.letter = 'l';
        board.content[7][0].tile.value = 1;

        mockPlacement = { coordH: 7, coordV: 0 };
        const calculatedValue = 0;
        const command = {
            senderName: '',
            commandType: CommandType.None,
            lettersToPlace: 'l',
            orientation: Orientation.Vertical,
            placement: mockPlacement,
        };
        expect(service['simpleCalculation'](command, mockPlacement, board)).equal(calculatedValue);
    });
});
