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
import { MINIMUM_CONSONANTS_TO_PLACE, PlaceConsonantsObjective } from './place-consonants-objective';

describe('Consonants Objective Test', () => {
    let objective: PlaceConsonantsObjective;
    let room: Room;

    const playerOne: Player = { name: 'John', socketId: 'one', rack: { content: [] }, isTurn: true, points: 0, abandoned: false };
    const playerTwo: Player = { name: 'Martha', socketId: 'two', rack: { content: [] }, isTurn: false, points: 0, abandoned: false };

    beforeEach(() => {
        room = { ...TEST_ROOM };
        room.hostPlayer = playerOne;
        room.guestPlayer = playerTwo;
        room.drawEvent = new Subject<void>();
        objective = new PlaceConsonantsObjective(room);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should call PlaceConsonantsObjective upon placeEvent', () => {
        const stub = sinon.stub(objective as any, 'hasPlacedThreeConsonants').returns(false);
        room.placeEvent.next({ command: DEFAULT_PLACE_COMMAND, points: 0 });
        expect(stub.called).equal(true);
    });

    it('should not call givePoints if PlaceConsonantsObjective returns false upon placeEvent', () => {
        sinon.stub(objective as any, 'hasPlacedThreeConsonants').returns(false);
        const stub = sinon.stub(objective as any, 'givePoints');
        room.placeEvent.next({ command: DEFAULT_PLACE_COMMAND, points: 0 });
        expect(stub.called).equal(false);
    });

    it('should call givePoints if PlaceConsonantsObjective returns true upon placeEvent', () => {
        sinon.stub(objective as any, 'hasPlacedThreeConsonants').returns(true);
        const stub = sinon.stub(objective as any, 'givePoints');
        room.placeEvent.next({ command: DEFAULT_PLACE_COMMAND, points: 0 });
        expect(stub.called).equal(true);
    });

    it('PlaceConsonantsObjective should return false if validation is invalid', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return true;
            },
        });
        const returnValue = objective['hasPlacedThreeConsonants']('any');
        expect(returnValue).equal(false);
    });

    it('placeConsonantsObjective should return true', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['hasPlacedThreeConsonants']('b'.repeat(MINIMUM_CONSONANTS_TO_PLACE));
        expect(returnValue).equal(true);
    });

    it('placeConsonantsObjective should return false if not all letters are consonants', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['hasPlacedThreeConsonants']('a'.repeat(1) + 'b'.repeat(MINIMUM_CONSONANTS_TO_PLACE));
        expect(returnValue).equal(false);
    });

    it('placeConsonantsObjective should return false if there are less than three consonants', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['hasPlacedThreeConsonants']('b'.repeat(MINIMUM_CONSONANTS_TO_PLACE - 1));
        expect(returnValue).equal(false);
    });
});
