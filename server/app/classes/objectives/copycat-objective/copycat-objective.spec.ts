/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TEST_ROOM } from '@app/classes/constants/room';
import { Room } from '@app/classes/interfaces/room';
import { Orientation } from '@common/enums/enums';
import { WordOnBoard } from '@common/interfaces/board-interface';
import { Player } from '@common/interfaces/player';
import { expect } from 'chai';
import { Subject } from 'rxjs';
import * as sinon from 'sinon';
import { CopycatObjective, SIZE_TO_BE_GREATER_THAN } from './copycat-objective';

describe('CopycatObjective Test', () => {
    let objective: CopycatObjective;
    let room: Room;

    const playerOne: Player = { name: 'John', socketId: 'one', rack: { content: [] }, isTurn: true, points: 0, abandoned: false };
    const playerTwo: Player = { name: 'Martha', socketId: 'two', rack: { content: [] }, isTurn: false, points: 0, abandoned: false };

    beforeEach(() => {
        room = { ...TEST_ROOM };
        room.hostPlayer = playerOne;
        room.guestPlayer = playerTwo;
        room.drawEvent = new Subject<void>();
        objective = new CopycatObjective(room);
    });

    afterEach(() => {
        sinon.restore();
    });

    it('should call validateBoard upon boardWordsEvent', () => {
        const stub = sinon.stub(objective as any, 'validateBoard').returns(false);
        room.boardWordsEvent.next([]);
        expect(stub.called).equal(true);
    });

    it('should not call givePoints if validateBoard returns false upon boardWordsEvent', () => {
        sinon.stub(objective as any, 'validateBoard').returns(false);
        const stub = sinon.stub(objective as any, 'givePoints');
        room.boardWordsEvent.next([]);
        expect(stub.called).equal(false);
    });

    it('should call givePoints if validateBoard returns true upon boardWordsEvent', () => {
        sinon.stub(objective as any, 'validateBoard').returns(true);
        const stub = sinon.stub(objective as any, 'givePoints');
        room.boardWordsEvent.next([]);
        expect(stub.called).equal(true);
    });

    it('validateBoard should return false if validation is invalid', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return true;
            },
        });
        const returnValue = objective['validateBoard']([]);
        expect(returnValue).equal(false);
    });

    it('validateBoard should return false if there is no words', () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const returnValue = objective['validateBoard']([]);
        expect(returnValue).equal(false);
    });

    it(`validateBoard should return false if there is not two identical words with more than ${SIZE_TO_BE_GREATER_THAN} letters`, () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const listWordsOnboard: WordOnBoard[] = [
            { word: 'one', position: { coordH: 8, coordV: 8 }, orientation: Orientation.Horizontal },
            { word: 'one', position: { coordH: 8, coordV: 8 }, orientation: Orientation.Horizontal },
            { word: 'hundreds', position: { coordH: 8, coordV: 8 }, orientation: Orientation.Horizontal },
            { word: 'seventy', position: { coordH: 8, coordV: 8 }, orientation: Orientation.Horizontal },
        ];
        const returnValue = objective['validateBoard'](listWordsOnboard);
        expect(returnValue).equal(false);
    });

    it(`validateBoard should return true if there is two identical words with more than ${SIZE_TO_BE_GREATER_THAN} letters`, () => {
        Object.defineProperty(objective, 'isInvalid', {
            get() {
                return false;
            },
        });
        const listWordsOnboard: WordOnBoard[] = [
            { word: 'one', position: { coordH: 8, coordV: 8 }, orientation: Orientation.Horizontal },
            { word: 'five', position: { coordH: 8, coordV: 8 }, orientation: Orientation.Horizontal },
            { word: 'seventy', position: { coordH: 8, coordV: 8 }, orientation: Orientation.Horizontal },
            { word: 'SeVeNtY', position: { coordH: 8, coordV: 8 }, orientation: Orientation.Horizontal },
        ];
        const returnValue = objective['validateBoard'](listWordsOnboard);
        expect(returnValue).equal(true);
    });
});
