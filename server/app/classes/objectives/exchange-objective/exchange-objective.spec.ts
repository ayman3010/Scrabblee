import { TEST_ROOM } from '@app/classes/constants/room';
import { Room } from '@app/classes/interfaces/room';
import { ExchangeObjective } from '@app/classes/objectives/exchange-objective/exchange-objective';
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Player } from '@common/interfaces/player';
import { expect } from 'chai';
import { Subject } from 'rxjs';
import * as sinon from 'sinon';

describe('Exchange Objective Test', () => {
    let objective: ExchangeObjective;
    let room: Room;

    const playerOne: Player = { name: 'John', socketId: 'one', rack: { content: [] }, isTurn: true, points: 0, abandoned: false };
    const playerTwo: Player = { name: 'Martha', socketId: 'two', rack: { content: [] }, isTurn: false, points: 0, abandoned: false };

    beforeEach(() => {
        room = { ...TEST_ROOM };
        room.hostPlayer = playerOne;
        room.guestPlayer = playerTwo;
        room.drawEvent = new Subject<void>();
        objective = new ExchangeObjective(room);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should call hasExchangedEnoughPoints upon exchangeEvent', () => {
        const stub = sinon.stub(objective as any, 'hasExchangedEnoughPoints').returns(false);
        room.exchangeEvent.next('');
        expect(stub.called).equal(true);
    });

    it('should not call givePoints if hasExchangedEnoughPoints returns false upon exchangeEvent', () => {
        sinon.stub(objective as any, 'hasExchangedEnoughPoints').returns(false);
        const stub = sinon.stub(objective as any, 'givePoints');
        room.exchangeEvent.next('');
        expect(stub.called).equal(false);
    });

    it('should call givePoints if hasExchangedEnoughPoints returns true upon exchangeEvent', () => {
        sinon.stub(objective as any, 'hasExchangedEnoughPoints').returns(true);
        const stub = sinon.stub(objective as any, 'givePoints');
        room.exchangeEvent.next('');
        expect(stub.called).equal(true);
    });

    it('hasExchangedEnoughPoints should return false if validation is invalid', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return true;
            },
        });
        const returnValue = objective['hasExchangedEnoughPoints']('');
        expect(returnValue).equal(false);
    });

    it('hasExchangedEnoughPoints should return false if there is not enough points', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['hasExchangedEnoughPoints']('eee');
        expect(returnValue).equal(false);
    });

    it('hasExchangedEnoughPoints should return true if the exchange value is greter than 30', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['hasExchangedEnoughPoints']('xzwe');
        expect(returnValue).equal(true);
    });
});
