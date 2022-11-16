/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TEST_ROOM } from '@app/classes/constants/room';
import { Room } from '@app/classes/interfaces/room';
import { DEFAULT_PLACE_COMMAND } from '@common/constants/command-constants';
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Player } from '@common/interfaces/player';
import { expect } from 'chai';
import { Subject } from 'rxjs';
import * as sinon from 'sinon';
import { MINIMUM_PLACEMENT, PlaceFifteenObjective } from './place-fifteen-objective';

describe('Lesss than fifteen Objective Test', () => {
    let objective: PlaceFifteenObjective;
    let room: Room;

    const playerOne: Player = { name: 'John', socketId: 'one', rack: { content: [] }, isTurn: true, points: 0, abandoned: false };
    const playerTwo: Player = { name: 'Martha', socketId: 'two', rack: { content: [] }, isTurn: false, points: 0, abandoned: false };

    beforeEach(() => {
        room = { ...TEST_ROOM };
        room.hostPlayer = playerOne;
        room.guestPlayer = playerTwo;
        room.drawEvent = new Subject<void>();
        objective = new PlaceFifteenObjective(room);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should call PlaceFifteenObjective upon placeEvent', () => {
        const stub = sinon.stub(objective as any, 'hasAchievedPointsObjective').returns(false);
        room.placeEvent.next({ command: DEFAULT_PLACE_COMMAND, points: 0 });
        expect(stub.called).equal(true);
    });

    it('should not call givePoints if PlaceFifteenObjective returns false upon placeEvent', () => {
        sinon.stub(objective as any, 'hasAchievedPointsObjective').returns(false);
        const stub = sinon.stub(objective as any, 'givePoints');
        room.placeEvent.next({ command: DEFAULT_PLACE_COMMAND, points: 0 });
        expect(stub.called).equal(false);
    });

    it('should call givePoints if PlaceFifteenObjective returns true upon placeEvent', () => {
        sinon.stub(objective as any, 'hasAchievedPointsObjective').returns(true);
        const stub = sinon.stub(objective as any, 'givePoints');
        room.placeEvent.next({ command: DEFAULT_PLACE_COMMAND, points: 0 });
        expect(stub.called).equal(true);
    });

    it('PlaceFifteenObjective should return false if validation is invalid', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return true;
            },
        });
        const returnValue = objective['hasAchievedPointsObjective']('any', 0);
        expect(returnValue).equal(false);
    });

    it('PlaceFifteenObjective should return true', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['hasAchievedPointsObjective']('b'.repeat(MINIMUM_PLACEMENT), 0);
        expect(returnValue).equal(true);
    });

    it('PlaceFifteenObjective should return false if it surpases 15 points', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['hasAchievedPointsObjective']('b'.repeat(MINIMUM_PLACEMENT), 16);
        expect(returnValue).equal(false);
    });

    it('PlaceFifteenObjective should return false if tthere is less than 5 letters', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['hasAchievedPointsObjective']('b'.repeat(MINIMUM_PLACEMENT - 1), 3);
        expect(returnValue).equal(false);
    });
});
