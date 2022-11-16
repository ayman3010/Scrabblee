/* tslint:disable:no-unused-variable */

import { TestBed } from '@angular/core/testing';
import { Tools } from '@app/classes/tools/tools';
import { BoardSelectionService } from '@app/services/board-selection/board-selection.service';
import { Orientation } from '@common/enums/enums';
import { Vec2 } from '@common/interfaces/vec2';
import { BoardSelectionIteratorService } from './board-selection-iterator.service';

describe('Service: BoardSelectionIterator', () => {
    let service: BoardSelectionIteratorService;
    let boardSelectionSpy: jasmine.SpyObj<BoardSelectionService>;

    const tilePosition: Vec2 = { x: 0, y: 0 };

    beforeEach(() => {
        boardSelectionSpy = jasmine.createSpyObj('BoardSelectionService', ['drawBoardSelection']);
        TestBed.configureTestingModule({ providers: [{ provide: BoardSelectionService, useValue: boardSelectionSpy }] });
        service = TestBed.inject(BoardSelectionIteratorService);
        service.selectionPosition = { ...tilePosition };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('changeOrientation should change horizontal to vertical', () => {
        service.orientation = Orientation.Horizontal;
        service.changeOrientation();
        expect(service.orientation).toEqual(Orientation.Vertical.valueOf());
    });

    it('changeOrientation should change vertical to horizontal', () => {
        service.orientation = Orientation.Vertical;
        service.changeOrientation();
        expect(service.orientation).toEqual(Orientation.Horizontal.valueOf());
    });

    it('hasNext should return false if next is out of bounds', () => {
        spyOn(Tools, 'isInBounds').and.returnValue(false);
        const returnValue = service.hasNext();
        expect(returnValue).toBeFalsy();
    });

    it('hasNext should return true if next is out of bounds', () => {
        spyOn(Tools, 'isInBounds').and.returnValue(true);
        const returnValue = service.hasNext();
        expect(returnValue).toBeTruthy();
    });

    it('hasNext should call isInBounds with x + 1 if orientation is horizontal', () => {
        const spy = spyOn(Tools, 'isInBounds').and.returnValue(false);
        service.orientation = Orientation.Horizontal;
        service.hasNext();
        expect(spy).toHaveBeenCalledWith({ x: tilePosition.x + 1, y: tilePosition.y });
    });

    it('hasNext should call isInBounds with y + 1 if orientation is vertical', () => {
        const spy = spyOn(Tools, 'isInBounds').and.returnValue(true);
        service.orientation = Orientation.Vertical;
        service.hasNext();
        expect(spy).toHaveBeenCalledWith({ x: tilePosition.x, y: tilePosition.y + 1 });
    });

    it('hasPrevious should return true if currentSelectionPosition is greater than the starting one', () => {
        service.startSelectionPosition = { x: 0, y: 0 };
        service.selectionPosition = { x: 1, y: 1 };
        service.orientation = Orientation.Horizontal;
        let returnValue = service.hasPrevious();
        expect(returnValue).toBeTruthy();

        service.orientation = Orientation.Vertical;
        returnValue = service.hasPrevious();
        expect(returnValue).toBeTruthy();
    });

    it('hasPrevious should return false if currentSelectionPosition is not greater than the starting one', () => {
        service.startSelectionPosition = { x: 0, y: 0 };
        service.selectionPosition = { x: 0, y: 0 };
        service.orientation = Orientation.Horizontal;
        let returnValue = service.hasPrevious();
        expect(returnValue).toBeFalsy();

        service.orientation = Orientation.Vertical;
        returnValue = service.hasPrevious();
        expect(returnValue).toBeFalsy();
    });

    it('next should increment horizontal position if orientation is horizontal', () => {
        const expectedSelectionPosition = { x: 1, y: 0 };
        service.selectionPosition = { x: 0, y: 0 };
        service.orientation = Orientation.Horizontal;
        service.next();
        expect(service.selectionPosition).toEqual(expectedSelectionPosition);
    });

    it('next should increment vertical position if orientation is vertical', () => {
        const expectedSelectionPosition = { x: 0, y: 1 };
        service.selectionPosition = { x: 0, y: 0 };
        service.orientation = Orientation.Vertical;
        service.next();
        expect(service.selectionPosition).toEqual(expectedSelectionPosition);
    });

    it('previous should decrement horizontal position if orientation is horizontal', () => {
        const expectedSelectionPosition = { x: 0, y: 1 };
        service.selectionPosition = { x: 1, y: 1 };
        service.orientation = Orientation.Horizontal;
        service.previous();
        expect(service.selectionPosition).toEqual(expectedSelectionPosition);
    });

    it('next should increment vertical position if orientation is vertical', () => {
        const expectedSelectionPosition = { x: 1, y: 0 };
        service.selectionPosition = { x: 1, y: 1 };
        service.orientation = Orientation.Vertical;
        service.previous();
        expect(service.selectionPosition).toEqual(expectedSelectionPosition);
    });

    it('newTilePosition setter should change orientation if position is same', () => {
        const changeOrientationSpy = spyOn(service, 'changeOrientation').and.stub();
        const drawSpy = spyOn(service, 'draw').and.stub();
        service.selectionPosition = tilePosition;
        service.newSelectionPosition = { ...tilePosition };
        expect(changeOrientationSpy).toHaveBeenCalled();
        expect(drawSpy).toHaveBeenCalled();
    });

    it('newTilePosition setter should not change orientation if position is same', () => {
        const changeOrientationSpy = spyOn(service, 'changeOrientation').and.stub();
        const drawSpy = spyOn(service, 'draw').and.stub();
        service.selectionPosition = tilePosition;
        const newTilePosition = { x: tilePosition.x + 1, y: tilePosition.y };
        service.newSelectionPosition = newTilePosition;
        expect(changeOrientationSpy).not.toHaveBeenCalled();
        expect(drawSpy).toHaveBeenCalled();
        expect(service.selectionPosition).toEqual(newTilePosition);
    });

    it('draw should call drawBoardSelection', () => {
        service.selectionPosition = tilePosition;
        service.orientation = Orientation.Horizontal;
        service.draw();
        expect(boardSelectionSpy.drawBoardSelection).toHaveBeenCalledWith(service.selectionPosition, service.orientation);
    });
});
