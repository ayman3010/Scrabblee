/* eslint-disable dot-notation */
/* tslint:disable:no-unused-variable */

import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper/canvas-test-helper';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@app/classes/constants/board-dimensions';
import { MouseButton } from '@app/classes/enums/mouse-button.enum';
import { Tools } from '@app/classes/tools/tools';
import { BoardInputHandlerService } from '@app/services/board-input-handler/board-input-handler.service';
import { NO_SELECTION } from '@app/services/board-selection/board-selection.service';
import { BoardService } from '@app/services/board/board.service';
import { ClearBoardSelectionService } from '@app/services/clear-board-selection/clear-board-selection.service';
import { Subject } from 'rxjs';

describe('Service: BoardInputHandler', () => {
    let service: BoardInputHandlerService;
    let boardServiceSpy: jasmine.SpyObj<BoardService>;
    let clearBoardSelectionDetectorSpy: Partial<ClearBoardSelectionService>;

    const validTilePosition = { x: 0, y: 0 };

    beforeEach(() => {
        clearBoardSelectionDetectorSpy = {
            clearBoardEvent: new Subject(),
        };
        boardServiceSpy = jasmine.createSpyObj('BoardService', ['removeLastLetter', 'placeLetter', 'clear', 'sendCommand', 'initBoard']);
        TestBed.configureTestingModule({
            providers: [
                { provide: BoardService, useValue: boardServiceSpy },
                { provide: ClearBoardSelectionService, useValue: clearBoardSelectionDetectorSpy },
            ],
        });
        const ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service = TestBed.inject(BoardInputHandlerService);
        service.boardSelectionGridContext = ctxStub;
        service.letterPlacementGridContext = ctxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('boardSelectionGridContext setter should change boardSelectionGridContext of BoardService', () => {
        const ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.boardSelectionGridContext = ctxStub;
        expect(service['boardService'].boardSelectionGridContext).toEqual(ctxStub);
    });

    it('textSize setter should set textSize of BoardService', () => {
        service.textSize = 0;
        expect(service['boardService'].textSize).toEqual(0);
    });

    it('newSelectionPosition setter should set newTilePosition with translated tile if in bounds ', () => {
        const eventOffsets = { x: 1, y: 1 };
        const translateTileSpy = spyOn(service, 'translateTilePosition').and.returnValue(validTilePosition);
        const isInBoundsSpy = spyOn(Tools, 'isInBounds').and.returnValue(true);
        service.newSelectionPosition = eventOffsets;
        expect(service['boardService'].newBoardIterator).toEqual(validTilePosition);
        expect(translateTileSpy).toHaveBeenCalledWith(eventOffsets);
        expect(isInBoundsSpy).toHaveBeenCalled();
    });

    it('newSelectionPosition setter should set newTilePosition with NO_SELECTION if not in bounds ', () => {
        const eventOffsets = { x: 1, y: 1 };
        const translateTileSpy = spyOn(service, 'translateTilePosition').and.returnValue(validTilePosition);
        const isInBoundsSpy = spyOn(Tools, 'isInBounds').and.returnValue(false);
        service.newSelectionPosition = eventOffsets;
        expect(service['boardService'].newBoardIterator).toEqual(NO_SELECTION);
        expect(translateTileSpy).toHaveBeenCalledWith(eventOffsets);
        expect(isInBoundsSpy).toHaveBeenCalled();
    });

    it('translateTilePosition should return coordinates from event offset', () => {
        const eventOffsets = { x: 65, y: 130 };
        const expectedCoordinates = { x: 0, y: 2 };
        const returnValue = service.translateTilePosition(eventOffsets);
        expect(returnValue).toEqual(expectedCoordinates);
    });

    it('handleBoardClick should set newSelectionPosition', () => {
        const spy = spyOnProperty(service, 'newSelectionPosition', 'set');
        const mouseEvent = new MouseEvent('click', { button: MouseButton.Left });
        const eventOffsets = { x: mouseEvent.offsetX, y: mouseEvent.offsetY };
        service.handleBoardClick(mouseEvent);
        expect(spy).toHaveBeenCalledWith(eventOffsets);
    });

    it('handleBoardClick should set newSelectionPosition', () => {
        const spy = spyOnProperty(service, 'newSelectionPosition', 'set');
        const mouseEvent = new MouseEvent('click', { button: MouseButton.Right });
        service.handleBoardClick(mouseEvent);
        expect(spy).not.toHaveBeenCalled();
    });

    it('handleKeyboard should call removeLastLetter if key pressed is Backspace', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
        service.handleKeyboard(keyboardEvent);
        expect(boardServiceSpy.removeLastLetter).toHaveBeenCalled();
    });

    it('handleKeyboard should call placeLetter with letter pressed', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'a' });
        service.handleKeyboard(keyboardEvent);
        expect(boardServiceSpy.placeLetter).toHaveBeenCalledWith(keyboardEvent.key.toUpperCase(), false);
    });

    it('handleKeyboard should call clear with if key pressed is Escape', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        service.handleKeyboard(keyboardEvent);
        expect(boardServiceSpy.clear).toHaveBeenCalled();
    });

    it('handleKeyboard should call boardService.sendCommand(); with if key pressed is Enter', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        const spy = spyOn(service, 'confirmPlacement').and.stub();
        service.handleKeyboard(keyboardEvent);
        expect(spy).toHaveBeenCalled();
    });

    it('handleKeyboard should not call anything if key pressed is not a character', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'tooLong' });
        service.handleKeyboard(keyboardEvent);
        expect(boardServiceSpy.clear).not.toHaveBeenCalled();
        expect(boardServiceSpy.placeLetter).not.toHaveBeenCalled();
        expect(boardServiceSpy.removeLastLetter).not.toHaveBeenCalled();
    });

    it('confirmPlacement should call sendCommand', () => {
        service.confirmPlacement();
        expect(boardServiceSpy.sendCommand).toHaveBeenCalled();
    });

    it('init should call initBoard', () => {
        service.init();
        expect(boardServiceSpy.initBoard).toHaveBeenCalled();
    });

    it('should call clear of boardService on clearBoardEvent', () => {
        clearBoardSelectionDetectorSpy.clearBoardEvent?.next();
        expect(boardServiceSpy.clear).toHaveBeenCalled();
    });
});
