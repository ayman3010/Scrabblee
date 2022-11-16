/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TEST_ROOM } from '@app/classes/constants/room';
import { Room } from '@app/classes/interfaces/room';
import { DEFAULT_PLACE_COMMAND } from '@common/constants/command-constants';
import { ValidCommand } from '@common/interfaces/command-interface';
import { ObjectiveOwner } from '@common/interfaces/objective-client';
import { Player } from '@common/interfaces/player';
import { expect } from 'chai';
import { Subject } from 'rxjs';
import * as sinon from 'sinon';
import { ConsecutivePlacementObjective, CONSECUTIVE_PLACEMENT, RESET_COUNTER } from './consecutive-placement-objective';

describe('ConsecutivePlacementObjective Test', () => {
    let objective: ConsecutivePlacementObjective;
    let room: Room;

    const playerOne: Player = { name: 'John', socketId: 'one', rack: { content: [] }, isTurn: true, points: 0, abandoned: false };
    const playerTwo: Player = { name: 'Martha', socketId: 'two', rack: { content: [] }, isTurn: false, points: 0, abandoned: false };

    beforeEach(() => {
        room = { ...TEST_ROOM };
        room.hostPlayer = playerOne;
        room.guestPlayer = playerTwo;
        room.skipEvent = new Subject<void>();
        room.exchangeEvent = new Subject<string>();
        room.placeEvent = new Subject<ValidCommand>();
        objective = new ConsecutivePlacementObjective(room);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should initially set all counters to 0 of owners upon creation', () => {
        for (const owner of objective.owners) expect(owner.counter).equal(0);
    });

    it('should call handleCounter with RESET_COUNTER upon skipEvent', () => {
        const stub = sinon.stub(objective as any, 'handleCounter');
        room.skipEvent.next();
        expect(stub.calledWith(RESET_COUNTER)).equal(true);
    });

    it('should call handleCounter with RESET_COUNTER upon exchangeEvent', () => {
        const stub = sinon.stub(objective as any, 'handleCounter');
        room.exchangeEvent.next('');
        expect(stub.calledWith(RESET_COUNTER)).equal(true);
    });

    it('should call handleCounter upon placeEvent with lettersPlaced', () => {
        const letters = 'letter';
        const stub = sinon.stub(objective as any, 'handleCounter').returns(false);
        room.placeEvent.next({ command: { ...DEFAULT_PLACE_COMMAND, lettersToPlace: letters }, points: 0 });
        expect(stub.calledWith(letters)).equal(true);
    });

    it('should not call givePoints if handleCounter returns false upon placeEvent', () => {
        sinon.stub(objective as any, 'handleCounter').returns(false);
        const stub = sinon.stub(objective as any, 'givePoints');
        room.placeEvent.next({ command: { ...DEFAULT_PLACE_COMMAND }, points: 0 });
        expect(stub.called).equal(false);
    });

    it('should call givePoints if handleCounter returns true upon placeEvent', () => {
        sinon.stub(objective as any, 'handleCounter').returns(true);
        const stub = sinon.stub(objective as any, 'givePoints');
        room.placeEvent.next({ command: { ...DEFAULT_PLACE_COMMAND }, points: 0 });
        expect(stub.called).equal(true);
    });

    it('handleCounter should return false if objective achieved', () => {
        objective.isAchieved = true;
        const returnValue = objective['handleCounter']('');
        expect(returnValue).equal(false);
    });

    it('handleCounter should return false if currentOwner is undefined', () => {
        Object.defineProperty(objective, 'currentOwner', {
            get() {
                return undefined;
            },
        });
        const returnValue = objective['handleCounter']('');
        expect(returnValue).equal(false);
    });

    it('handleCounter should return false if currentOwner.counter is undefined', () => {
        Object.defineProperty(objective, 'currentOwner', {
            get() {
                return { name: 'John' };
            },
        });
        const returnValue = objective['handleCounter']('');
        expect(returnValue).equal(false);
    });

    it('handleCounter should increment the counter if conditions are met and return false if the counter is under the number to draw', () => {
        const objectiveOwner: ObjectiveOwner = { name: 'John', counter: 0 };
        Object.defineProperty(objective, 'currentOwner', {
            get() {
                return objectiveOwner;
            },
        });
        const returnValue = objective['handleCounter']('four');
        expect(objectiveOwner.counter).equal(1);
        expect(returnValue).equal(false);
    });

    it('handleCounter should increment the counter if conditions are met and return true if the counter equals the number to draw', () => {
        const objectiveOwner: ObjectiveOwner = { name: 'John', counter: CONSECUTIVE_PLACEMENT - 1 };
        Object.defineProperty(objective, 'currentOwner', {
            get() {
                return objectiveOwner;
            },
        });
        const returnValue = objective['handleCounter']('four');
        expect(objectiveOwner.counter).equal(CONSECUTIVE_PLACEMENT);
        expect(returnValue).equal(true);
    });

    it('handleCounter should reset the counter if conditions are not met', () => {
        const objectiveOwner: ObjectiveOwner = { name: 'John', counter: CONSECUTIVE_PLACEMENT - 1 };
        Object.defineProperty(objective, 'currentOwner', {
            get() {
                return objectiveOwner;
            },
        });
        const returnValue = objective['handleCounter']('');
        expect(objectiveOwner.counter).equal(0);
        expect(returnValue).equal(false);
    });
});
