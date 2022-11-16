/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TEST_ROOM } from '@app/classes/constants/room';
import { Room } from '@app/classes/interfaces/room';
import { ObjectiveOwner } from '@common/interfaces/objective-client';
import { Player } from '@common/interfaces/player';
import { expect } from 'chai';
import { Subject } from 'rxjs';
import * as sinon from 'sinon';
import { DrawObjective, NUMBER_TO_DRAW } from './draw-objective';

describe('DrawObjective Test', () => {
    let objective: DrawObjective;
    let room: Room;

    const playerOne: Player = { name: 'John', socketId: 'one', rack: { content: [] }, isTurn: true, points: 0, abandoned: false };
    const playerTwo: Player = { name: 'Martha', socketId: 'two', rack: { content: [] }, isTurn: false, points: 0, abandoned: false };

    beforeEach(() => {
        room = { ...TEST_ROOM };
        room.hostPlayer = playerOne;
        room.guestPlayer = playerTwo;
        room.drawEvent = new Subject<void>();
        objective = new DrawObjective(room);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should initially set all counters to 0 of owners upon creation', () => {
        for (const owner of objective.owners) expect(owner.counter).equal(0);
    });

    it('should call incrementCounter upon drawEvent', () => {
        const stub = sinon.stub(objective as any, 'incrementCounter').returns(false);
        room.drawEvent.next();
        expect(stub.called).equal(true);
    });

    it('should not call givePoints if incrementCounter returns false upon drawEvent', () => {
        sinon.stub(objective as any, 'incrementCounter').returns(false);
        const stub = sinon.stub(objective as any, 'givePoints');
        room.drawEvent.next();
        expect(stub.called).equal(false);
    });

    it('should call givePoints if incrementCounter returns true upon drawEvent', () => {
        sinon.stub(objective as any, 'incrementCounter').returns(true);
        const stub = sinon.stub(objective as any, 'givePoints');
        room.drawEvent.next();
        expect(stub.called).equal(true);
    });

    it('incrementCounter should return false if objective achieved', () => {
        objective.isAchieved = true;
        const returnValue = objective['incrementCounter']();
        expect(returnValue).equal(false);
    });

    it('incrementCounter should return false if currentOwner is undefined', () => {
        Object.defineProperty(objective, 'currentOwner', {
            get() {
                return undefined;
            },
        });
        const returnValue = objective['incrementCounter']();
        expect(returnValue).equal(false);
    });

    it('incrementCounter should return false if currentOwner.counter is undefined', () => {
        Object.defineProperty(objective, 'currentOwner', {
            get() {
                return { name: 'John' };
            },
        });
        const returnValue = objective['incrementCounter']();
        expect(returnValue).equal(false);
    });

    it('incrementCounter should increment the counter if conditions are met and return false if the counter is under the number to draw', () => {
        const objectiveOwner: ObjectiveOwner = { name: 'John', counter: 0 };
        Object.defineProperty(objective, 'currentOwner', {
            get() {
                return objectiveOwner;
            },
        });
        const returnValue = objective['incrementCounter']();
        expect(objectiveOwner.counter).equal(1);
        expect(returnValue).equal(false);
    });

    it('incrementCounter should increment the counter if conditions are met and return true if the counter equals the number to draw', () => {
        const objectiveOwner: ObjectiveOwner = { name: 'John', counter: NUMBER_TO_DRAW - 1 };
        Object.defineProperty(objective, 'currentOwner', {
            get() {
                return objectiveOwner;
            },
        });
        const returnValue = objective['incrementCounter']();
        expect(objectiveOwner.counter).equal(NUMBER_TO_DRAW);
        expect(returnValue).equal(true);
    });
});
