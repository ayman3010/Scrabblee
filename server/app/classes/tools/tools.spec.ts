/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TEST_ROOM } from '@app/classes/constants/room';
import { Room } from '@app/classes/interfaces/room';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { Message } from '@app/message';
import { FROM_SYSTEM, SYSTEM_MESSAGE_COLOR } from '@common/constants/room-constants';
import { Orientation } from '@common/enums/enums';
import { HighScoreClient } from '@common/interfaces/high-score';
import { RoomClient } from '@common/interfaces/room';
import { RoomMessage } from '@common/interfaces/room-message';
import { expect } from 'chai';
import { describe } from 'mocha';
import * as sinon from 'sinon';
import { Tools } from './tools';

describe('Service: Tools', () => {
    const min = 1;
    const max = 3;
    const step = 1;
    const inverted = false;

    beforeEach(() => {
        sinon.restore();
    });

    it('should return an array containing only 0 with min and max equal to zero', () => {
        const result = Tools.range(0, 0);
        const expected = [0];

        expect(result).to.be.eql(expected);
    });

    it('should return an empty array with a falsey step', () => {
        const result = Tools.range(min, max, 0);
        const expected: [] = [];

        expect(result).to.be.eql(expected);
    });

    it('should return an empty array with a negative step', () => {
        const result = Tools.range(min, max, -step);
        const expected: [] = [];

        expect(result).to.be.eql(expected);
    });

    it('should return an array containing all the steps between min and max, inclusively', () => {
        const result = Tools.range(min, max, step, inverted);
        const expected = [1, 2, 3];

        expect(result).to.be.eql(expected);
    });

    it('should return an array in decreasing order when provided with valid arguments', () => {
        const result = Tools.range(min, max, step, !inverted);
        const expected = [3, 2, 1];

        expect(result).to.be.eql(expected);
    });

    it('should return [0, 1] when called with no argument', () => {
        const result = Tools.range();
        const expected = [0, 1];

        expect(result).to.be.eql(expected);
    });

    it('playerNameSizeCheck should return false when provided with an empty string', () => {
        const result = Tools.playerNameSizeCheck('');
        const expected = false;

        expect(result).to.be.equal(expected);
    });

    it("playerNameSizeCheck should return false when provided with a name that's too short", () => {
        const result = Tools.playerNameSizeCheck('no');
        const expected = false;

        expect(result).to.be.equal(expected);
    });

    it("playerNameSizeCheck should return false when provided with a name that's too long", () => {
        const result = Tools.playerNameSizeCheck('John Scrabble, inventor of Scrabble');
        const expected = false;

        expect(result).to.be.equal(expected);
    });

    it("playerNameSizeCheck should return true when provided with a name that's of a valid length", () => {
        const result = Tools.playerNameSizeCheck('John Scrabble');
        const expected = true;

        expect(result).to.be.equal(expected);
    });

    it('coordinatesToString should return the right converted string from a given pair of coordinates', () => {
        const expected = 'h8';
        expect(Tools.coordinatesToString({ coordH: 7, coordV: 7 })).to.be.equal(expected);
    });

    it('orientationToString should return h when given an horizontal orientation', () => {
        const expected = 'h';
        expect(Tools.orientationToString(Orientation.Horizontal)).to.be.equal(expected);
    });

    it('orientationToString should return v when given a vertical orientation', () => {
        const expected = 'v';
        expect(Tools.orientationToString(Orientation.Vertical)).to.be.equal(expected);
    });

    it('buildRoomMessage should form a RoomMessage with the right parameters, and with an empty color string if no color is specified.', () => {
        const expectedMessage = 'Hi!';
        const expectedRoomKey = 'aLegitKey';
        const expectedSenderName = 'John Scrabble';
        const expectedColor = '';

        const result: RoomMessage = Tools.buildRoomMessage(expectedMessage, expectedRoomKey, expectedSenderName);
        expect(result.value).equal(expectedMessage);
        expect(result.roomKey).equal(expectedRoomKey);
        expect(result.senderName).equal(expectedSenderName);
        expect(result.color).equal(expectedColor);
    });

    it('buildRoomMessage should form a RoomMessage with the right parameters, and with the correct color attribute if a color is specified.', () => {
        const expectedMessage = 'Hi!';
        const expectedRoomKey = 'aLegitKey';
        const expectedSenderName = 'John Scrabble';
        const expectedColor = 'blue';

        const result: RoomMessage = Tools.buildRoomMessage(expectedMessage, expectedRoomKey, expectedSenderName, expectedColor);
        expect(result.value).equal(expectedMessage);
        expect(result.roomKey).equal(expectedRoomKey);
        expect(result.senderName).equal(expectedSenderName);
        expect(result.color).equal(expectedColor);
    });

    it('buildSystemRoomMessage should call buildRoomMessage.', () => {
        const expectedMessage = 'Hi!';
        const expectedRoomKey = 'aLegitKey';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const buildRoomMessageStub = sinon.stub(Tools, 'buildRoomMessage');

        Tools.buildSystemRoomMessage(expectedMessage, expectedRoomKey);

        expect(buildRoomMessageStub.called).equal(true);
    });

    it('buildSystemRoomMessage should form a RoomMessage with the right parameters.', () => {
        const expectedMessage = 'Hi!';
        const expectedRoomKey = 'aLegitKey';
        const expectedSenderName = FROM_SYSTEM;
        const expectedColor = SYSTEM_MESSAGE_COLOR;

        const result: RoomMessage = Tools.buildSystemRoomMessage(expectedMessage, expectedRoomKey);
        expect(result.value).equal(expectedMessage);
        expect(result.roomKey).equal(expectedRoomKey);
        expect(result.senderName).equal(expectedSenderName);
        expect(result.color).equal(expectedColor);
    });

    it('isTypeOf should return true if data is of specified type.', () => {
        const message: Message = { title: 'test', body: 'testing' };
        expect(Tools.isTypeOf<Message>(message, 'title')).equal(true);
    });

    it('isTypeOf should return false if data is not of specified type.', () => {
        const message: Message[] = [{ title: 'test', body: 'testing' }];
        expect(Tools.isTypeOf<HighScoreClient>(message, 'score')).equal(false);
    });

    it('convertToRoomClient should remove only keep attributes implementing the RoomClient interface.', () => {
        sinon.stub(Tools, 'convertToObjectiveClientList').returns([]);
        const result: RoomClient = Tools.convertToRoomClient({ ...TEST_ROOM });
        expect(result.key).equal(TEST_ROOM.key);
        expect((result as Room).drawEvent).equal(undefined);
    });

    it('convertToObjectiveClientList should call convertToObjectiveClient as many times as the number of objectives.', () => {
        const objectives: AbstractObjective[] = [
            { description: '', points: 0, isAchieved: false, owners: [{ name: '' }] },
            { description: '', points: 0, isAchieved: false, owners: [{ name: '' }] },
        ] as AbstractObjective[];
        const stub = sinon.stub(Tools, 'convertToObjectiveClient').returns({ description: '', points: 0, isAchieved: false, owners: [{ name: '' }] });
        const result = Tools.convertToObjectiveClientList(objectives);
        expect(stub.calledTwice).equal(true);
        expect(result.length).equal(2);
    });

    it('convertToObjectiveClientList should return an empty list if the given list is empty.', () => {
        const objectives: AbstractObjective[] = [];
        const result = Tools.convertToObjectiveClientList(objectives);
        expect(result.length).equal(0);
    });

    it('convertToObjectiveClient should only keep attributes implementing the ObjectiveClient interface.', () => {
        const objective: AbstractObjective = {
            description: 'description',
            points: 0,
            isAchieved: false,
            owners: [{ name: '' }],
        } as AbstractObjective;

        objective['room'] = TEST_ROOM;
        const result = Tools.convertToObjectiveClient(objective);
        expect(result.description).equal('description');
        expect((result as AbstractObjective)['room']).equal(undefined);
    });

    it('generateRandom should multiply received number by range and floor.', () => {
        const randomNumber = 0.564;
        const expected = 1;
        sinon.stub(Math, 'random').returns(randomNumber);
        const result = Tools.generateRandom(2);
        expect(result).equal(expected);
    });

    it('generateMultipleRandom should return a empty list with negative quantity.', () => {
        const stub = sinon.stub(Tools, 'generateRandom');
        stub.onFirstCall().returns(1);
        stub.onSecondCall().returns(0);
        const result = Tools.generateMultipleRandom(2, -1);
        expect(result).eql([]);
    });

    it('generateMultipleRandom should return less elements than quantity if isUnique is true but range minus quantity is negative.', () => {
        const stub = sinon.stub(Tools, 'generateRandom');
        stub.onFirstCall().returns(0);
        stub.onSecondCall().returns(1);
        stub.onThirdCall().returns(0);
        const result = Tools.generateMultipleRandom(2, 3, true);
        expect(result).eql([0, 1]);
    });

    it('generateMultipleRandom should return a list of random number with specified quantity.', () => {
        const stub = sinon.stub(Tools, 'generateRandom');
        stub.onFirstCall().returns(1);
        stub.onSecondCall().returns(1);
        stub.onThirdCall().returns(0);
        const result = Tools.generateMultipleRandom(2, 2);
        expect(result).eql([1, 1]);
    });

    it('generateMultipleRandom should return a list of random unique number with specified quantity if isUnique is true.', () => {
        const stub = sinon.stub(Tools, 'generateRandom');
        stub.onFirstCall().returns(1);
        stub.onSecondCall().returns(1);
        stub.onThirdCall().returns(0);
        const result = Tools.generateMultipleRandom(2, 2, true);
        expect(result).eql([1, 0]);
    });
});
