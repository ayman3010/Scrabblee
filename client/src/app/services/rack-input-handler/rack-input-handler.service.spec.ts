/* tslint:disable:no-unused-variable */

import { TestBed } from '@angular/core/testing';
import { NOTHING_SELECTED } from '@app/classes/constants/constants';
import { RackService } from '@app/services/rack/rack.service';
import { Subject } from 'rxjs';
import { RackInputHandlerService } from './rack-input-handler.service';

describe('Service: RackInputHandler', () => {
    let service: RackInputHandlerService;
    let rackServiceSpy: jasmine.SpyObj<RackService>;

    beforeEach(() => {
        rackServiceSpy = jasmine.createSpyObj('RackService', [
            'swap',
            'moveLeft',
            'moveRight',
            'select',
            'selectedIndex',
            'selectExchange',
            'sendCommand',
        ]);
        rackServiceSpy.updateEvent = new Subject<void>();
        TestBed.configureTestingModule({
            providers: [{ provide: RackService, useValue: rackServiceSpy }],
        });
        service = TestBed.inject(RackInputHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('handleLetterLeftClick should change selected', () => {
        const index = 0;
        service.handleLetterLeftClick(index);
        expect(rackServiceSpy.selectedIndex).toEqual(index);
    });

    it('handleWheel should call moveLeft on scrollUp', () => {
        const deltaY = -1;
        service.handleWheel(deltaY);
        expect(rackServiceSpy.moveLeft).toHaveBeenCalled();
    });

    it('handleWheel should call moveRight on scrollDown', () => {
        const deltaY = 1;
        service.handleWheel(deltaY);
        expect(rackServiceSpy.moveRight).toHaveBeenCalled();
    });

    it('handleWheel should not call anything otherwise', () => {
        const deltaY = 0;
        service.handleWheel(deltaY);
        expect(rackServiceSpy.moveRight).not.toHaveBeenCalled();
        expect(rackServiceSpy.moveLeft).not.toHaveBeenCalled();
    });

    it('handleKeyboard should call moveLeft on ArrowLeft', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
        service.handleKeyboard(keyboardEvent);
        expect(rackServiceSpy.moveLeft).toHaveBeenCalled();
    });

    it('handleKeyboard should call moveLeft on ArrowRight', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
        service.handleKeyboard(keyboardEvent);
        expect(rackServiceSpy.moveRight).toHaveBeenCalled();
    });

    it('handleKeyboard should call select with the key by default if it is a letter', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'a' });
        service.handleKeyboard(keyboardEvent);
        expect(rackServiceSpy.select).toHaveBeenCalledWith(keyboardEvent.key.toUpperCase());
    });

    it('handleKeyboard should not call select with the key by default if it is not a letter', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: '@' });
        service.handleKeyboard(keyboardEvent);
        expect(rackServiceSpy.select).not.toHaveBeenCalled();
    });

    it('handleLetterRightClick should call selectExchange with the index', () => {
        const index = 1;
        service.handleLetterRightClick(index);
        expect(rackServiceSpy.selectExchange).toHaveBeenCalledWith(index);
    });

    it('handleClickOut should call cancelExchange and selected and call update', () => {
        rackServiceSpy.selected = 0;
        const spy = spyOn(service, 'cancelExchange').and.stub();
        service.handleClickOut();
        expect(spy).toHaveBeenCalled();
        expect(rackServiceSpy.selectedIndex).toEqual(NOTHING_SELECTED);
    });

    it('cancelExchange should clear exchangeSelection', () => {
        rackServiceSpy.exchangeSelection = new Set([1, 2]);
        service.handleClickOut();
        expect(rackServiceSpy.exchangeSelection.size).toEqual(0);
    });

    it('confirmExchange should call sendCommand of rackService', () => {
        service.confirmExchange();
        expect(rackServiceSpy.sendCommand).toHaveBeenCalled();
    });

    it('should call update on signal', () => {
        const spy = spyOn(service, 'update');
        rackServiceSpy.updateEvent?.next();
        expect(spy).toHaveBeenCalled();
    });
});
