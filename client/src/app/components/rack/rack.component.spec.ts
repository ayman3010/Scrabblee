/* tslint:disable:no-unused-variable */
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ClearBoardSelectionService } from '@app/services/clear-board-selection/clear-board-selection.service';
import { RackInputHandlerService } from '@app/services/rack-input-handler/rack-input-handler.service';
import { Letter } from '@common/interfaces/board-interface';
import { Subject } from 'rxjs';
import { RackComponent } from './rack.component';

describe('RackComponent', () => {
    let component: RackComponent;
    let fixture: ComponentFixture<RackComponent>;
    let debugElement: DebugElement;
    let inputHandlerSpy: jasmine.SpyObj<RackInputHandlerService>;
    let clearBoardSelectionDetectorSpy: jasmine.SpyObj<ClearBoardSelectionService>;

    beforeEach(async () => {
        inputHandlerSpy = jasmine.createSpyObj('RackInputHandlerService', [
            'handleLetterLeftClick',
            'handleLetterRightClick',
            'handleWheel',
            'handleKeyboard',
            'handleClickOut',
            'confirmExchange',
            'cancelExchange',
        ]);
        clearBoardSelectionDetectorSpy = jasmine.createSpyObj('ClearBoardSelection', ['notify']);
        inputHandlerSpy.rackClientEvent = new Subject<Letter[]>();
        inputHandlerSpy.selectionEvent = new Subject<number>();
        inputHandlerSpy.isTurnEvent = new Subject<boolean>();
        TestBed.configureTestingModule({
            declarations: [RackComponent],
            providers: [
                { provide: RackInputHandlerService, useValue: inputHandlerSpy },
                { provide: ClearBoardSelectionService, useValue: clearBoardSelectionDetectorSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RackComponent);
        component = fixture.componentInstance;
        component.exchangeSelection = new Set();
        debugElement = fixture.debugElement;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('handleLetterLeftClick should call handleLetterLeftClick from RackInputHandlerService', () => {
        component.handleLetterLeftClick(0);
        expect(inputHandlerSpy.handleLetterLeftClick).toHaveBeenCalledWith(0);
    });

    it('handleLetterLeftClick should not call handleLetterLeftClick from RackInputHandlerService if gameOver is true', () => {
        component.gameOver = true;
        component.handleLetterLeftClick(0);
        expect(inputHandlerSpy.handleLetterLeftClick).not.toHaveBeenCalled();
    });

    it('should call handleWheel on WheelEvent', () => {
        const wheelEvent = new WheelEvent('wheel', { view: window, bubbles: true, cancelable: true, relatedTarget: window });
        debugElement.nativeElement.dispatchEvent(wheelEvent);
        expect(inputHandlerSpy.handleWheel).toHaveBeenCalled();
    });

    it('should not call handleWheel on WheelEvent if gameOver is true', () => {
        const wheelEvent = new WheelEvent('wheel', { view: window, bubbles: true, cancelable: true, relatedTarget: window });
        component.gameOver = true;
        debugElement.nativeElement.dispatchEvent(wheelEvent);
        expect(inputHandlerSpy.handleWheel).not.toHaveBeenCalled();
    });

    it('should not call handleKeyBoard on KeyboardEvent outside the rack', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { view: window, bubbles: true, cancelable: true });
        debugElement.nativeElement.dispatchEvent(keyboardEvent);
        expect(inputHandlerSpy.handleKeyboard).not.toHaveBeenCalled();
    });

    it('should not call handleKeyBoard on KeyboardEvent outside the rack when gameOver is true', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { view: window, bubbles: true, cancelable: true });
        component.gameOver = true;
        debugElement.nativeElement.dispatchEvent(keyboardEvent);
        expect(inputHandlerSpy.handleKeyboard).not.toHaveBeenCalled();
    });

    it('should call handleKeyBoard on KeyboardEvent inside the rack', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { view: window, bubbles: true, cancelable: true });
        debugElement.query(By.css('.rack')).nativeElement.dispatchEvent(keyboardEvent);
        expect(inputHandlerSpy.handleKeyboard).toHaveBeenCalled();
    });

    it('should not call handleKeyBoard on KeyboardEvent inside the rack if gameOver is true', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { view: window, bubbles: true, cancelable: true });
        component.gameOver = true;
        debugElement.query(By.css('.rack')).nativeElement.dispatchEvent(keyboardEvent);
        expect(inputHandlerSpy.handleKeyboard).not.toHaveBeenCalled();
    });

    it('should call handleClickOut on ClickEvent outside of rack component', () => {
        const clickEvent = new Event('click', { bubbles: true, cancelable: true });
        debugElement.nativeElement.dispatchEvent(clickEvent);
        expect(inputHandlerSpy.handleClickOut).toHaveBeenCalled();
    });

    it('should not call handleClickOut on ClickEvent outside of rack component if gameOver is true', () => {
        const clickEvent = new Event('click', { bubbles: true, cancelable: true });
        component.gameOver = true;
        debugElement.nativeElement.dispatchEvent(clickEvent);
        expect(inputHandlerSpy.handleClickOut).not.toHaveBeenCalled();
    });

    it('should not call handleLetterLeftClick if ClickEvent is inside of rack component and call notify of ClearBoardSelectionService', () => {
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        debugElement.query(By.css('.rack')).nativeElement.dispatchEvent(clickEvent);
        expect(inputHandlerSpy.handleLetterLeftClick).not.toHaveBeenCalled();
        expect(clearBoardSelectionDetectorSpy.notify).toHaveBeenCalled();
    });

    it('should not call handleLetterLeftClick if ClickEvent is inside of rack component and not call notify \
of ClearBoardSelectionService if gameOver is true', () => {
        const clickEvent = new MouseEvent('click', { bubbles: true, cancelable: true });
        component.gameOver = true;
        debugElement.query(By.css('.rack')).nativeElement.dispatchEvent(clickEvent);
        expect(inputHandlerSpy.handleLetterLeftClick).not.toHaveBeenCalled();
        expect(clearBoardSelectionDetectorSpy.notify).not.toHaveBeenCalled();
    });

    it('should change letters on signal', () => {
        const letters: Letter[] = [{ letter: 'A', value: 1 }];
        inputHandlerSpy.rackClientEvent.next(letters);
        expect(component.letters).toEqual(letters);
    });

    it('should change selected on signal', () => {
        const selected = 1;
        inputHandlerSpy.selectionEvent.next(selected);
        expect(component.selected).toEqual(selected);
    });

    it('handleLetterRightClick should call notify and handleLetterRightClick', () => {
        const clickEvent = new Event('click', { bubbles: true, cancelable: true });
        component.handleLetterRightClick(0, clickEvent);
        expect(inputHandlerSpy.handleLetterRightClick).toHaveBeenCalledWith(0);
        expect(clearBoardSelectionDetectorSpy.notify).toHaveBeenCalled();
    });

    it('handleLetterRightClick should not call notify nor handleLetterRightClick if gameOver is true', () => {
        const clickEvent = new Event('click', { bubbles: true, cancelable: true });
        component.gameOver = true;
        component.handleLetterRightClick(0, clickEvent);
        expect(inputHandlerSpy.handleLetterRightClick).not.toHaveBeenCalled();
        expect(clearBoardSelectionDetectorSpy.notify).not.toHaveBeenCalled();
    });

    it('should change isTurn on signal', () => {
        inputHandlerSpy.isTurnEvent.next(false);
        expect(component.isTurn).toEqual(false);
    });

    it('isExchanged getter should return false if exchangeSelection is undefined', () => {
        component.exchangeSelection = undefined as unknown as Set<number>;
        expect(component.isExchanged).toBeFalsy();
    });

    it('isExchanged getter should return false if exchangeSelection is empty', () => {
        component.exchangeSelection.clear();
        expect(component.isExchanged).toBeFalsy();
    });

    it('isExchanged getter should return true if exchangeSelection is not empty', () => {
        component.exchangeSelection.add(2);
        expect(component.isExchanged).toBeTruthy();
    });

    it('confirmExchange should call confirmExchange of inputHandler', () => {
        component.confirmExchange();
        expect(inputHandlerSpy.confirmExchange).toHaveBeenCalled();
    });

    it('cancelExchange should call cancelExchange of inputHandler', () => {
        component.cancelExchange();
        expect(inputHandlerSpy.cancelExchange).toHaveBeenCalled();
    });
});
