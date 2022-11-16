import { RackService } from '@app/services/rack/rack.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { Rack } from '@common/interfaces/rack-interface';
import { Reserve } from '@common/interfaces/reserve-interface';
import { expect } from 'chai';
import { TurnManagerService } from './turn-manager.service';

describe('TurnManager service tests', () => {
    let reserve: Reserve;
    let rack: Rack;
    const reserveService: ReserveService = new ReserveService();
    const rackService: RackService = new RackService();
    const turnManagerService: TurnManagerService = new TurnManagerService(reserveService, rackService);
    const fullRack: Rack = {
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
    beforeEach(() => {
        reserve = reserveService.createReserve();
        rack = { content: [] };
    });

    it('fillRack must fill an unfilled rack up to 7 letters', () => {
        turnManagerService.fillRack(rack, reserve);
        expect(rackService.isFull(rack)).equal(true);
    });

    it('fillRack should do nothing if the rack is already full', () => {
        rack = fullRack;
        turnManagerService.fillRack(rack, reserve);
        expect(rack).equal(fullRack);
    });

    it('areLettersInRack returns true if the letters are contained in the rack and false otherwise', () => {
        const lettersInRack = 'abcdefg';
        const lettersNotInRack = 'plmn';
        rackService.addLetters(lettersInRack, rack);

        expect(turnManagerService.areLettersInRack(rack, lettersInRack)).equal(true);

        expect(turnManagerService.areLettersInRack(rack, lettersNotInRack)).equal(false);
    });

    it('removeLettersFromRack removes letters from the rack ', () => {
        const lettersToRemove = 'AAAAAAA';
        turnManagerService.removeLettersFromRack(lettersToRemove, rack);
        expect(rackService.isEmpty(rack)).equal(true);
    });

    it('removeLettersFromRack should return the rack as is if the letters to remove are not in it', () => {
        const lettersInRack = 'aaaaaaa';
        const lettersToRemove = 'bbbbb';
        rackService.addLetters(lettersInRack, rack);
        turnManagerService.removeLettersFromRack(lettersToRemove, rack);
        expect(rackService.containsLetters(lettersInRack, rack)).equal(true);
    });
});
