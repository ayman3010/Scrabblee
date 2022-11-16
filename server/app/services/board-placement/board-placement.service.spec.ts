/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable max-lines */
import { MAX_BOARD_WIDTH } from '@app/classes/constants/board-constant';
import { BoardService } from '@app/services/board/board.service';
import { CommandType, Orientation } from '@common/enums/enums';
import { Board, Position } from '@common/interfaces/board-interface';
import { PlaceCommand } from '@common/interfaces/command-interface';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { BoardPlacementService } from './board-placement.service';

describe('Board Placement Service Tests', () => {
    let position: Position;
    let service: BoardPlacementService;
    let board: Board;
    let boardServiceStub: sinon.SinonStubbedInstance<BoardService>;

    beforeEach(() => {
        boardServiceStub = sinon.createStubInstance(BoardService);
        boardServiceStub.isValidPlacement.returns(true);
        boardServiceStub.isPlacementAttemptValid.returns(true);
        board = BoardService.createBoard();
        service = new BoardPlacementService(boardServiceStub as any as BoardService);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('placeLetters() should place the letters vertically on the board', () => {
        const wordToPlace = 'loupe';
        const firstTurn = true;
        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation: Orientation.Vertical,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        service.placeLetters(command, firstTurn, board);
        for (let index = 0; index < wordToPlace.length; index++) {
            expect(board.content[position.coordH][position.coordV + index].tile.letter).to.equal(wordToPlace[index]);
        }
    });

    it('placeLetters() should set placementAchieved to false on the provided board if it could not place the letters on it', () => {
        boardServiceStub.isPlacementAttemptValid.returns(false);

        const wordToPlace = 'loupe';
        const firstTurn = true;
        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation: Orientation.Vertical,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };

        service.placeLetters(command, firstTurn, board);
        expect(board.placementAchieved).to.equal(false);
    });

    it('placeLetters() should not place the letters if it is the first turn and the position is not at 7-7', () => {
        const wordToPlace = 'loupe';
        const orientation: Orientation = Orientation.Vertical;
        const firstTurn = false;
        position = { coordV: 8, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };

        boardServiceStub.isValidPlacement.returns(false);
        service.placeLetters(command, firstTurn, board);
        for (let index = 0; index < wordToPlace.length; index++) {
            expect(board.content[position.coordH][position.coordV + index].tile.letter).to.equal('');
        }
    });

    it('placeLetters() must place the letters vertically on the board taking into account the letters already placed ', () => {
        const wordToPlace = 'le';
        const wordToFind = 'loupe';
        const firstTurn = true;
        board.content[7][8].tile.letter = 'o';
        board.content[7][9].tile.letter = 'u';
        board.content[7][10].tile.letter = 'p';

        const orientation: Orientation = Orientation.Vertical;
        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        service.placeLetters(command, firstTurn, board);
        for (let index = 0; index < wordToFind.length; index++) {
            expect(board.content[position.coordH][position.coordV + index].tile.letter).to.equal(wordToFind[index]);
        }
    });

    it('placeLetters() should place the letters horizontally on the top right corner of the board', () => {
        const wordToPlace = 'oup';
        board.content[0][9].tile.letter = 'l';

        const orientation: Orientation = Orientation.Horizontal;
        const firstTurn = false;
        position = { coordH: 1, coordV: 9 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        service.placeLetters(command, firstTurn, board);
        for (let index = 0; index < wordToPlace.length; index++) {
            expect(board.content[position.coordH + index][position.coordV].tile.letter).to.equal(wordToPlace[index]);
        }
    });

    it('placeLetters() should place the letters horizontally on the top left corner of the board', () => {
        const wordToPlace = 'oup';
        board.content[0][0].tile.letter = 'l';

        const orientation: Orientation = Orientation.Horizontal;
        const firstTurn = false;
        position = { coordH: 1, coordV: 0 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        service.placeLetters(command, firstTurn, board);
        for (let index = 0; index < wordToPlace.length; index++) {
            expect(board.content[position.coordH + index][position.coordV].tile.letter).to.equal(wordToPlace[index]);
        }
    });

    it('placeLetters() should place the letters horizontally on the bottom left corner of the board', () => {
        const wordToPlace = 'oup';
        board.content[0][14].tile.letter = 'l';

        const orientation: Orientation = Orientation.Horizontal;
        const firstTurn = false;
        position = { coordH: 1, coordV: 14 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        service.placeLetters(command, firstTurn, board);
        for (let index = 0; index < wordToPlace.length; index++) {
            expect(board.content[position.coordH + index][position.coordV].tile.letter).to.equal(wordToPlace[index]);
        }
    });

    it('placeLetters() should place the letters vertically on the top right of board', () => {
        const wordToPlace = 'loup';
        board.content[14][4].tile.letter = 'e';

        const orientation: Orientation = Orientation.Vertical;
        const firstTurn = false;
        position = { coordV: 0, coordH: 14 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        service.placeLetters(command, firstTurn, board);
        for (let index = 0; index < wordToPlace.length; index++) {
            expect(board.content[position.coordH][position.coordV + index].tile.letter).to.equal(wordToPlace[index]);
        }
    });

    it('placeLetters() should place the letters horizontally on the bottom right corner of the board', () => {
        const wordToPlace = 'oupe';
        const orientation: Orientation = Orientation.Horizontal;
        const firstTurn = false;
        board.content[8][14].tile.letter = 'l';
        position = { coordV: 14, coordH: 9 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        service.placeLetters(command, firstTurn, board);
        for (let index = 0; index < wordToPlace.length; index++) {
            expect(board.content[position.coordH + index][position.coordV].tile.letter).to.equal(wordToPlace[index]);
        }
    });

    it('placeLetters() should place the letters vertically on the bottom right of board', () => {
        const wordToPlace = 'oupe';
        const orientation: Orientation = Orientation.Vertical;
        const firstTurn = false;
        board.content[14][8].tile.letter = 'l';
        position = { coordV: 9, coordH: 14 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        service.placeLetters(command, firstTurn, board);
        for (let index = 0; index < wordToPlace.length; index++) {
            expect(board.content[position.coordH][position.coordV + index].tile.letter).to.equal(wordToPlace[index]);
        }
    });

    it('placeLetters() should place the letters horizontally on board', () => {
        const wordToPlace = 'loupe';
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
        service.placeLetters(command, firstTurn, board);
        for (let index = 0; index < wordToPlace.length; index++) {
            expect(board.content[position.coordH + index][position.coordV].tile.letter).to.equal(wordToPlace[index]);
        }
    });

    it('placeLetters() must place the letters horizontally on the board taking into account the letters already placed ', () => {
        const wordToPlace = 'lope';
        const wordToFind = 'loupe';
        const firstTurn = true;
        board.content[9][7].tile.letter = 'u';
        const orientation: Orientation = Orientation.Horizontal;
        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        service.placeLetters(command, firstTurn, board);
        for (let index = 0; index < wordToFind.length; index++) {
            expect(board.content[position.coordH + index][position.coordV].tile.letter).to.equal(wordToFind[index]);
        }
    });

    it('placeLetters() should not place a word not in the dictionary', () => {
        const wordToPlace = 'aijbh';
        const orientation: Orientation = Orientation.Vertical;
        position = { coordV: 7, coordH: 7 };
        const isFirstTurn = true;

        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };

        boardServiceStub.isValidPlacement.returns(false);

        service.placeLetters(command, isFirstTurn, board);
        for (let index = 0; index < wordToPlace.length; index++) {
            expect(board.content[position.coordH][position.coordV + index].tile.letter).to.equal('');
        }
    });

    it('placeLetters() must not place a word that does not generate valid words with neighboring letters', () => {
        const placedWord = 'rat';
        const wordToPlace = 'rl';
        let isFirstTurn = true;
        const placedWordplacement = { coordV: 7, coordH: 7 };
        const firstCommand: PlaceCommand = {
            lettersToPlace: placedWord,
            orientation: Orientation.Horizontal,
            placement: placedWordplacement,
            commandType: CommandType.Place,
            senderName: '',
        };

        service.placeLetters(firstCommand, isFirstTurn, board);

        boardServiceStub.isValidPlacement.returns(false);
        const wordToPlaceplacement = { coordV: 5, coordH: 7 };
        isFirstTurn = false;
        const secondCommand: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation: Orientation.Vertical,
            placement: wordToPlaceplacement,
            commandType: CommandType.Place,
            senderName: '',
        };
        service.placeLetters(secondCommand, isFirstTurn, board);
        for (let index = 0; index < secondCommand.lettersToPlace.length; index++) {
            expect(board.content[secondCommand.placement.coordH][secondCommand.placement.coordV + index].tile.letter).to.equal('');
        }
    });

    it('placeLetters() must not place a word that tries to place it out of board', () => {
        const placedWord = 'oupe';
        board.content[11][14].tile.letter = 'l';
        const isFirstTurn = false;
        const placedWordplacement = { coordV: 14, coordH: 12 };
        const firstCommand: PlaceCommand = {
            lettersToPlace: placedWord,
            orientation: Orientation.Horizontal,
            placement: placedWordplacement,
            commandType: CommandType.Place,
            senderName: '',
        };
        service.placeLetters(firstCommand, isFirstTurn, board);
        for (let index = 0; index < firstCommand.lettersToPlace.length && firstCommand.placement.coordV + index < MAX_BOARD_WIDTH; index++) {
            expect(board.content[firstCommand.placement.coordH][firstCommand.placement.coordV + index].tile.letter).to.equal('');
        }
    });

    it('placeLetters() must not place a word that is misspelled', () => {
        const placedWord = 'olp';
        board.content[10][14].tile.letter = 'l';
        const isFirstTurn = false;
        const placedWordplacement = { coordV: 14, coordH: 11 };
        const firstCommand: PlaceCommand = {
            lettersToPlace: placedWord,
            orientation: Orientation.Horizontal,
            placement: placedWordplacement,
            commandType: CommandType.Place,
            senderName: '',
        };
        service.placeLetters(firstCommand, isFirstTurn, board);
        for (let index = 0; index < firstCommand.lettersToPlace.length && firstCommand.placement.coordV + index < MAX_BOARD_WIDTH; index++) {
            expect(board.content[firstCommand.placement.coordH][firstCommand.placement.coordV + index].tile.letter).to.equal('');
        }
    });

    it('simple vertical removal of letters should remove all the letters placed vertically', () => {
        const wordToPlace = 'loupe';
        const isFirstTurn = true;
        const orientation: Orientation = Orientation.Vertical;
        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        const placedLettersPositions = service.placeLetters(command, isFirstTurn, board);

        service['removeLetters'](command, board, placedLettersPositions);
        for (let index = 0; index < wordToPlace.length; index++) {
            expect(board.content[position.coordH][position.coordV + index].tile.letter).to.equal('');
        }
    });

    it('simple vertical removal of letters should remove all the letters placed vertically and leave the letters that were already there', () => {
        const wordToPlace = 'lope';
        const wordTofind = 'loupe';
        const isFirstTurn = true;
        const orientation: Orientation = Orientation.Vertical;
        board.content[7][9].tile.letter = 'u';

        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        const placedLettersPositions = service.placeLetters(command, isFirstTurn, board);
        for (let index = 0; index < wordToPlace.length; index++) {
            expect(board.content[position.coordH][position.coordV + index].tile.letter).to.equal(wordTofind[index]);
        }
        service['removeLetters'](command, board, placedLettersPositions);
        expect(board.content[7][9].tile.letter).equal('u');
    });

    it('simple horizontal removal of letters should remove all the letters placed vertically', () => {
        const wordToPlace = 'loupe';
        const orientation: Orientation = Orientation.Horizontal;
        const isFirstTurn = true;
        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        const placedLettersPositions = service.placeLetters(command, isFirstTurn, board);

        service['removeLetters'](command, board, placedLettersPositions);
        for (let index = 0; index < wordToPlace.length; index++) {
            expect(board.content[position.coordH + index][position.coordV].tile.letter).to.equal('');
        }
    });

    it('simple vertical removal of letters should remove all the letters placed vertically and leave the letters that were already there', () => {
        const wordToPlace = 'lope';
        const wordTofind = 'loupe';
        const isFirstTurn = true;
        const orientation: Orientation = Orientation.Horizontal;
        board.content[9][7].tile.letter = 'u';
        position = { coordV: 7, coordH: 7 };
        const command: PlaceCommand = {
            lettersToPlace: wordToPlace,
            orientation,
            placement: position,
            commandType: CommandType.Place,
            senderName: '',
        };
        const placedLettersPositions = service.placeLetters(command, isFirstTurn, board);
        for (let index = 0; index < wordTofind.length; index++) {
            expect(board.content[position.coordH + index][position.coordV].tile.letter).to.equal(wordTofind[index]);
        }
        service['removeLetters'](command, board, placedLettersPositions);
        expect(board.content[9][7].tile.letter).equal('u');
    });
});
