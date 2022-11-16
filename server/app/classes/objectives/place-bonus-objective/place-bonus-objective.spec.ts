/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TEST_ROOM } from '@app/classes/constants/room';
import { Room } from '@app/classes/interfaces/room';
import { DEFAULT_PLACE_COMMAND } from '@common/constants/command-constants';
import { Tile } from '@common/interfaces/board-interface';
import { Player } from '@common/interfaces/player';
import { expect } from 'chai';
import { Subject } from 'rxjs';
import * as sinon from 'sinon';
import { PlaceBonusObjective } from './place-bonus-objective';

describe('Bonus Objective Test', () => {
    let objective: PlaceBonusObjective;
    let room: Room;

    const playerOne: Player = { name: 'John', socketId: 'one', rack: { content: [] }, isTurn: true, points: 0, abandoned: false };
    const playerTwo: Player = { name: 'Martha', socketId: 'two', rack: { content: [] }, isTurn: false, points: 0, abandoned: false };

    beforeEach(() => {
        room = { ...TEST_ROOM };
        room.hostPlayer = playerOne;
        room.guestPlayer = playerTwo;
        room.drawEvent = new Subject<void>();
        objective = new PlaceBonusObjective(room);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should call hasAchievedBonusObjective upon placeEvent', () => {
        const stub = sinon.stub(objective as any, 'hasAchievedBonusObjective').returns(false);
        room.placeEvent.next({ command: { ...DEFAULT_PLACE_COMMAND }, points: 1 });
        expect(stub.called).equal(true);
    });

    it('should not call givePoints if hasAchievedBonusObjective returns false upon placeEvent', () => {
        sinon.stub(objective as any, 'hasAchievedBonusObjective').returns(false);
        const stub = sinon.stub(objective as any, 'givePoints');
        room.placeEvent.next({ command: { ...DEFAULT_PLACE_COMMAND }, points: 1 });
        expect(stub.called).equal(false);
    });

    it('should call givePoints if hasAchievedBonusObjective returns true upon placeEvent', () => {
        sinon.stub(objective as any, 'hasAchievedBonusObjective').returns(true);
        const stub = sinon.stub(objective as any, 'givePoints');
        room.placeEvent.next({ command: { ...DEFAULT_PLACE_COMMAND }, points: 1 });
        expect(stub.called).equal(true);
    });

    it('hasAchievedBonusObjective should return false if validation is invalid', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return true;
            },
        });
        const returnValue = objective['hasAchievedBonusObjective'](objective['room'].board.content, [{ coordH: 0, coordV: 0 }]);
        expect(returnValue).equal(false);
    });

    it('hasAchievedBonusObjective should return false when bonus is not placed', () => {
        sinon.stub(objective as any, 'bonusIsPlacedOnTriple').returns(false);
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const content: Tile[][] = [[{ bonus: 1, tile: { letter: 'd', value: 0 }, placedThisTurn: false }]];
        const returnValue = objective['hasAchievedBonusObjective'](content, [{ coordH: 0, coordV: 0 }]);
        expect(returnValue).equal(false);
    });

    it('hasAchievedBonusObjective should return true when bonus is placed', () => {
        sinon.stub(objective as any, 'bonusIsPlacedOnTriple').returns(true);
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const content: Tile[][] = [[{ bonus: 1, tile: { letter: 'd', value: 0 }, placedThisTurn: false }]];

        const returnValue = objective['hasAchievedBonusObjective'](content, [{ coordH: 0, coordV: 0 }]);
        expect(returnValue).equal(true);
    });

    it('bonusIsPlacedOnTriple should return false', () => {
        sinon.stub(objective as any, 'isBonusLetter').returns(false);
        sinon.stub(objective as any, 'isTripleBonus').returns(true);
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['bonusIsPlacedOnTriple']({ bonus: 1, tile: { letter: 'd', value: 0 }, placedThisTurn: false });
        expect(returnValue).equal(false);
    });

    it('bonusIsPlacedOnTriple should return true', () => {
        sinon.stub(objective as any, 'isBonusLetter').returns(true);
        sinon.stub(objective as any, 'isTripleBonus').returns(true);
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['bonusIsPlacedOnTriple']({ bonus: 1, tile: { letter: 'd', value: 0 }, placedThisTurn: false });
        expect(returnValue).equal(true);
    });

    it('isBonusLetter should return true when it is a bonus', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['isBonusLetter']({ bonus: 1, tile: { letter: 'd', value: 0 }, placedThisTurn: false });
        expect(returnValue).equal(true);
    });

    it('isBonusLetter should return false when tile has a value', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['isBonusLetter']({ bonus: 1, tile: { letter: 'd', value: 1 }, placedThisTurn: false });
        expect(returnValue).equal(false);
    });

    it('isBonusLetter should return false when tile is empty', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['isBonusLetter']({ bonus: 1, tile: { letter: '', value: 1 }, placedThisTurn: false });
        expect(returnValue).equal(false);
    });

    it('isBonusLetter should return true when tile is contains a bonus', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['isBonusLetter']({ bonus: 1, tile: { letter: 'd', value: 0 }, placedThisTurn: false });
        expect(returnValue).equal(true);
    });

    it('isTripleBonus should return false when it was not placed in this turn ', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['isTripleBonus']({ bonus: 2, tile: { letter: '', value: 1 }, placedThisTurn: false });
        expect(returnValue).equal(false);
    });

    it('isTripleBonus should return false when it was not a a triple bonus', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['isTripleBonus']({ bonus: 1, tile: { letter: '', value: 1 }, placedThisTurn: false });
        expect(returnValue).equal(false);
    });

    it('isTripleBonus should return true ', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['isTripleBonus']({ bonus: 2, tile: { letter: '', value: 1 }, placedThisTurn: true });
        expect(returnValue).equal(true);
    });
});
