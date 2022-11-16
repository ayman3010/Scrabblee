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
import { MINIMUM_VOWELS_TO_PLACE, PlaceVowelsObjective } from './place-vowelles-objective';

describe('Vowels Objective Test', () => {
    let objective: PlaceVowelsObjective;
    let room: Room;

    const playerOne: Player = { name: 'John', socketId: 'one', rack: { content: [] }, isTurn: true, points: 0, abandoned: false };
    const playerTwo: Player = { name: 'Martha', socketId: 'two', rack: { content: [] }, isTurn: false, points: 0, abandoned: false };

    beforeEach(() => {
        room = { ...TEST_ROOM };
        room.hostPlayer = playerOne;
        room.guestPlayer = playerTwo;
        room.drawEvent = new Subject<void>();
        objective = new PlaceVowelsObjective(room);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should call PlaceVowelsObjective upon placeEvent', () => {
        const stub = sinon.stub(objective as any, 'hasPlacedEnoughVowels').returns(false);
        room.placeEvent.next({ command: DEFAULT_PLACE_COMMAND, points: 0 });
        expect(stub.called).equal(true);
    });

    it('should not call givePoints if PlaceVowelsObjective returns false upon placeEvent', () => {
        sinon.stub(objective as any, 'hasPlacedEnoughVowels').returns(false);
        const stub = sinon.stub(objective as any, 'givePoints');
        room.placeEvent.next({ command: DEFAULT_PLACE_COMMAND, points: 0 });
        expect(stub.called).equal(false);
    });

    it('should call givePoints if PlaceVowelsObjective returns true upon placeEvent', () => {
        sinon.stub(objective as any, 'hasPlacedEnoughVowels').returns(true);
        const stub = sinon.stub(objective as any, 'givePoints');
        room.placeEvent.next({ command: DEFAULT_PLACE_COMMAND, points: 0 });
        expect(stub.called).equal(true);
    });

    it('PlaceVowelsObjective should return false if validation is invalid', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return true;
            },
        });
        const returnValue = objective['hasPlacedEnoughVowels']('any');
        expect(returnValue).equal(false);
    });

    it('PlaceVowelsObjective should return true', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['hasPlacedEnoughVowels']('a'.repeat(MINIMUM_VOWELS_TO_PLACE));
        expect(returnValue).equal(true);
    });

    it('PlaceVowelsObjective should return false if there is not enough vowels', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['hasPlacedEnoughVowels']('b'.repeat(MINIMUM_VOWELS_TO_PLACE));
        expect(returnValue).equal(false);
    });
});
