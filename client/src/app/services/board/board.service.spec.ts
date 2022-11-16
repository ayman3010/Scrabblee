/* eslint-disable max-lines */
/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper/canvas-test-helper';
import { CANVAS_HEIGHT, CANVAS_WIDTH, NUMBER_OF_TILES } from '@app/classes/constants/board-dimensions';
import { LetterPlacement } from '@app/classes/interfaces/letter-placement';
import { Tools } from '@app/classes/tools/tools';
import { BoardSelectionIteratorService } from '@app/services/board-selection-iterator/board-selection-iterator.service';
import { NO_SELECTION } from '@app/services/board-selection/board-selection.service';
import { BoardService } from '@app/services/board/board.service';
import { ChatboxManagerService } from '@app/services/chatbox-manager/chatbox-manager.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { LetterPlacementService } from '@app/services/letter-placement/letter-placement.service';
import { RackService } from '@app/services/rack/rack.service';
import { BONUS_LETTER } from '@common/constants/reserve-constant';
import { Letter, Tile } from '@common/interfaces/board-interface';
import { Vec2 } from '@common/interfaces/vec2';
import { Subject } from 'rxjs';

describe('BoardService', () => {
    let service: BoardService;
    let gameManagerServiceStub: Partial<GameManagerService>;
    let boardEvent: Subject<Tile[][]>;
    let letterPlacementSpy: jasmine.SpyObj<LetterPlacementService>;
    let boardSelectionSpy: jasmine.SpyObj<BoardSelectionIteratorService>;
    let rackSpy: jasmine.SpyObj<RackService>;
    let commandSenderSpy: jasmine.SpyObj<ChatboxManagerService>;

    const tilePosition: Vec2 = { x: 0, y: 0 };
    const letterA: Letter = { letter: 'A', value: 1 };
    const letterPlaced: LetterPlacement = { letter: { ...letterA }, position: { ...tilePosition } };

    beforeEach(() => {
        boardEvent = new Subject<Tile[][]>();

        gameManagerServiceStub = {
            boardEvent,
        };

        letterPlacementSpy = jasmine.createSpyObj('LetterPlacementService', [
            'redrawBoard',
            'changeTextSize',
            'save',
            'clearSaveStack',
            'drawLetterTile',
            'load',
        ]);
        boardSelectionSpy = jasmine.createSpyObj(
            'BoardSelectionIteratorService',
            ['next', 'draw', 'hasNext', 'hasPrevious', 'previous'],
            ['selectedPosition'],
        );
        rackSpy = jasmine.createSpyObj('RackService', ['addLetter', 'removeLetter']);
        commandSenderSpy = jasmine.createSpyObj('ChatboxManagerService', ['sendCommand']);
        boardSelectionSpy.selectionPosition = NO_SELECTION;
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: GameManagerService, useValue: gameManagerServiceStub },
                { provide: LetterPlacementService, useValue: letterPlacementSpy },
                { provide: BoardSelectionIteratorService, useValue: boardSelectionSpy },
                { provide: RackService, useValue: rackSpy },
                { provide: ChatboxManagerService, useValue: commandSenderSpy },
            ],
        });
        const ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(BoardService);
        service.letterPlacementGridContext = ctxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should change board on signal and call redrawBoard', () => {
        const board: Tile[][] = [[]];
        gameManagerServiceStub.boardEvent?.next(board);
        expect(service.board).toEqual(board);
        expect(letterPlacementSpy.redrawBoard).toHaveBeenCalled();
    });

    it('letterPlacementGridContext setter should change gridContext of LetterPlacementService', () => {
        const ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.letterPlacementGridContext = ctxStub;
        expect(service['letterService'].gridContext).toEqual(ctxStub);
    });

    it('boardSelectionGridContext setter should change gridContext of BoardSelectionIterator', () => {
        const ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.boardSelectionGridContext = ctxStub;
        expect(service['boardSelection'].gridContext).toEqual(ctxStub);
    });

    it('newBoardIterator setter should set newTilePosition of BoardSelectionIterator', () => {
        service.newBoardIterator = tilePosition;
        expect(service['boardSelection'].newSelectionPosition).toEqual(tilePosition);
    });

    it('setting newBoardIterator should not change the value if currentWord is not empty', () => {
        const expected = service['boardSelection'].newSelectionPosition;
        service.currentWord = [{ ...letterPlaced }];
        service.newBoardIterator = tilePosition;
        expect(service['boardSelection'].newSelectionPosition).toEqual(expected);
    });

    it('setting newBoardIterator should not change the value if position is occupied', () => {
        const expected = service['boardSelection'].newSelectionPosition;
        service.board[tilePosition.x][tilePosition.y].tile.letter = letterA.letter;
        service.newBoardIterator = tilePosition;
        expect(service['boardSelection'].newSelectionPosition).toEqual(expected);
    });

    it('textSize setter should call changeTextSize and redrawBoard', () => {
        service.textSize = 0;
        expect(letterPlacementSpy.changeTextSize).toHaveBeenCalledWith(0);
        expect(letterPlacementSpy.redrawBoard).toHaveBeenCalled();
        expect(letterPlacementSpy.clearSaveStack).toHaveBeenCalled();
    });

    it('textSize setter should redraw the currentWord', () => {
        service.currentWord = [
            { ...letterPlaced, letter: { letter: 'V', value: 1 } },
            { ...letterPlaced, letter: { letter: 'A', value: 1 } },
            { ...letterPlaced, letter: { letter: 'C', value: 1 } },
            { ...letterPlaced, letter: { letter: 'H', value: 1 } },
            { ...letterPlaced, letter: { letter: 'E', value: 1 } },
        ];
        const expectedCalls = service.currentWord.length;
        service.textSize = 0;
        expect(letterPlacementSpy.drawLetterTile).toHaveBeenCalledTimes(expectedCalls);
        expect(letterPlacementSpy.save).toHaveBeenCalledTimes(expectedCalls);
    });

    it('placeLetter should return false if there is no currently selected position on the board and should not call rack.removeLetter', () => {
        const expected = false;
        const letterToPlace = 'A';
        const result = service.placeLetter(letterToPlace);
        expect(result).toEqual(expected);
        expect(rackSpy.removeLetter).not.toHaveBeenCalled();
    });

    it('placeLetter should return false when trying to place a letter that is not in the rack and should call rack.removeLetter', () => {
        const expected = false;
        const letterToPlace = 'X';
        const selectedPosition: Vec2 = { x: 7, y: 7 };
        boardSelectionSpy.selectionPosition = selectedPosition;
        const result = service.placeLetter(letterToPlace);
        expect(result).toEqual(expected);
        expect(rackSpy.removeLetter).toHaveBeenCalled();
    });

    it('placeLetter should return true when trying to place a letter that is in the rack, should call save and drawLetterTile on letterService and \
        call boardSelection.next() and boardSelection.draw() once', () => {
        const expected = true;
        const letterToPlace = 'A';
        const selectedPosition: Vec2 = { x: 7, y: 7 };
        boardSelectionSpy.selectionPosition = selectedPosition;
        service['goToNextPosition'] = jasmine.createSpy('goToNextPosition').and.stub();
        rackSpy.removeLetter.and.returnValue(letterA);
        const result = service.placeLetter(letterToPlace);
        expect(result).toEqual(expected);
        expect(rackSpy.removeLetter).toHaveBeenCalled();
        expect(letterPlacementSpy.save).toHaveBeenCalledTimes(1);
        expect(letterPlacementSpy.drawLetterTile).toHaveBeenCalledTimes(1);
        expect(service['goToNextPosition']).toHaveBeenCalledTimes(1);
        expect(boardSelectionSpy.draw).toHaveBeenCalledTimes(1);
    });

    it('placeLetter should return true when trying to place a letter that is in the rack, and \
        should call save and drawLetterTile on letterService and call goToNextPosition once and boardSelection.draw() once', () => {
        const expected = true;
        const letterToPlace = 'A';
        const selectedPosition: Vec2 = { x: 7, y: 7 };
        boardSelectionSpy.selectionPosition = selectedPosition;
        rackSpy.removeLetter.and.returnValue(letterA);
        service['goToNextPosition'] = jasmine.createSpy('goToNextPosition').and.stub();
        const result = service.placeLetter(letterToPlace);
        expect(result).toEqual(expected);
        expect(rackSpy.removeLetter).toHaveBeenCalled();
        expect(letterPlacementSpy.save).toHaveBeenCalledTimes(1);
        expect(letterPlacementSpy.drawLetterTile).toHaveBeenCalledTimes(1);
        expect(service['goToNextPosition']).toHaveBeenCalledTimes(1);
        expect(boardSelectionSpy.draw).toHaveBeenCalledTimes(1);
    });

    it('placeLetter should return true when trying to place a blank letter that is in the rack, and \
        should call save and drawLetterTile on letterService and call goToNextPosition once and boardSelection.draw() once', () => {
        const expected = true;
        const letterToPlace = 'A';
        const selectedPosition: Vec2 = { x: 7, y: 7 };
        boardSelectionSpy.selectionPosition = selectedPosition;
        rackSpy.removeLetter.and.returnValue(letterA);
        service['goToNextPosition'] = jasmine.createSpy('goToNextPosition').and.stub();
        const result = service.placeLetter(letterToPlace, true);
        expect(result).toEqual(expected);
        expect(rackSpy.removeLetter).toHaveBeenCalledWith(BONUS_LETTER);
        expect(letterPlacementSpy.save).toHaveBeenCalledTimes(1);
        expect(letterPlacementSpy.drawLetterTile).toHaveBeenCalledTimes(1);
        expect(service['goToNextPosition']).toHaveBeenCalledTimes(1);
        expect(boardSelectionSpy.draw).toHaveBeenCalledTimes(1);
    });

    it('goToNextPosition should call boardSelection.next() until it reaches a empty spot', () => {
        const expectedCalls = 2;
        const selectedPosition: Vec2 = { x: 7, y: 7 };
        boardSelectionSpy.selectionPosition = selectedPosition;
        service.board[selectedPosition.x + 1][selectedPosition.y] = { tile: { letter: 'A', value: 0 }, bonus: 0, placedThisTurn: false };
        boardSelectionSpy.next.and.callFake(() => {
            boardSelectionSpy.selectionPosition.x += 1;
        });
        boardSelectionSpy.hasNext.and.returnValue(true);
        service['goToNextPosition']();
        expect(boardSelectionSpy.next).toHaveBeenCalledTimes(expectedCalls);
    });

    it('goToNextPosition should call boardSelection.next() once if the next spot is empty', () => {
        const expectedCalls = 1;
        const selectedPosition: Vec2 = { x: 7, y: 7 };
        boardSelectionSpy.selectionPosition = selectedPosition;
        boardSelectionSpy.next.and.callFake(() => {
            boardSelectionSpy.selectionPosition.x += 1;
        });
        boardSelectionSpy.hasNext.and.returnValue(true);
        service['goToNextPosition']();
        expect(boardSelectionSpy.next).toHaveBeenCalledTimes(expectedCalls);
    });

    it('goToNextPosition should call boardSelection.next() once if the next spot is out of bounds', () => {
        const expectedCalls = 1;
        const selectedPosition: Vec2 = { x: 7, y: 7 };
        boardSelectionSpy.selectionPosition = selectedPosition;
        boardSelectionSpy.next.and.callFake(() => {
            boardSelectionSpy.selectionPosition.x += 1;
        });
        boardSelectionSpy.hasNext.and.returnValue(false);
        service['goToNextPosition']();
        expect(boardSelectionSpy.next).toHaveBeenCalledTimes(expectedCalls);
    });

    it('removeLastLetter should not call letterService.load() if there is no letter that were placed on the board yet', () => {
        service.removeLastLetter();
        expect(letterPlacementSpy.load).not.toHaveBeenCalled();
    });

    it('removeLastLetter should call letterService.load() if there is a letter that was placed on the board, should call \
        addLetter on rackService and draw() on boardSelectionService once', () => {
        const selectedPosition: Vec2 = { x: 7, y: 7 };
        service.currentWord = [{ ...letterPlaced, position: { ...selectedPosition, x: selectedPosition.x - 1 } }];
        boardSelectionSpy.selectionPosition = selectedPosition;
        service['goToPreviousPosition'] = jasmine.createSpy('goToPreviousPosition').and.stub();
        service.removeLastLetter();
        expect(rackSpy.addLetter).toHaveBeenCalled();
        expect(service['goToPreviousPosition']).toHaveBeenCalledTimes(1);
        expect(boardSelectionSpy.draw).toHaveBeenCalledTimes(1);
    });

    it('goToPreviousPosition should call boardSelection.previous() until it reaches a empty spot', () => {
        const expectedCalls = 2;
        const selectedPosition: Vec2 = { x: 7, y: 7 };
        boardSelectionSpy.selectionPosition = selectedPosition;
        service.board[selectedPosition.x - 1][selectedPosition.y] = { tile: { letter: 'A', value: 0 }, bonus: 0, placedThisTurn: false };
        boardSelectionSpy.previous.and.callFake(() => {
            boardSelectionSpy.selectionPosition.x -= 1;
        });
        boardSelectionSpy.hasPrevious.and.returnValue(true);
        service['goToPreviousPosition']();
        expect(boardSelectionSpy.previous).toHaveBeenCalledTimes(expectedCalls);
    });

    it('goToPreviousPosition should call boardSelection.previous() once if the next spot is empty', () => {
        const expectedCalls = 1;
        const selectedPosition: Vec2 = { x: 7, y: 7 };
        boardSelectionSpy.selectionPosition = selectedPosition;
        boardSelectionSpy.previous.and.callFake(() => {
            boardSelectionSpy.selectionPosition.x -= 1;
        });
        boardSelectionSpy.hasPrevious.and.returnValue(true);
        service['goToPreviousPosition']();
        expect(boardSelectionSpy.previous).toHaveBeenCalledTimes(expectedCalls);
    });

    it('goToPreviousPosition should not call boardSelection.previous() if the previous spot is beyond startingPosition', () => {
        const selectedPosition: Vec2 = { x: 7, y: 7 };
        boardSelectionSpy.selectionPosition = selectedPosition;
        boardSelectionSpy.previous.and.callFake(() => {
            boardSelectionSpy.selectionPosition.x -= 1;
        });
        boardSelectionSpy.hasPrevious.and.returnValue(false);
        service['goToPreviousPosition']();
        expect(boardSelectionSpy.previous).not.toHaveBeenCalled();
    });

    it('clear should call removeLastLetter as many times as the number of letters in currentWord', () => {
        service.currentWord = [{ ...letterPlaced }, { ...letterPlaced }];
        const expectedCalls = service.currentWord.length;
        const spy = spyOn(service, 'removeLastLetter').and.callFake(() => {
            service.currentWord.pop();
        });
        service.clear();
        expect(spy).toHaveBeenCalledTimes(expectedCalls);
    });

    it('placeCommand getter should call placementToString and wordInString and return the right value', () => {
        const expected = '!placer h8h vache';
        service.currentWord = [
            { ...letterPlaced, letter: { letter: 'V', value: 1 } },
            { ...letterPlaced, letter: { letter: 'A', value: 1 } },
            { ...letterPlaced, letter: { letter: 'C', value: 1 } },
            { ...letterPlaced, letter: { letter: 'H', value: 1 } },
            { ...letterPlaced, letter: { letter: 'E', value: 1 } },
        ];
        spyOn(Tools, 'coordinatesToString').and.returnValue('h8');
        spyOn(Tools, 'orientationToString').and.returnValue('h');
        expect(service.placeCommand).toEqual(expected);
    });

    it('placementToString getter should call coordinatesToString of Tools', () => {
        const expected = 'h8h';
        const coordSpy = spyOn(Tools, 'coordinatesToString').and.returnValue('h8');
        const orientationSpy = spyOn(Tools, 'orientationToString').and.returnValue('h');
        expect(service['placementToString']).toEqual(expected);
        expect(coordSpy).toHaveBeenCalled();
        expect(orientationSpy).toHaveBeenCalled();
    });

    it('wordInString getter should append all letters of a word into a string', () => {
        const expected = 'vache';
        service.currentWord = [
            { ...letterPlaced, letter: { letter: 'V', value: 1 } },
            { ...letterPlaced, letter: { letter: 'A', value: 1 } },
            { ...letterPlaced, letter: { letter: 'C', value: 1 } },
            { ...letterPlaced, letter: { letter: 'H', value: 1 } },
            { ...letterPlaced, letter: { letter: 'E', value: 1 } },
        ];
        expect(service['wordInString']).toEqual(expected);
    });

    it('wordInString getter should turn a letter to uppercase if its value is 0', () => {
        const expected = 'vaChe';
        service.currentWord = [
            { ...letterPlaced, letter: { letter: 'V', value: 1 } },
            { ...letterPlaced, letter: { letter: 'A', value: 1 } },
            { ...letterPlaced, letter: { letter: 'C', value: 0 } },
            { ...letterPlaced, letter: { letter: 'H', value: 1 } },
            { ...letterPlaced, letter: { letter: 'E', value: 1 } },
        ];
        expect(service['wordInString']).toEqual(expected);
    });

    it('sendCommand should not call commandSender.sendCommand if there is no letters that were added to the board', () => {
        service.currentWord = [];
        service.sendCommand();
        expect(commandSenderSpy.sendCommand).not.toHaveBeenCalled();
    });

    it('sendCommand should call commandSender.sendCommand if there is more', () => {
        service.currentWord = [{ ...letterPlaced }];
        spyOnProperty(service, 'placeCommand').and.returnValue('!placer h8h a');
        service.sendCommand();
        expect(commandSenderSpy.sendCommand).toHaveBeenCalledWith(service.placeCommand);
    });

    it('initBoard should initialize an empty board', () => {
        const expectedContent: Tile = { bonus: 0, tile: { letter: '', value: 0 }, placedThisTurn: false };
        service.initBoard();

        expect(service.board.length).toEqual(NUMBER_OF_TILES);
        for (let i = 0; i < NUMBER_OF_TILES; i++) {
            expect(service.board[i].length).toEqual(NUMBER_OF_TILES);
            for (let j = 0; j < NUMBER_OF_TILES; j++) {
                expect(service.board[i][j]).toEqual(expectedContent);
            }
        }
    });
});
