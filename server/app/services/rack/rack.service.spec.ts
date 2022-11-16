/* eslint-disable dot-notation */
import { RACK_MAX_CAPACITY } from '@app/classes/constants/rack-constant';
import { BONUS_LETTER, NO_LETTER_LEFT } from '@common/constants/reserve-constant';
import { Rack } from '@common/interfaces/rack-interface';
import { expect } from 'chai';
import { RackService } from './rack.service';

describe('Rack rackService Tests ', () => {
    const rackService = new RackService();
    let rack: Rack;
    let fullRack: Rack;

    beforeEach(() => {
        rack = { content: [] };
        fullRack = {
            content: [
                { letter: 'A', value: 1 },
                { letter: 'A', value: 1 },
                { letter: 'A', value: 1 },
                { letter: 'A', value: 1 },
                { letter: 'A', value: 1 },
                { letter: 'A', value: 1 },
                { letter: 'A', value: 1 },
            ],
        };
    });

    it('initializeRack should empty the rack by placing empty Letters in it ', () => {
        rackService.initializeRack(fullRack);
        expect(rack.content.length).to.equals(NO_LETTER_LEFT);
    });

    it('size should return the size of the rack', () => {
        const testRack: Rack = {
            content: [
                { letter: 'A', value: 1 },
                { letter: BONUS_LETTER, value: 0 },
            ],
        };
        expect(rackService.size(fullRack)).to.equals(RACK_MAX_CAPACITY);
        expect(rackService.size(rack)).to.equals(NO_LETTER_LEFT);
        expect(rackService.size(testRack)).to.equals(2);
    });

    it('isFull should be true if the rack is full, and false otherwise', () => {
        expect(rackService.isFull(rack)).to.equals(false);
        expect(rackService.isFull(fullRack)).to.equals(true);
    });

    it('isEmpty should be true if the rack is empty, and false otherwise', () => {
        expect(rackService.isEmpty(rack)).to.equals(true);
        expect(rackService.isEmpty(fullRack)).to.equals(false);
    });

    it('adding a letter in a full rack should not add it', () => {
        rack = Object.assign({}, fullRack);
        rackService['addLetter']('B', rack);
        expect(rack.content).to.equals(fullRack.content);
    });

    it('adding letters should add them one by one until the rack is full', () => {
        rackService.addLetters('AAAAAAA', rack);
        for (let i = 0; i < fullRack.content.length; i++) {
            expect(rack.content[i].value).to.equals(fullRack.content[i].value);
            expect(rack.content[i].letter).to.equals(fullRack.content[i].letter);
        }
    });

    it('removing a letter not present should do nothing', () => {
        rack = Object.assign({}, fullRack);
        rackService['removeLetter']('b', rack);
        for (let i = 0; i < fullRack.content.length; i++) {
            expect(rack.content[i].value).to.equals(fullRack.content[i].value);
            expect(rack.content[i].letter).to.equals(fullRack.content[i].letter);
        }
    });
    it('removing a letter present should remove it of the rack', () => {
        rack = Object.assign({}, fullRack);
        rackService['removeLetter']('A', rack);
        const expectedRack: Rack = {
            content: [
                { letter: 'A', value: 1 },
                { letter: 'A', value: 1 },
                { letter: 'A', value: 1 },
                { letter: 'A', value: 1 },
                { letter: 'A', value: 1 },
                { letter: 'A', value: 1 },
            ],
        };
        for (let i = 0; i < expectedRack.content.length; i++) {
            expect(rack.content[i].value).to.equals(expectedRack.content[i].value);
            expect(rack.content[i].letter).to.equals(expectedRack.content[i].letter);
        }
    });

    it('removing multiple letters  present should remove all of them', () => {
        rack = Object.assign({}, fullRack);
        rackService.removeLetters('aaa', rack);
        const expectedRack: Rack = {
            content: [
                { letter: 'A', value: 1 },
                { letter: 'A', value: 1 },
                { letter: 'A', value: 1 },
                { letter: 'A', value: 1 },
            ],
        };
        for (let i = 0; i < expectedRack.content.length; i++) {
            expect(rack.content[i].value).to.equals(expectedRack.content[i].value);
            expect(rack.content[i].letter).to.equals(expectedRack.content[i].letter);
        }
    });

    it('toString must return the character string that corresponds to the letters present in the rack', () => {
        expect(rackService.toString(fullRack)).to.equals('AAAAAAA');
    });
});
