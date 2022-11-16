/* eslint-disable dot-notation */
/* tslint:disable:no-unused-variable */

import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper/canvas-test-helper';
import {
    BORDERS_WIDTH,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    DEFAULT_LETTER_TEXT_SIZE,
    MINIMUM_TILE_INDEX,
    NUMBER_OF_TILES,
    TILES_HEIGHT,
    TILES_WIDTH,
} from '@app/classes/constants/board-dimensions';
import { Letter, Tile } from '@common/interfaces/board-interface';
import { Vec2 } from '@common/interfaces/vec2';
import { DEFAULT_LETTER_VALUE_SIZE, LetterPlacementService, MAXIMUM_SAVE_STACK_SIZE, TEMPORARY_TILE_BORDER_COLOR } from './letter-placement.service';

describe('Service: LetterPlacement', () => {
    let service: LetterPlacementService;
    let ctxStub: CanvasRenderingContext2D;

    const tilePosition: Vec2 = { x: 0, y: 0 };
    const invalidTilePosition: Vec2 = { x: -1, y: -1 };
    const DEFAULT_TEXT_SIZE = { letter: DEFAULT_LETTER_TEXT_SIZE, letterValue: DEFAULT_LETTER_VALUE_SIZE };
    const letter: Letter = { letter: 'A', value: 1 };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(LetterPlacementService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.gridContext = ctxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('drawLetterTile should not call drawBorderedTile or drawLetterTile if the tile would be out of the grid', () => {
        const drawBorderedTileSpy = spyOn(service, 'drawBorderedTile').and.stub();
        const drawLetterTileLabelSpy = spyOn(service, 'drawLetterTileLabel').and.stub();
        service.drawLetterTile(letter, invalidTilePosition);
        expect(drawBorderedTileSpy).not.toHaveBeenCalled();
        expect(drawLetterTileLabelSpy).not.toHaveBeenCalled();
    });

    it('drawLetterTile should call drawBorderedTile before drawLetterTileLabel', () => {
        const drawBorderedTileSpy = spyOn(service, 'drawBorderedTile').and.stub();
        const drawLetterTileLabelSpy = spyOn(service, 'drawLetterTileLabel').and.stub();
        service.drawLetterTile(letter, tilePosition);
        expect(drawBorderedTileSpy).toHaveBeenCalledBefore(drawLetterTileLabelSpy);
    });

    it('drawBorderedTile should call drawTileBackground before drawTileBorders', () => {
        const drawTileBackgroundSpy = spyOn(service, 'drawTileBackground').and.stub();
        const drawTileBordersSpy = spyOn(service, 'drawTileBorders').and.stub();
        service.drawBorderedTile(tilePosition);
        expect(drawTileBackgroundSpy).toHaveBeenCalledBefore(drawTileBordersSpy);
    });

    it('drawTileBackground should call fillRect with the correct parameters', () => {
        const fillRectSpy = spyOn(service.gridContext, 'fillRect').and.stub();
        const start = { x: BORDERS_WIDTH + TILES_WIDTH * tilePosition.x, y: BORDERS_WIDTH + TILES_HEIGHT * tilePosition.y };
        const dimensions = { x: TILES_WIDTH, y: TILES_HEIGHT };
        service.drawTileBackground(tilePosition);
        expect(fillRectSpy).toHaveBeenCalledWith(start.x, start.y, dimensions.x, dimensions.y);
    });

    it('drawTileBackground should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawTileBackground(tilePosition);
        imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('drawTileBorders should call strokeRect with the correct parameters', () => {
        const strokeRectSpy = spyOn(service.gridContext, 'strokeRect').and.stub();
        const start = { x: BORDERS_WIDTH + TILES_WIDTH * tilePosition.x, y: BORDERS_WIDTH + TILES_HEIGHT * tilePosition.y };
        const dimensions = { x: TILES_WIDTH, y: TILES_HEIGHT };
        service.drawTileBorders(tilePosition);
        expect(strokeRectSpy).toHaveBeenCalledWith(start.x, start.y, dimensions.x, dimensions.y);
    });

    it('drawTileBorders should call strokeRect with the correct parameters', () => {
        const strokeRectSpy = spyOn(service.gridContext, 'strokeRect').and.stub();
        const start = { x: BORDERS_WIDTH + TILES_WIDTH * tilePosition.x, y: BORDERS_WIDTH + TILES_HEIGHT * tilePosition.y };
        const dimensions = { x: TILES_WIDTH, y: TILES_HEIGHT };
        service.drawTileBorders(tilePosition, true);
        expect(service.gridContext.strokeStyle).toEqual(TEMPORARY_TILE_BORDER_COLOR);
        expect(strokeRectSpy).toHaveBeenCalledWith(start.x, start.y, dimensions.x, dimensions.y);
    });

    it('drawTileBorders should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawTileBorders(tilePosition);
        imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('drawLetterTileLabel should call drawLetterLabel and drawLetterValueLabel', () => {
        const drawLetterLabelSpy = spyOn(service, 'drawLetterLabel').and.stub();
        const drawLetterValueLabelSpy = spyOn(service, 'drawLetterValueLabel').and.stub();
        service.drawLetterTileLabel(letter, tilePosition);
        expect(drawLetterLabelSpy).toHaveBeenCalled();
        expect(drawLetterValueLabelSpy).toHaveBeenCalled();
    });

    it('drawLetterLabel should call fillText', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.stub();
        service.drawLetterLabel(letter.letter, tilePosition);
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it('drawLetterLabel should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawLetterLabel(letter.letter, tilePosition);
        imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('drawLetterValueLabel should call fillText', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.stub();
        service.drawLetterValueLabel(letter.value, tilePosition);
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it('drawLetterValueLabel should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawLetterValueLabel(letter.value, tilePosition);
        imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('redrawBoard should not do anything if the board provided contains an empty array at the first row', () => {
        const drawLetterTileSpy = spyOn(service, 'drawLetterTile');
        const board: Tile[][] = [[], [], [], [], [], [], [], [], [], [], [], [], [], [], []];
        service.redrawBoard(board);
        expect(drawLetterTileSpy).not.toHaveBeenCalled();
    });

    it('redraw board should not call drawLetterTile if the board contains only empty tiles', () => {
        const drawLetterTileSpy = spyOn(service, 'drawLetterTile');
        const board: Tile[][] = [];
        for (let coordV = MINIMUM_TILE_INDEX; coordV < NUMBER_OF_TILES; coordV++) {
            board[coordV] = [];
            for (let coordH = MINIMUM_TILE_INDEX; coordH < NUMBER_OF_TILES; coordH++) {
                board[coordV][coordH] = { bonus: 0, tile: { letter: '', value: 0 }, placedThisTurn: false };
            }
        }

        service.redrawBoard(board);
        expect(drawLetterTileSpy).not.toHaveBeenCalled();
    });

    it('redraw board should only call drawLetterTile the same amount of times as there is tiles containing letters', () => {
        const drawLetterTileSpy = spyOn(service, 'drawLetterTile');
        const board: Tile[][] = [];
        for (let coordV = MINIMUM_TILE_INDEX; coordV < NUMBER_OF_TILES; coordV++) {
            board[coordV] = [];
            for (let coordH = MINIMUM_TILE_INDEX; coordH < NUMBER_OF_TILES; coordH++) {
                board[coordV][coordH] = { bonus: 0, tile: { letter: '', value: 0 }, placedThisTurn: false };
            }
        }

        board[0][0].tile.letter = 'U';
        board[0][1].tile.letter = 'N';
        board[0][2].tile.letter = 'I';
        board[0][3].tile.letter = 'T';
        const expectedCallTimes = 4;

        service.redrawBoard(board);
        expect(drawLetterTileSpy).toHaveBeenCalledTimes(expectedCallTimes);
    });

    it('changeTextSize should not change the text size if the value is too high', () => {
        const newTextSize = 69;

        service.changeTextSize(newTextSize);
        const result = service['textSize'];
        expect(result.letter).toEqual(DEFAULT_TEXT_SIZE.letter);
        expect(result.letterValue).toEqual(DEFAULT_TEXT_SIZE.letterValue);
    });

    it('changeTextSize should not change the text size if the value is too low', () => {
        const newTextSize = -42;

        service.changeTextSize(newTextSize);
        const result = service['textSize'];
        expect(result.letter).toEqual(DEFAULT_TEXT_SIZE.letter);
        expect(result.letterValue).toEqual(DEFAULT_TEXT_SIZE.letterValue);
    });

    it('changeTextSize should change the text size if the value is acceptable', () => {
        const newTextSize = 32;

        service.changeTextSize(newTextSize);
        const result = service['textSize'];
        expect(result.letter).toEqual(newTextSize);
        expect(result.letterValue).toEqual(newTextSize / 2);
    });

    it('save should push the current state of the layer on saveStack', () => {
        const expectedSize = 1;
        service.save();
        expect(service['saveStack'].length).toEqual(expectedSize);
    });

    it('save should not change the saveStack if it reached maximum capacity to prevent memory leak', () => {
        for (let i = 0; i < MAXIMUM_SAVE_STACK_SIZE; i++) service.save();
        const expectedSize = service['saveStack'].length;
        service.save();
        expect(service['saveStack'].length).toEqual(expectedSize);
    });

    it('load should pop the current state of the layer on saveStack and call putImageData if it is not undefined', () => {
        service.save();
        const expectedSize = 0;
        const spy = spyOn(service.gridContext, 'putImageData');
        service.load();
        expect(service['saveStack'].length).toEqual(expectedSize);
        expect(spy).toHaveBeenCalled();
    });

    it('load should pop the current state of the layer on saveStack and not call putImageData if it is undefined', () => {
        const expectedSize = 0;
        const spy = spyOn(service.gridContext, 'putImageData');
        service.load();
        expect(service['saveStack'].length).toEqual(expectedSize);
        expect(spy).not.toHaveBeenCalled();
    });

    it('clearSaveStack should set saveStack to an empty array', () => {
        service.save();
        const expectedSize = 0;
        service.clearSaveStack();
        expect(service['saveStack'].length).toEqual(expectedSize);
    });
});
