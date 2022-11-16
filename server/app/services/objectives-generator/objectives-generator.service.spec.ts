/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* tslint:disable:no-unused-variable */
import { TEST_ROOM } from '@app/classes/constants/room';
import { Room } from '@app/classes/interfaces/room';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { Tools } from '@app/classes/tools/tools';
import { Player } from '@common/interfaces/player';
import { expect } from 'chai';
import * as sinon from 'sinon';
import { ObjectivesGeneratorService } from './objectives-generator.service';

describe('Service: ObjectivesGenerator', () => {
    let objectivesGenerator: ObjectivesGeneratorService;
    let room: Room;
    let objectivesList: AbstractObjective[];

    const playerOne: Player = { name: 'John', socketId: 'one', rack: { content: [] }, isTurn: true, points: 0, abandoned: false };
    const playerTwo: Player = { name: 'Martha', socketId: 'two', rack: { content: [] }, isTurn: false, points: 0, abandoned: false };

    beforeEach(() => {
        objectivesList = [];
        objectivesGenerator = new ObjectivesGeneratorService();
        room = { ...TEST_ROOM };
        room.hostPlayer = playerOne;
        room.guestPlayer = playerTwo;
        room.objectives = objectivesList;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('generateAllObjectives should call generateObjectives three times', () => {
        sinon.stub(Tools, 'generateMultipleRandom').returns([0, 1, 2, 3]);
        const stub = sinon.stub(objectivesGenerator as any, 'generateObjectives');

        objectivesGenerator.generateAllObjectives(room);
        expect(stub.calledOnceWith(room, [0, 1]));
        expect(stub.calledOnceWith(room, [2], playerOne.name));
        expect(stub.calledOnceWith(room, [3], playerTwo.name));
    });

    it('generateObjectives should create then add to the room the objectives', () => {
        objectivesGenerator['generateObjectives'](room, [0]);
        expect(objectivesList[0]).instanceOf(objectivesGenerator['objectiveTypes'][0]);
    });
});
