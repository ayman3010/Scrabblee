/* tslint:disable:no-unused-variable */

import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper/canvas-test-helper';
import { BORDERS_WIDTH, CANVAS_HEIGHT, CANVAS_WIDTH, TILES_HEIGHT, TILES_WIDTH } from '@app/classes/constants/board-dimensions';
import { Tools } from '@app/classes/tools/tools';
import { BoardSelectionService, CHAR_DOWN_ARROW, CHAR_RIGHT_ARROW, NO_SELECTION } from '@app/services/board-selection/board-selection.service';
import { Orientation } from '@common/enums/enums';
import { Vec2 } from '@common/interfaces/vec2';

describe('Service: BoardSelection', () => {
    let service: BoardSelectionService;
    let ctxStub: CanvasRenderingContext2D;

    const tilePosition: Vec2 = { x: 0, y: 0 };

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BoardSelectionService);
        ctxStub = CanvasTestHelper.createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.gridContext = ctxStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('drawBoardSelection should call clearGridContext before drawSelectionTile', () => {
        const clearSpy = spyOn(Tools, 'clearGridContext').and.stub();
        const isInBoundsSpy = spyOn(Tools, 'isInBounds').and.returnValue(true);
        const drawSelectionTileSpy = spyOn(service, 'drawSelectionTile').and.stub();
        service.drawBoardSelection(tilePosition, Orientation.Horizontal);
        expect(isInBoundsSpy).toHaveBeenCalled();
        expect(clearSpy).toHaveBeenCalledBefore(drawSelectionTileSpy);
    });

    it('drawBoardSelection should not call drawSelectionTile if selection out of bounds', () => {
        const clearSpy = spyOn(Tools, 'clearGridContext').and.stub();
        const isInBoundsSpy = spyOn(Tools, 'isInBounds').and.returnValue(false);
        const drawSelectionTileSpy = spyOn(service, 'drawSelectionTile').and.stub();
        service.drawBoardSelection(NO_SELECTION, Orientation.Horizontal);
        expect(clearSpy).toHaveBeenCalled();
        expect(isInBoundsSpy).toHaveBeenCalled();
        expect(drawSelectionTileSpy).not.toHaveBeenCalled();
    });

    it('drawSelectionTile should call drawTileBorders and drawOrientation', () => {
        const drawOrientationSpy = spyOn(service, 'drawOrientation').and.stub();
        const drawSelectionTileSpy = spyOn(service, 'drawTileBorders').and.stub();
        service.drawSelectionTile(tilePosition, Orientation.Horizontal);
        expect(drawOrientationSpy).toHaveBeenCalled();
        expect(drawSelectionTileSpy).toHaveBeenCalled();
    });

    it('drawTileBorders should call strokeRect with the correct parameters', () => {
        const strokeRectSpy = spyOn(service.gridContext, 'strokeRect').and.stub();
        const start = { x: BORDERS_WIDTH + TILES_WIDTH * tilePosition.x, y: BORDERS_WIDTH + TILES_HEIGHT * tilePosition.y };
        const dimensions = { x: TILES_WIDTH, y: TILES_HEIGHT };
        service.drawTileBorders(tilePosition);
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

    it('drawOrientation should call fillText with right arrow if orientation is horizontal', () => {
        const spy = spyOn(service.gridContext, 'fillText').and.stub();
        const drawPosition: Vec2 = {
            x: BORDERS_WIDTH + TILES_WIDTH * tilePosition.x + TILES_WIDTH / 2,
            y: BORDERS_WIDTH + TILES_HEIGHT * tilePosition.y + TILES_HEIGHT / 2,
        };
        service.drawOrientation(tilePosition, Orientation.Horizontal);
        expect(spy).toHaveBeenCalledWith(CHAR_RIGHT_ARROW, drawPosition.x, drawPosition.y, TILES_WIDTH);
    });

    it('drawOrientation should call fillText with down arrow if orientation is not horizontal', () => {
        const spy = spyOn(service.gridContext, 'fillText').and.stub();
        const drawPosition: Vec2 = {
            x: BORDERS_WIDTH + TILES_WIDTH * tilePosition.x + TILES_WIDTH / 2,
            y: BORDERS_WIDTH + TILES_HEIGHT * tilePosition.y + TILES_HEIGHT / 2,
        };
        service.drawOrientation(tilePosition, Orientation.Vertical);
        expect(spy).toHaveBeenCalledWith(CHAR_DOWN_ARROW, drawPosition.x, drawPosition.y, TILES_WIDTH);
    });
});
