/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable max-lines */

import { TestBed } from '@angular/core/testing';
import { NOTHING_SELECTED } from '@app/classes/constants/constants';
import { ChatboxManagerService } from '@app/services/chatbox-manager/chatbox-manager.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { BONUS_LETTER } from '@common/constants/reserve-constant';
import { Letter } from '@common/interfaces/board-interface';
import { Subject } from 'rxjs';
import { RackService } from './rack.service';

describe('Service: Rack', () => {
    let service: RackService;
    let gameManagerServiceStub: Partial<GameManagerService>;
    let rackEvent: Subject<Letter[]>;
    let chatboxServiceSpy: jasmine.SpyObj<ChatboxManagerService>;

    const letters: Letter[] = [
        { letter: 'A', value: 0 },
        { letter: 'B', value: 1 },
        { letter: 'C', value: 2 },
        { letter: 'D', value: 3 },
        { letter: 'E', value: 4 },
        { letter: 'F', value: 5 },
        { letter: 'G', value: 6 },
    ];
    const targetIndex = 1;

    const exchangeSelection: Set<number> = new Set([1, 2]);

    beforeEach(() => {
        rackEvent = new Subject<Letter[]>();

        gameManagerServiceStub = {
            rackEvent,
        };

        chatboxServiceSpy = jasmine.createSpyObj('ChatboxManagerService', ['sendCommand']);
        chatboxServiceSpy.synchronizeRackEvent = new Subject();

        TestBed.configureTestingModule({
            providers: [
                { provide: GameManagerService, useValue: gameManagerServiceStub },
                { provide: ChatboxManagerService, useValue: chatboxServiceSpy },
            ],
        });
        service = TestBed.inject(RackService);

        service.letters = [...letters];
        service.selected = NOTHING_SELECTED;
        service.exchangeSelection = new Set([...exchangeSelection]);
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('sendCommand should not call sendCommand if there is no exchangeSelection', () => {
        service.exchangeSelection.clear();
        service.sendCommand();
        expect(chatboxServiceSpy.sendCommand).not.toHaveBeenCalled();
    });

    it('sendCommand should call sendCommand with exchangeCommand', () => {
        const spy = spyOn(service, 'removeExchange').and.stub();
        const expectedCommand = service.exchangeCommand;
        service.sendCommand();
        expect(chatboxServiceSpy.sendCommand).toHaveBeenCalledWith(expectedCommand);
        expect(spy).toHaveBeenCalled();
    });

    it('swap should not swap index if selectedIndex is out of bounds', () => {
        const expectedLetters: Letter[] = [...letters];
        const lowerOutOfBounds = NOTHING_SELECTED;
        const upperOutOfBounds = service.letters.length;
        let returnValue;

        returnValue = service.swap(targetIndex, lowerOutOfBounds);
        expect(service.letters).toEqual(expectedLetters);
        expect(returnValue).toBeFalsy();

        returnValue = service.swap(targetIndex, upperOutOfBounds);
        expect(service.letters).toEqual(expectedLetters);
        expect(returnValue).toBeFalsy();
    });

    it('swap should not swap index if targetIndex is out of bounds', () => {
        const expectedLetters: Letter[] = [...letters];
        const lowerOutOfBounds = NOTHING_SELECTED;
        const upperOutOfBounds = service.letters.length;
        service.selected = 0;
        let returnValue;

        returnValue = service.swap(lowerOutOfBounds);
        expect(service.letters).toEqual(expectedLetters);
        expect(returnValue).toBeFalsy();

        returnValue = service.swap(upperOutOfBounds);
        expect(service.letters).toEqual(expectedLetters);
        expect(returnValue).toBeFalsy();
    });

    it('swap should not swap index if selectedIndex and targetIndex is equal', () => {
        const expectedLetters: Letter[] = [...letters];

        const returnValue = service.swap(targetIndex, targetIndex);
        expect(service.letters).toEqual(expectedLetters);
        expect(returnValue).toBeFalsy();
    });

    it('swap should swap index only between selectedIndex and targetIndex', () => {
        const spy = spyOn(service, 'swapExchange');
        const expectedLetters: Letter[] = [
            { letter: 'B', value: 1 },
            { letter: 'A', value: 0 },
            { letter: 'C', value: 2 },
            { letter: 'D', value: 3 },
            { letter: 'E', value: 4 },
            { letter: 'F', value: 5 },
            { letter: 'G', value: 6 },
        ];
        const returnValue = service.swap(targetIndex, 0);
        expect(service.letters).toEqual(expectedLetters);
        expect(returnValue).toBeTruthy();
        expect(spy).toHaveBeenCalledWith(targetIndex, 0);
    });

    it('swapExchange should not swap index if selectedIndex is out of bounds', () => {
        const expectedExchangeSelection: Set<number> = new Set([...exchangeSelection]);
        const lowerOutOfBounds = NOTHING_SELECTED;
        const upperOutOfBounds = service.letters.length;

        service.swapExchange(targetIndex, lowerOutOfBounds);
        expect(service.exchangeSelection).toEqual(expectedExchangeSelection);

        service.swapExchange(targetIndex, upperOutOfBounds);
        expect(service.exchangeSelection).toEqual(expectedExchangeSelection);
    });

    it('swapExchange should not swap index if targetIndex is out of bounds', () => {
        const expectedExchangeSelection: Set<number> = new Set([...exchangeSelection]);
        const lowerOutOfBounds = NOTHING_SELECTED;
        const upperOutOfBounds = service.letters.length;

        service.swapExchange(lowerOutOfBounds, targetIndex);
        expect(service.exchangeSelection).toEqual(expectedExchangeSelection);

        service.swapExchange(upperOutOfBounds, targetIndex);
        expect(service.exchangeSelection).toEqual(expectedExchangeSelection);
    });

    it('swapExchange should not swap index if selectedIndex and targetIndex is equal', () => {
        const expectedExchangeSelection: Set<number> = new Set([...exchangeSelection]);

        service.swap(targetIndex, targetIndex);
        expect(service.exchangeSelection).toEqual(expectedExchangeSelection);
    });

    it('swapExchange should swap index only between selectedIndex and targetIndex', () => {
        const expectedExchangeSelection: Set<number> = new Set([0, 2]);
        service.swapExchange(targetIndex, 0);
        expect(service.exchangeSelection).toEqual(expectedExchangeSelection);

        service.swapExchange(targetIndex, 0);
        expect(service.exchangeSelection).toEqual(exchangeSelection);
    });

    it('swapExchange should swap index even if both are selected for exchange', () => {
        const expectedExchangeSelection: Set<number> = new Set([...exchangeSelection]);
        service.swapExchange(1, 2);
        expect(service.exchangeSelection).toEqual(expectedExchangeSelection);
    });

    it('selectExchange should unselect for manipulation and set for exchange if the index is already selected for manipulation', () => {
        const expectedExchangeSelection: Set<number> = new Set([...exchangeSelection, 0]);
        service.selected = 0;
        service.selectExchange(service.selected);
        expect(service.exchangeSelection).toEqual(expectedExchangeSelection);
        expect(service.selected).toEqual(NOTHING_SELECTED);
    });

    it('selectExchange should remove the index if it is already selected for exchange', () => {
        const expectedExchangeSelection: Set<number> = new Set([2]);
        service.selectExchange(targetIndex);
        expect(service.exchangeSelection).toEqual(expectedExchangeSelection);
    });

    it('selectExchange should add the index if it is not already selected for exchange', () => {
        const expectedExchangeSelection: Set<number> = new Set([1, 2, 3]);
        service.selectExchange(3);
        expect(service.exchangeSelection).toEqual(expectedExchangeSelection);
    });

    it('isInBounds should return true if index is in bounds', () => {
        expect(service.isInBounds(0)).toBeTruthy();
    });

    it('isInBounds should return false if index is out of bounds', () => {
        expect(service.isInBounds(NOTHING_SELECTED)).toBeFalsy();
        expect(service.isInBounds(service.letters.length)).toBeFalsy();
    });

    it('moveLeft should change selected to targetIndex if swap is successful', () => {
        service.selected = 1;
        const expectedSelected = 0;
        spyOn(service, 'swap').and.returnValue(true);
        service.moveLeft();
        expect(service.selected).toEqual(expectedSelected);
    });

    it('moveLeft should not change selected to targetIndex if swap is not successful', () => {
        service.selected = 1;
        const expectedSelected = 1;
        spyOn(service, 'swap').and.returnValue(false);
        service.moveLeft();
        expect(service.selected).toEqual(expectedSelected);
    });

    it('moveLeft should call swap with the correct targetIndex', () => {
        const expectedSelected = 0;
        service.selected = expectedSelected;
        const expectedTargetIndex = 6;
        const spy = spyOn(service, 'swap').and.stub();
        service.moveLeft();
        expect(spy).toHaveBeenCalledWith(expectedTargetIndex, expectedSelected);
    });

    it('moveRight should change selected to targetIndex if swap is successful', () => {
        service.selected = 0;
        const expectedSelected = 1;
        spyOn(service, 'swap').and.returnValue(true);
        service.moveRight();
        expect(service.selected).toEqual(expectedSelected);
    });

    it('moveRight should not change selected to targetIndex if swap is not successful', () => {
        service.selected = 1;
        const expectedSelected = 1;
        spyOn(service, 'swap').and.returnValue(false);
        service.moveRight();
        expect(service.selected).toEqual(expectedSelected);
    });

    it('moveRight should call swap with the correct targetIndex', () => {
        const expectedSelected = 6;
        service.selected = expectedSelected;
        const expectedTargetIndex = 0;
        const spy = spyOn(service, 'swap').and.stub();
        service.moveRight();
        expect(spy).toHaveBeenCalledWith(expectedTargetIndex, expectedSelected);
    });

    it('select should change selected to NOTHING_SELECTED if the letter is not in the rack', () => {
        service.selected = 0;
        const expectedSelected = NOTHING_SELECTED;
        service.select('z');
        expect(service.selected).toEqual(expectedSelected);
    });

    it('select should change selected for the index of the first occurrence of letter in the rack', () => {
        const expectedSelected = 0;
        service.select('A');
        expect(service.selected).toEqual(expectedSelected);
    });

    it('select should change selected for the index of the next occurrence of letter in the rack', () => {
        const expectedFirstSelected = 6;
        const expectedSecondSelected = 0;
        service.letters[6] = { letter: 'A', value: 1 };
        service.selected = 0;
        service.select('A');
        expect(service.selected).toEqual(expectedFirstSelected);
        service.select('A');
        expect(service.selected).toEqual(expectedSecondSelected);
    });

    it('indexOf should return NOTHING_SELECTED if the letter is not in the rack', () => {
        service.selected = 0;
        const expectedValue = NOTHING_SELECTED;
        const returnValue = service['indexOf']('z');
        expect(returnValue).toEqual(expectedValue);
    });

    it('indexOf should return the index of the first occurrence of letter in the rack', () => {
        const expectedValue = 0;
        const returnValue = service['indexOf']('A');
        expect(returnValue).toEqual(expectedValue);
    });

    it('indexOf should return the index of the next occurrence of letter in the rack', () => {
        const expectedFirstSelected = 5;
        const expectedSecondSelected = 0;
        service.letters[5] = { letter: 'A', value: 1 };
        service.selected = 0;
        let returnValue = service['indexOf']('A', 1);
        expect(returnValue).toEqual(expectedFirstSelected);
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        returnValue = service['indexOf']('A', 6);
        expect(returnValue).toEqual(expectedSecondSelected);
    });

    it('indexOf should return the index of the first available occurrence of letter in the rack if we skip over letter selected for exchange', () => {
        const expectedSelected = 5;
        service.letters[5] = { letter: 'A', value: 1 };
        service.exchangeSelection = new Set([0]);
        const returnValue = service['indexOf']('A', 0, true);
        expect(returnValue).toEqual(expectedSelected);
    });

    it('removeLetter should remove the letter in the rack and return it', () => {
        const expectedLength = service.letters.length - 1;
        const expectedLetter = { letter: 'A', value: 0 };
        const spy = spyOn(service as any, 'indexOf').and.returnValue(0);
        const returnValue = service.removeLetter('A');
        expect(service.letters.length).toEqual(expectedLength);
        expect(returnValue).toEqual(expectedLetter);
        expect(spy).toHaveBeenCalledWith('A');
    });

    it('removeLetter should not remove any letters in the rack and return undefined if none was found', () => {
        const expectedLength = service.letters.length;
        const spy = spyOn(service as any, 'indexOf').and.returnValue(NOTHING_SELECTED);
        const returnValue = service.removeLetter('A');
        expect(service.letters.length).toEqual(expectedLength);
        expect(returnValue).toBeUndefined();
        expect(spy).toHaveBeenCalledWith('A');
    });

    it('removeLetter should remove the letter in the rack and return it', () => {
        const expectedLength = service.letters.length - 1;
        const expectedLetter = { letter: 'A', value: 0 };
        spyOn(service as any, 'indexOf').and.returnValue(0);
        const returnValue = service.removeLetter('A');
        expect(service.letters.length).toEqual(expectedLength);
        expect(returnValue).toEqual(expectedLetter);
    });

    it('removeLetter should set selected to NOTHING_SELECTED if the removed letter was selected', () => {
        service.selected = 0;
        spyOn(service as any, 'indexOf').and.returnValue(0);
        service.removeLetter('A');
        expect(service.selected).toEqual(NOTHING_SELECTED);
    });

    it('removeLetter should not change selected if the removed letter was not selected', () => {
        const expectedSelected = 1;
        service.selected = expectedSelected;
        spyOn(service as any, 'indexOf').and.returnValue(0);
        service.removeLetter('A');
        expect(service.selected).toEqual(expectedSelected);
    });

    it('removeLetter should delete the index from exchangeSelection', () => {
        const expectedExchangeSelection = new Set([2]);
        spyOn(service as any, 'indexOf').and.returnValue(1);
        service.removeLetter('B');
        expect(service.exchangeSelection).toEqual(expectedExchangeSelection);
    });

    it('addLetter should add a letter to the rack when given a new letter', () => {
        const additionalLetter: Letter = { letter: 'G', value: 6 };
        const expectedLength = 7;
        service.letters = [
            { letter: 'A', value: 0 },
            { letter: 'B', value: 1 },
            { letter: 'C', value: 2 },
            { letter: 'D', value: 3 },
            { letter: 'E', value: 4 },
            { letter: 'F', value: 5 },
        ];
        service.addLetter(additionalLetter);
        expect(service.letters.length).toEqual(expectedLength);
    });

    it('addLetter should add a blank letter if the value of the letter to add is 0', () => {
        const additionalLetter: Letter = { letter: 'Z', value: 0 };
        const expectedLength = 7;
        service.letters = [
            { letter: 'A', value: 0 },
            { letter: 'B', value: 1 },
            { letter: 'C', value: 2 },
            { letter: 'D', value: 3 },
            { letter: 'E', value: 4 },
            { letter: 'F', value: 5 },
        ];
        service.addLetter(additionalLetter);
        expect(service.letters.length).toEqual(expectedLength);
        expect(service.letters[6]).toEqual({ letter: BONUS_LETTER, value: 0 });
    });

    it('selectedIndex setter should change selected to new index if selected is NOTHING_SELECTED', () => {
        const newIndex = 0;
        service.selectedIndex = newIndex;
        const spy = spyOn(service, 'swap').and.stub();
        expect(service.selected).toEqual(newIndex);
        expect(spy).not.toHaveBeenCalled();
    });

    it('selectedIndex setter should change selected to NOTHING_SELECTED if new index is NOTHING_SELECTED', () => {
        service.selected = 0;
        const newIndex = NOTHING_SELECTED;
        service.selectedIndex = newIndex;
        const spy = spyOn(service, 'swap').and.stub();
        expect(service.selected).toEqual(newIndex);
        expect(spy).not.toHaveBeenCalled();
    });

    it('selectedIndex setter should set selected to NOTHING_SELECTED if index is selected for exchange', () => {
        service.selected = 0;
        const indexAlreadySelectedForExchange = 1;
        service.selectedIndex = indexAlreadySelectedForExchange;
        expect(service.selected).toEqual(NOTHING_SELECTED);
    });

    it('selectedIndex setter should set selected to index if index is not selected for exchange', () => {
        service.selected = 0;
        const newIndex = 3;
        service.selectedIndex = newIndex;
        expect(service.selected).toEqual(newIndex);
    });

    it('exchangeCommand getter should return the correct command', () => {
        const expected = '!échanger bc';
        const returnValue = service.exchangeCommand;
        expect(returnValue).toEqual(expected);
    });

    it('lettersToExchange getter should return the letters to exchange', () => {
        const expected = 'bc';
        const returnValue = service['lettersToExchange'];
        expect(returnValue).toEqual(expected);
    });

    it('removeExchange should remove index that are selected for exchange and clear exchangeSelection', () => {
        const expected: Letter[] = [
            { letter: 'A', value: 0 },
            { letter: 'D', value: 3 },
            { letter: 'E', value: 4 },
            { letter: 'F', value: 5 },
            { letter: 'G', value: 6 },
        ];
        service.removeExchange();
        expect(service.letters).toEqual(expected);
        expect(service.exchangeSelection.size).toEqual(0);
    });

    it('should change letters on signal if it was your turn', () => {
        const rack: Letter[] = [];
        service.isTurn = true;
        gameManagerServiceStub.rackEvent?.next(rack);
        expect(service.letters).toEqual(rack);
    });

    it('should not change letters on signal if it was not your turn', () => {
        const rack: Letter[] = [];
        service.isTurn = false;
        gameManagerServiceStub.rackEvent?.next(rack);
        expect(service.letters).toEqual(letters);
    });

    it('should change rack of chatBoxManager on signal', () => {
        chatboxServiceSpy.synchronizeRackEvent?.next();
        expect(chatboxServiceSpy.rack).toEqual(letters);
    });
});
