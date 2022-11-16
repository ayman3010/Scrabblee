/* eslint-disable dot-notation */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
import { TEST_ROOM } from '@app/classes/constants/room';
import { Room } from '@app/classes/interfaces/room';
import { ObjectiveOwner } from '@common/interfaces/objective-client';
import { Player } from '@common/interfaces/player';
import { expect } from 'chai';
import { AbstractObjective } from './abstract-objective';

class AbstractObjectiveInstantiable extends AbstractObjective {
    subscribe() {
        return;
    }
}

describe('AbstractObjective Test', () => {
    let room: Room;
    let objective: AbstractObjectiveInstantiable;

    const playerOne: Player = { name: 'John', socketId: 'one', rack: { content: [] }, isTurn: true, points: 0, abandoned: false };
    const playerTwo: Player = { name: 'Martha', socketId: 'two', rack: { content: [] }, isTurn: false, points: 0, abandoned: false };

    beforeEach(() => {
        room = { ...TEST_ROOM };
        room.hostPlayer = playerOne;
        room.guestPlayer = playerTwo;
        objective = new AbstractObjectiveInstantiable(room);
    });

    it('should throw an error upon creation', () => {
        const getRoomFromKey = () => {
            new AbstractObjective(TEST_ROOM);
        };
        expect(getRoomFromKey).throw();
    });

    it('should have both players as owners by default', () => {
        expect(objective.owners.length).equal(2);
    });

    it('should have the specified player as owner if specified', () => {
        const privateObjective = new AbstractObjectiveInstantiable(room, room.hostPlayer.name);
        expect(privateObjective.owners[0].name).equal(room.hostPlayer.name);
        expect(privateObjective.owners.length).equal(1);
    });

    it('should have the specified player as owner if specified', () => {
        const privateObjective = new AbstractObjectiveInstantiable(room, room.hostPlayer.name);
        expect(privateObjective.owners[0].name).equal(room.hostPlayer.name);
        expect(privateObjective.owners.length).equal(1);
    });

    it('updateOwnerName should update the name that do not match the hostPlayer for the name of the guestPlayer', () => {
        const newName = 'Jean';
        const expected: ObjectiveOwner[] = [{ name: room.hostPlayer.name }, { name: newName }];
        room.guestPlayer.name = newName;
        objective.updateOwnerName();
        expect(objective.owners).eql(expected);
    });

    it('givePoints should not give points if currentOwner is undefined', () => {
        const points = 5;
        objective.points = points;
        Object.defineProperty(objective, 'currentOwner', {
            get() {
                return undefined;
            },
        });
        Object.defineProperty(objective, 'currentPlayer', {
            get() {
                return room.hostPlayer;
            },
        });
        const pointsBeforeHost = room.hostPlayer.points;
        const pointsBeforeGuest = room.guestPlayer.points;
        objective['givePoints']();
        expect(room.hostPlayer.points).equal(pointsBeforeHost);
        expect(room.guestPlayer.points).equal(pointsBeforeGuest);
        expect(objective.isAchieved).equal(false);
    });

    it('givePoints should not give points if objective already achieved', () => {
        const points = 5;
        objective.points = points;
        Object.defineProperty(objective, 'currentOwner', {
            get() {
                return undefined;
            },
        });
        Object.defineProperty(objective, 'currentPlayer', {
            get() {
                return room.hostPlayer;
            },
        });
        const pointsBeforeHost = room.hostPlayer.points;
        const pointsBeforeGuest = room.guestPlayer.points;
        objective.isAchieved = true;
        objective['givePoints']();
        expect(room.hostPlayer.points).equal(pointsBeforeHost);
        expect(room.guestPlayer.points).equal(pointsBeforeGuest);
    });

    it('givePoints should give points if objective not achieved and currentPlayer is an owner', () => {
        const points = 5;
        objective.points = points;
        Object.defineProperty(objective, 'currentOwner', {
            get() {
                return { name: room.hostPlayer.name };
            },
        });
        Object.defineProperty(objective, 'currentPlayer', {
            get() {
                return room.hostPlayer;
            },
        });
        const pointsExpectedHost = points;
        const pointsBeforeGuest = room.guestPlayer.points;
        objective['givePoints']();
        expect(room.hostPlayer.points).equal(pointsExpectedHost);
        expect(room.guestPlayer.points).equal(pointsBeforeGuest);
    });

    it('currentOwner getter should return the owner corresponding to the currentPlayer', () => {
        Object.defineProperty(objective, 'currentPlayer', {
            get() {
                return room.hostPlayer;
            },
        });
        const currentOwner = objective['currentOwner'];
        expect(currentOwner).equal(objective.owners[0]);
    });

    it('currentOwner getter should return the owner corresponding to the currentPlayer', () => {
        Object.defineProperty(objective, 'currentPlayer', {
            get() {
                return room.guestPlayer;
            },
        });
        const currentOwner = objective['currentOwner'];
        expect(currentOwner).equal(objective.owners[1]);
    });

    it('currentOwner getter should return the undefined if no owner exist for the currentPlayer', () => {
        Object.defineProperty(objective, 'currentPlayer', {
            get() {
                return { ...playerOne, name: 'Bob' };
            },
        });
        const currentOwner = objective['currentOwner'];
        expect(currentOwner).equal(undefined);
    });

    it('currentPlayer getter should return the hostPlayer if it is its turn', () => {
        room.hostPlayer.isTurn = true;
        const currentPlayer = objective['currentPlayer'];
        expect(currentPlayer).equal(room.hostPlayer);
    });

    it('currentPlayer getter should return the guestPlayer if it is its turn', () => {
        room.hostPlayer.isTurn = false;
        const currentPlayer = objective['currentPlayer'];
        expect(currentPlayer).equal(room.guestPlayer);
    });
});
