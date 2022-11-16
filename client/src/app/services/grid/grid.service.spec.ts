/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper/canvas-test-helper';
import {
    BORDERS_WIDTH,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    GRID_HEIGHT,
    GRID_WIDTH,
    TILES_HEIGHT,
    TILES_WIDTH,
    TILE_COUNT_HORIZONTAL,
    TILE_COUNT_VERTICAL,
} from '@app/classes/constants/board-dimensions';
import { GridService, MULTIPLIER_OFFSET, MULTIPLIER_SYMBOL, STAR_CHAR, STAR_OFFSET, TEXT_OFFSET } from '@app/services/grid/grid.service';
import { DOUBLE_LETTER, DOUBLE_LETTER_POSITIONS } from '@common/constants/board';
import { BonusTile } from '@common/interfaces/bonus-tile';
import { Vec2 } from '@common/interfaces/vec2';

describe('GridService', () => {
    let service: GridService;
    let ctxStub: CanvasRenderingContext2D;
    const bonusTile: BonusTile = DOUBLE_LETTER;
    const tilePosition: Vec2 = { x: 0, y: 0 };
    const invalidTilePosition: Vec2 = { x: -1, y: -1 };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GridService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.gridContext = ctxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('initializeBoard should call drawBorders before drawGrid', () => {
        const drawBordersSpy = spyOn(service, 'drawBorders').and.stub();
        const drawGridSpy = spyOn(service, 'drawGrid').and.stub();
        service.initializeBoard();
        expect(drawBordersSpy).toHaveBeenCalledBefore(drawGridSpy);
    });

    it('drawBorders should call drawBordersBackground before drawLabels', () => {
        const drawBordersBackgroundSpy = spyOn(service, 'drawBordersBackground').and.stub();
        const drawLabelsSpy = spyOn(service, 'drawLabels').and.stub();
        service.drawBorders();
        expect(drawBordersBackgroundSpy).toHaveBeenCalledBefore(drawLabelsSpy);
    });

    it('drawBordersBackground should call fillRect with the canvas dimensions', () => {
        const fillRectSpy = spyOn(service.gridContext, 'fillRect').and.stub();
        service.drawBordersBackground();
        expect(fillRectSpy).toHaveBeenCalledOnceWith(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    });

    it('drawBordersBackground should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawBordersBackground();
        imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('drawLabels should call drawColumnLabels and drawRowLabels', () => {
        const drawColumnLabelsSpy = spyOn(service, 'drawColumnLabels').and.stub();
        const drawRowLabelsSpy = spyOn(service, 'drawRowLabels').and.stub();
        service.drawLabels();
        expect(drawColumnLabelsSpy).toHaveBeenCalled();
        expect(drawRowLabelsSpy).toHaveBeenCalled();
    });

    it('drawColumnLabels should call fillText as many times as the number of tiles in a row', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.stub();
        service.drawColumnLabels();
        expect(fillTextSpy).toHaveBeenCalledTimes(TILE_COUNT_HORIZONTAL);
    });

    it('drawColumnLabels should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawColumnLabels();
        imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('drawRowLabels should call fillText as many times as the number of tiles in a column', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.stub();
        service.drawRowLabels();
        expect(fillTextSpy).toHaveBeenCalledTimes(TILE_COUNT_VERTICAL);
    });

    it('drawRowLabels should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawRowLabels();
        imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('drawGridBackground should call fillRect with the grid dimensions', () => {
        const fillRectSpy = spyOn(service.gridContext, 'fillRect').and.stub();
        service.drawGridBackground();
        expect(fillRectSpy).toHaveBeenCalledOnceWith(BORDERS_WIDTH, BORDERS_WIDTH, GRID_WIDTH, GRID_HEIGHT);
    });

    it('drawGridBackground should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawGridBackground();
        imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('drawGrid should call functions in the correct order', () => {
        const drawGridBackgroundSpy = spyOn(service, 'drawGridBackground').and.stub();
        const drawAllBonusTilesSpy = spyOn(service, 'drawAllBonusTiles').and.stub();
        const drawGridLinesSpy = spyOn(service, 'drawGridLines').and.stub();
        service.drawGrid();
        expect(drawGridBackgroundSpy).toHaveBeenCalledBefore(drawAllBonusTilesSpy);
        expect(drawAllBonusTilesSpy).toHaveBeenCalledBefore(drawGridLinesSpy);
    });

    it('drawGridLines should call functions in the correct order', () => {
        const beginPathSpy = spyOn(service.gridContext, 'beginPath').and.stub();
        const traceGridLinesSpy = spyOn(service, 'traceGridLines').and.stub();
        const strokeSpy = spyOn(service.gridContext, 'stroke').and.stub();
        service.drawGridLines();
        expect(beginPathSpy).toHaveBeenCalledBefore(traceGridLinesSpy);
        expect(traceGridLinesSpy).toHaveBeenCalledBefore(strokeSpy);
    });

    it('drawGridLines should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawGridLines();
        imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('traceGridLines should call traceLine to trace a grid with the correct number of tiles', () => {
        const numberOfRequiredLines = TILE_COUNT_HORIZONTAL + TILE_COUNT_VERTICAL + 2;
        const traceLineSpy = spyOn(service, 'traceLine').and.stub();
        service.traceGridLines();
        expect(traceLineSpy).toHaveBeenCalledTimes(numberOfRequiredLines);
    });

    it('traceLine should call moveTo with lineStart and lineTo with lineEnd', () => {
        const lineStart = { x: 0, y: 0 };
        const lineEnd = { x: 1, y: 1 };
        const moveToSpy = spyOn(service.gridContext, 'moveTo').and.stub();
        const lineToSpy = spyOn(service.gridContext, 'lineTo').and.stub();
        service.traceLine(lineStart, lineEnd);
        expect(moveToSpy).toHaveBeenCalledOnceWith(lineStart.x, lineStart.y);
        expect(lineToSpy).toHaveBeenCalledOnceWith(lineEnd.x, lineEnd.y);
    });

    it('drawAllBonusTiles should call drawBonusTiles 4 times', () => {
        const numberOfBonusType = 4;
        const drawBonusTilesSpy = spyOn(service, 'drawBonusTiles').and.stub();
        service.drawAllBonusTiles();
        expect(drawBonusTilesSpy).toHaveBeenCalledTimes(numberOfBonusType);
    });

    it('drawAllBonusTiles should call drawCenterTile before drawBonusTiles', () => {
        const drawBonusTilesSpy = spyOn(service, 'drawBonusTiles').and.stub();
        const drawCenterTileSpy = spyOn(service, 'drawCenterTile').and.stub();
        service.drawAllBonusTiles();
        expect(drawBonusTilesSpy).toHaveBeenCalledBefore(drawCenterTileSpy);
    });

    it('drawBonusTiles should call drawBonusTile as many times as the length of positions', () => {
        const drawTileSpy = spyOn(service, 'drawBonusTile').and.stub();
        const tilePositions: Vec2[] = DOUBLE_LETTER_POSITIONS;
        service.drawBonusTiles(bonusTile, tilePositions);
        expect(drawTileSpy).toHaveBeenCalledTimes(tilePositions.length);
    });

    it('drawBonusTile should not call drawTileBackground or drawBonusTileLabel if the tile would be out of the grid', () => {
        const drawTileBackgroundSpy = spyOn(service, 'drawTileBackground').and.stub();
        const drawBonusTileLabelSpy = spyOn(service, 'drawBonusTileLabel').and.stub();
        service.drawBonusTile(bonusTile, invalidTilePosition);
        expect(drawTileBackgroundSpy).not.toHaveBeenCalled();
        expect(drawBonusTileLabelSpy).not.toHaveBeenCalled();
    });

    it('drawBonusTile should call drawTileBackground before drawBonusTileLabel', () => {
        const drawTileBackgroundSpy = spyOn(service, 'drawTileBackground').and.stub();
        const drawBonusTileLabelSpy = spyOn(service, 'drawBonusTileLabel').and.stub();
        service.drawBonusTile(bonusTile, tilePosition);
        expect(drawTileBackgroundSpy).toHaveBeenCalledBefore(drawBonusTileLabelSpy);
    });

    it('drawTileBackground should call fillRect with correct parameters', () => {
        const fillRectSpy = spyOn(service.gridContext, 'fillRect').and.stub();
        const color = 'cyan';
        const start: Vec2 = { x: BORDERS_WIDTH + TILES_WIDTH * tilePosition.x, y: BORDERS_WIDTH + TILES_HEIGHT * tilePosition.y };
        const dimensions: Vec2 = { x: TILES_WIDTH, y: TILES_HEIGHT };
        service.drawTileBackground(color, tilePosition);
        expect(fillRectSpy).toHaveBeenCalledOnceWith(start.x, start.y, dimensions.x, dimensions.y);
    });

    it('drawTileBackground should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        const color = 'cyan';
        service.drawTileBackground(color, tilePosition);
        imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('drawBonusTileLabel should call fillText with correct parameters', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.stub();
        const drawPosition: Vec2 = {
            x: BORDERS_WIDTH + TILES_WIDTH * tilePosition.x,
            y: BORDERS_WIDTH + TILES_HEIGHT * tilePosition.y,
        };
        const textStart: Vec2 = { x: drawPosition.x + TEXT_OFFSET.x, y: drawPosition.y + TEXT_OFFSET.y };
        const multiplierStart: Vec2 = { x: drawPosition.x + MULTIPLIER_OFFSET.x, y: drawPosition.y + MULTIPLIER_OFFSET.y };
        const maxWidth = TILES_WIDTH;
        const multiplierString = MULTIPLIER_SYMBOL + bonusTile.multiplier;
        service.drawBonusTileLabel(bonusTile, tilePosition);
        expect(fillTextSpy).toHaveBeenCalledWith(bonusTile.text, textStart.x, textStart.y, maxWidth);
        expect(fillTextSpy).toHaveBeenCalledWith(multiplierString, multiplierStart.x, multiplierStart.y, maxWidth);
    });

    it('drawBonusTileLabel should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawBonusTileLabel(bonusTile, tilePosition);
        imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('drawCenterTile should call drawTileBackground before drawStar', () => {
        const drawTileBackgroundSpy = spyOn(service, 'drawTileBackground').and.stub();
        const drawStarSpy = spyOn(service, 'drawStar').and.stub();
        service.drawCenterTile();
        expect(drawTileBackgroundSpy).toHaveBeenCalledBefore(drawStarSpy);
    });

    it('drawStar should call fillText with correct parameters', () => {
        const fillTextSpy = spyOn(service.gridContext, 'fillText').and.stub();
        const drawPosition: Vec2 = {
            x: BORDERS_WIDTH + TILES_WIDTH * tilePosition.x,
            y: BORDERS_WIDTH + TILES_HEIGHT * tilePosition.y,
        };
        const start: Vec2 = { x: drawPosition.x + STAR_OFFSET.x, y: drawPosition.y + STAR_OFFSET.y };
        const maxWidth = TILES_WIDTH;
        service.drawStar(tilePosition);
        expect(fillTextSpy).toHaveBeenCalledWith(STAR_CHAR, start.x, start.y, maxWidth);
    });

    it('drawStar should color pixels on the canvas', () => {
        let imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawStar(tilePosition);
        imageData = service.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });
});
