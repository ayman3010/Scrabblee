/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable max-lines */
import * as BonusColour from '@app/classes/constants/board-constant';
import { MAX_BOARD_WIDTH } from '@app/classes/constants/board-constant';
import { WordValidationService } from '@app/services/word-validation/word-validation.service';
import { CommandType, Orientation } from '@common/enums/enums';
import { Board, Bonus, Position } from '@common/interfaces/board-interface';
import { PlaceCommand } from '@common/interfaces/command-interface';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { BoardService } from './board.service';

describe('Board Service Tests', () => {
    let board: Board;
    let position: Position;
    let wordValidationStub: sinon.SinonStubbedInstance<WordValidationService>;
    let service: BoardService;

    beforeEach(() => {
        wordValidationStub = sinon.createStubInstance(WordValidationService);
        wordValidationStub.inDictionary.returns(true);
        service = new BoardService(wordValidationStub as any as WordValidationService);
        board = BoardService.createBoard();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('The Board should be of the right width and length', () => {
        const width = MAX_BOARD_WIDTH;
        const length = MAX_BOARD_WIDTH;
        expect(board.content[0].length - 1).equal(width);
        expect(board.content.length - 1).equal(length);
    });

    it('The board should have all the TripleWord bonuses at the right coordinates', () => {
        for (const placement of BonusColour.TRIPLE_WORD_POSITIONS) {
            expect(board.content[placement.coordV][placement.coordH].bonus).equal(Bonus.TripleWord);
        }
    });

    it('The board should have all the DoubleWord bonuses at the right coordinates', () => {
        for (const placement of BonusColour.DOUBLE_WORD_POSITIONS) {
            expect(board.content[placement.coordV][placement.coordH].bonus).equal(Bonus.DoubleWord);
        }
    });

    it('The board should have all the light bonuses at the right coordinates', () => {
        for (const placement of BonusColour.DOUBLE_LETTER_POSITIONS) {
            expect(board.content[placement.coordV][placement.coordH].bonus).equal(Bonus.DoubleLetter);
        }
    });

    it('The board should have all the dark blue bonuses at the right coordinates', () => {
        for (const placement of BonusColour.TRIPLE_LETTER_POSITIONS) {
            expect(board.content[placement.coordV][placement.coordH].bonus).equal(Bonus.TripleLetter);
        }
    });

    it('isPlacementAttemptValid() should return true for a correct placement on the first turn', () => {
        const wordToPlace = 'loupe';
        const firstTurn = true;
        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,

            orientation: Orientation.Horizontal,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service.isPlacementAttemptValid(firstTurn, command, board)).equal(true);
    });

    it('isPlacementAttemptValid() should return false when attempting to place a single letter on the first turn', () => {
        const wordToPlace = 'l';
        const firstTurn = true;
        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation: Orientation.Horizontal,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service.isPlacementAttemptValid(firstTurn, command, board)).equal(false);
    });

    it('copyBoard returns a boardCopy of the Board', () => {
        expect(BoardService.copyBoard(board)).eql(board);
    });

    it('isPlacementAttemptValid() should return true for a correct placement on the first turn even for a misspelled word', () => {
        const wordToPlace = 'loepe';
        const orientation: Orientation = Orientation.Horizontal;
        const firstTurn = true;
        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,

            orientation,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service.isPlacementAttemptValid(firstTurn, command, board)).equal(true);
    });

    it('isPlacementAttemptValid() should return false if the placement position is out of bound', () => {
        const wordToPlace = 'loepe';
        const orientation: Orientation = Orientation.Horizontal;
        const firstTurn = true;
        position = { coordV: 7, coordH: 15 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service.isPlacementAttemptValid(firstTurn, command, board)).equal(false);
    });

    it('isPlacementAttemptValid() should return true for a correct placement that has neighbors', () => {
        board.content[10][7].tile.letter = 'p';
        const secondWordToPlace = 'e';
        position = { coordV: 7, coordH: 11 };
        const secondOrientation = Orientation.Horizontal;
        const secondCommand: PlaceCommand = {
            lettersToPlace: secondWordToPlace,
            orientation: secondOrientation,

            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        const firstTurn = false;
        expect(service.isPlacementAttemptValid(firstTurn, secondCommand, board)).equal(true);
    });

    it('isValidPlacement() and simpleValidation() should return true for a basic horizontal word', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[8][7].tile.letter = 'o';
        board.content[9][7].tile.letter = 'u';
        board.content[10][7].tile.letter = 'p';

        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'loup',
            orientation: Orientation.Horizontal,

            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        const command2: PlaceCommand = {
            lettersToPlace: 'loup',
            orientation: Orientation.Vertical,
            placement: position,

            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service['neighborWordValidation'](command2, position, board)).equal(true);
        expect(service.isValidPlacement(command, board)).equal(true);
    });

    it('isValidPlacement() should return true for a horizontal word that creates a vertical word', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[8][7].tile.letter = 'o';
        board.content[9][7].tile.letter = 'u';
        board.content[10][7].tile.letter = 'p';

        board.content[11][7].tile.letter = 'e';
        board.content[11][6].tile.letter = 'p';
        board.content[11][5].tile.letter = 'u';
        board.content[11][4].tile.letter = 'o';
        board.content[11][3].tile.letter = 'l';

        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'loup',

            orientation: Orientation.Horizontal,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service.isValidPlacement(command, board)).equal(true);
    });

    it('isValidPlacement() should return false for a horizontal word that creates a misspelled vertical word', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[7][7].tile.value = 1;
        board.content[8][7].tile.letter = 'o';
        board.content[8][7].tile.value = 1;
        board.content[9][7].tile.letter = 'u';
        board.content[9][7].tile.value = 1;
        board.content[10][7].tile.letter = 'p';
        board.content[10][7].tile.value = 3;
        board.content[11][7].tile.letter = 'e';
        board.content[11][7].tile.value = 1;

        board.content[11][6].tile.letter = 'p';
        board.content[11][6].tile.value = 3;
        board.content[11][5].tile.letter = 'u';
        board.content[11][5].tile.value = 1;
        board.content[11][4].tile.letter = 'o';
        board.content[11][4].tile.value = 1;

        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'loupe',
            orientation: Orientation.Horizontal,

            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };

        wordValidationStub.inDictionary.returns(false);
        expect(service.isValidPlacement(command, board)).equal(false);
    });

    it('isValidPlacement() should return false for an empty horizontal placement', () => {
        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: '',
            orientation: Orientation.Horizontal,
            placement: position,
            commandType: CommandType.Place,

            senderName: '',
        };
        wordValidationStub.inDictionary.returns(false);

        expect(service.isValidPlacement(command, board)).equal(false);
    });

    it('isValidPlacement() should return true for a single letter', () => {
        board.content[7][7].tile.letter = 'l';
        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'l',
            orientation: Orientation.Horizontal,
            placement: position,

            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service.isValidPlacement(command, board)).equal(true);
    });

    it('isValidPlacement() should return false if the placement would create an invalid word connected to it', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[8][7].tile.letter = 'e';
        board.content[7][8].tile.letter = 'l';
        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'le',
            orientation: Orientation.Horizontal,

            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };

        wordValidationStub.inDictionary.returns(false);
        sinon.stub(service as any, 'neighborWordValidation').returns(true);
        expect(service.isValidPlacement(command, board)).equal(false);
    });

    it('isValidPlacement() and simpleValidation() should return false for a misspelled horizontal word', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[8][7].tile.letter = 'o';
        board.content[9][7].tile.letter = 'z';
        board.content[10][7].tile.letter = 'p';
        board.content[11][7].tile.letter = 'p';

        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'lozpp',

            orientation: Orientation.Horizontal,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        const neighborCommand: PlaceCommand = {
            lettersToPlace: 'lozpp',
            orientation: Orientation.Vertical,
            placement: position,

            commandType: CommandType.Place,
            senderName: '',
        };
        wordValidationStub.inDictionary.returns(false);

        expect(service['neighborWordValidation'](neighborCommand, position, board)).equal(false);
        expect(service.isValidPlacement(command, board)).equal(false);
    });

    it('neighborWordValidation() should return false for a misspelled horizontal word', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[8][7].tile.letter = 'o';
        board.content[9][7].tile.letter = 'z';
        board.content[10][7].tile.letter = 'p';
        board.content[11][7].tile.letter = 'p';

        position = { coordV: 7, coordH: 7 };
        const neighborCommand: PlaceCommand = {
            lettersToPlace: 'lozpp',

            orientation: Orientation.Vertical,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };

        wordValidationStub.inDictionary.returns(false);
        expect(service['neighborWordValidation'](neighborCommand, position, board)).equal(false);
    });

    it('isValidPlacement() and neighborWordValidation() should return true for a basic vertical word', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[7][8].tile.letter = 'o';
        board.content[7][9].tile.letter = 'u';
        board.content[7][10].tile.letter = 'p';

        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'loup',
            orientation: Orientation.Vertical,

            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };

        position = { coordV: 7, coordH: 7 };
        expect(service['neighborWordValidation'](command, position, board)).equal(true);
        expect(service.isValidPlacement(command, board)).equal(true);
    });

    it('isValidPlacement() placing a word that forms a wrong horizontal neighbor should return false', () => {
        board.content[7][7].tile.letter = 'r';
        board.content[8][7].tile.letter = 'y';
        board.content[9][7].tile.letter = 'e';

        board.content[8][6].tile.letter = 'e';
        board.content[8][5].tile.letter = 'n';

        position = { coordV: 5, coordH: 9 };
        const command: PlaceCommand = {
            lettersToPlace: 'vie',

            orientation: Orientation.Vertical,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };

        wordValidationStub.inDictionary.returns(false);
        expect(service.isValidPlacement(command, board)).equal(false);
    });

    it('isAnyNeighborFound() ', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[7][8].tile.letter = 'o';
        board.content[7][9].tile.letter = 'u';
        board.content[7][10].tile.letter = 'p';

        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'loup',
            orientation: Orientation.Vertical,

            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        expect(service['neighborWordValidation'](command, position, board)).equal(true);
        expect(service.isValidPlacement(command, board)).equal(true);
    });
    it('isValidPlacement() ) should return true for a basic vertical word', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[7][8].tile.letter = 'o';
        board.content[7][9].tile.letter = 'u';
        board.content[7][10].tile.letter = 'p';

        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'loup',
            orientation: Orientation.Vertical,
            placement: position,
            commandType: CommandType.Place,

            senderName: '',
        };
        expect(service['neighborWordValidation'](command, position, board)).equal(true);
        expect(service.isValidPlacement(command, board)).equal(true);
    });

    it('isValidPlacement() should return false for a misspelled vertical word', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[7][8].tile.letter = 'u';
        board.content[7][9].tile.letter = 'u';
        board.content[7][10].tile.letter = 'l';
        board.content[7][11].tile.letter = 'e';

        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'luule',
            orientation: Orientation.Vertical,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };

        wordValidationStub.inDictionary.returns(false);
        expect(service.isValidPlacement(command, board)).equal(false);
    });

    it('neighborWordValidation() should return false for a misspelled vertical word', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[7][8].tile.letter = 'u';
        board.content[7][9].tile.letter = 'u';
        board.content[7][10].tile.letter = 'l';
        board.content[7][11].tile.letter = 'e';

        position = { coordV: 7, coordH: 7 };
        const originalCommand: PlaceCommand = {
            lettersToPlace: 'luule',
            orientation: Orientation.Horizontal,
            placement: position,
            commandType: CommandType.Place,

            senderName: '',
        };

        wordValidationStub.inDictionary.returns(false);
        expect(service['neighborWordValidation'](originalCommand, position, board)).equal(false);
    });

    it('isValidPlacement() should return true for a vertical word that creates a horizontal word', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[8][7].tile.letter = 'o';
        board.content[9][7].tile.letter = 'u';
        board.content[10][7].tile.letter = 'p';
        board.content[11][7].tile.letter = 'e';

        board.content[11][3].tile.letter = 'l';
        board.content[11][4].tile.letter = 'o';
        board.content[11][5].tile.letter = 'u';
        board.content[11][6].tile.letter = 'p';

        position = { coordH: 11, coordV: 3 };
        const command: PlaceCommand = {
            lettersToPlace: 'loup',
            orientation: Orientation.Vertical,
            placement: position,
            commandType: CommandType.Place,

            senderName: '',
        };

        expect(service.isValidPlacement(command, board)).equal(true);
    });

    it('isValidPlacement() should return false for a vertical word that creates  misspelled horizontal word', () => {
        board.content[7][7].tile.letter = 'l';
        board.content[8][7].tile.letter = 'o';
        board.content[9][7].tile.letter = 'u';
        board.content[10][7].tile.letter = 'p';
        board.content[11][7].tile.letter = 'e';

        board.content[11][3].tile.letter = 'l';
        board.content[11][4].tile.letter = 'o';
        board.content[11][5].tile.letter = 'u';
        board.content[11][6].tile.letter = 'g';

        position = { coordH: 11, coordV: 3 };
        const command: PlaceCommand = {
            lettersToPlace: 'loupe',

            orientation: Orientation.Vertical,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };

        wordValidationStub.inDictionary.returns(false);
        expect(service.isValidPlacement(command, board)).equal(false);
    });

    it('isValidPlacement() should return false for an empty vertical placement', () => {
        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: '',
            orientation: Orientation.Vertical,

            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };

        wordValidationStub.inDictionary.returns(false);
        expect(service.isValidPlacement(command, board)).equal(false);
    });

    it('isInBoard() returns true if the coordinate is in the board and false otherwise', () => {
        const inBoardCoordinate = 7;
        const offBoardCoordinate = 15;
        const secondoffBoardCoordinate = -1;

        expect(service.isInBoard(inBoardCoordinate)).equal(true);
        expect(service.isInBoard(offBoardCoordinate)).equal(false);
        expect(service.isInBoard(secondoffBoardCoordinate)).equal(false);
    });

    it('goToFirstLetter() returns the correct horizontal coordinate of the letter that initiates a horizontal word', () => {
        const firstLetterIndexH = 0;
        board.content[firstLetterIndexH][0].tile.letter = 'l';
        board.content[1][0].tile.letter = 'o';
        board.content[2][0].tile.letter = 'u';
        board.content[3][0].tile.letter = 'p';

        expect(service.goToFirstLetter({ coordH: 2, coordV: 0 }, Orientation.Horizontal, board)).equal(firstLetterIndexH);
    });
    it('goToFirstLetter() returns the correct horizontal coordinate of the letter that initiates a vertical word', () => {
        const firstLetterIndexV = 0;
        board.content[0][firstLetterIndexV].tile.letter = 'l';
        board.content[0][1].tile.letter = 'o';
        board.content[0][2].tile.letter = 'u';
        board.content[0][3].tile.letter = 'p';

        expect(service.goToFirstLetter({ coordH: 0, coordV: 2 }, Orientation.Vertical, board)).equal(firstLetterIndexV);
    });

    it('goToFirstLetter() returns the correct horizontal coordinate of the letter that initiates a vertical word', () => {
        const firstLetterIndexV = 7;
        board.content[7][firstLetterIndexV].tile.letter = 'l';
        board.content[7][8].tile.letter = 'o';
        board.content[7][9].tile.letter = 'u';
        board.content[7][10].tile.letter = 'p';

        expect(service.goToFirstLetter({ coordH: 7, coordV: 7 }, Orientation.Vertical, board)).equal(firstLetterIndexV);
    });

    it('isAnyNeighborFound() should return false for a placement which has no neighbors', () => {
        position = { coordH: 7, coordV: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'loupe',
            orientation: Orientation.Horizontal,

            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };

        expect(service['isAnyNeighborFound'](command, board)).equal(false);
    });

    it('checkNeighborFirstAndLastLetter() should return true for a vertical placement that has a neighbor for its first letter', () => {
        position = { coordH: 7, coordV: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'loupe',
            orientation: Orientation.Vertical,

            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };

        board.content[7][6].tile.letter = 'l';
        expect(service['checkNeighborFirstAndLastLetter'](command, board)).equal(true);
    });

    it('checkNeighborFirstAndLastLetter() should return false for a vertical placement that does not have a neighbor for its first letter', () => {
        position = { coordH: 7, coordV: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'loupe',

            orientation: Orientation.Vertical,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };

        expect(service['checkNeighborFirstAndLastLetter'](command, board)).equal(false);
    });

    it('checkNeighborFirstAndLastLetter() should return true for a vertical placement that has a neighbor for its last letter', () => {
        position = { coordH: 7, coordV: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'loupe',
            orientation: Orientation.Vertical,
            placement: position,

            commandType: CommandType.Place,
            senderName: '',
        };
        board.content[7][12].tile.letter = 'l';

        expect(service['checkNeighborFirstAndLastLetter'](command, board)).equal(true);
    });

    it('checkNeighborFirstAndLastLetter() should return false for a vertical placement that does not have a neighbor for its last letter', () => {
        position = { coordH: 7, coordV: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'loupe',
            orientation: Orientation.Vertical,
            placement: position,

            commandType: CommandType.Place,
            senderName: '',
        };

        expect(service['checkNeighborFirstAndLastLetter'](command, board)).equal(false);
    });

    it('checkNeighborFirstAndLastLetter() should return true for a horizontal placement that  has a neighbor for its first letter', () => {
        position = { coordH: 7, coordV: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'loupe',

            orientation: Orientation.Horizontal,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        board.content[6][7].tile.letter = 'l';

        expect(service['checkNeighborFirstAndLastLetter'](command, board)).equal(true);
    });

    it('checkNeighborFirstAndLastLetter() should return false for a horizontal placement that does not have a neighbor for its first letter', () => {
        position = { coordH: 7, coordV: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'loupe',

            orientation: Orientation.Horizontal,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };

        expect(service['checkNeighborFirstAndLastLetter'](command, board)).equal(false);
    });

    it('checkNeighborFirstAndLastLetter() should return true for a horizontal placement that has a neighbor for its last letter', () => {
        position = { coordH: 7, coordV: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'loupe',
            orientation: Orientation.Horizontal,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        board.content[12][7].tile.letter = 'l';

        expect(service['checkNeighborFirstAndLastLetter'](command, board)).equal(true);
    });

    it('checkNeighborFirstAndLastLetter() should return false for a horizontal placement that does not have a neighbor for its last letter', () => {
        position = { coordH: 7, coordV: 7 };
        const command: PlaceCommand = {
            lettersToPlace: 'loupe',
            orientation: Orientation.Horizontal,
            placement: position,

            commandType: CommandType.Place,
            senderName: '',
        };

        expect(service['checkNeighborFirstAndLastLetter'](command, board)).equal(false);
    });

    it('isPositionValid() should return false if the position is out of bounds horizontally', () => {
        position = { coordH: 16, coordV: 7 };
        expect(service['isPositionValid'](position)).equal(false);
    });

    it('isPositionValid() should return false if the position is out of bounds vertically', () => {
        position = { coordH: 0, coordV: 16 };
        expect(service['isPositionValid'](position)).equal(false);
    });
    it('isPositionValid() should return true if the position is valid', () => {
        position = { coordH: 7, coordV: 7 };
        expect(service['isPositionValid'](position)).equal(true);
    });
});
