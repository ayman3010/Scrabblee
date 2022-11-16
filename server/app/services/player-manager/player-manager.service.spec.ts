import { EMPTY_ROOM } from '@app/classes/constants/room';
import { Room } from '@app/classes/interfaces/room';
import { DEFAULT_PLAYER } from '@common/constants/room-constants';
import { expect } from 'chai';
import { PlayerManagerService } from './player-manager.service';

describe('playerManager Service Tests', () => {
    let playerService: PlayerManagerService;
    let room: Room;

    const playerName = 'John Scrabble';
    const socketId = 'socketId';

    before(() => {
        room = { ...EMPTY_ROOM };
        playerService = new PlayerManagerService();
    });

    it('setHost should change hostPlayer if there is no host in the room', () => {
        const expectedPlayer = { ...DEFAULT_PLAYER };
        expectedPlayer.name = playerName;
        expectedPlayer.socketId = socketId;
        playerService.addPlayer(playerName, socketId, room);
        expect(room.hostPlayer.name).equal(expectedPlayer.name);
        expect(room.hostPlayer.socketId).equal(expectedPlayer.socketId);
    });

    it('setHost should change hostPlayer if the original host abandoned', () => {
        const guestName = room.guestPlayer.name;
        room.hostPlayer.abandoned = true;
        playerService.setHost(room);
        expect(room.hostPlayer.name).equal(guestName);
    });

    it('setHost should not change hostPlayer if the host did not abandon', () => {
        const guestName = room.guestPlayer.name;
        room.hostPlayer.abandoned = false;
        playerService.setHost(room);
        expect(room.hostPlayer.name).not.equal(guestName);
    });
    it('addPlayer should change guestPlayer if there is a host in the room', () => {
        const expectedPlayer = { ...DEFAULT_PLAYER };
        expectedPlayer.name = playerName;
        expectedPlayer.socketId = socketId;
        room.hostPlayer = expectedPlayer;
        playerService.addPlayer(playerName, socketId, room);
        expect(room.guestPlayer.name).equal(expectedPlayer.name);
        expect(room.guestPlayer.socketId).equal(expectedPlayer.socketId);
    });

    it('removeGuest should change guestPlayer to DEFAULT_PLAYER', () => {
        const expectedPlayer = { ...DEFAULT_PLAYER };
        playerService.removeGuest(room);
        expect(room.guestPlayer.name).equal(expectedPlayer.name);
        expect(room.guestPlayer.socketId).equal(expectedPlayer.socketId);
    });

    it("playerAbandoned should only set the hostPlayer's abandoned to true if they are the one that abandons", () => {
        room.hostPlayer = { ...DEFAULT_PLAYER };
        room.hostPlayer.socketId = 'john';
        room.hostPlayer.abandoned = false;
        room.guestPlayer = { ...DEFAULT_PLAYER };
        room.guestPlayer.socketId = 'jane';
        room.guestPlayer.abandoned = false;

        playerService.playerAbandoned(room, 'john');

        expect(room.hostPlayer.abandoned).equal(true);
        expect(room.guestPlayer.abandoned).equal(false);
    });

    it("playerAbandoned should only set the guestPlayer's abandoned to true if they are the one that abandons", () => {
        room.hostPlayer = { ...DEFAULT_PLAYER };
        room.hostPlayer.socketId = 'john';
        room.hostPlayer.abandoned = false;
        room.guestPlayer = { ...DEFAULT_PLAYER };
        room.guestPlayer.socketId = 'jane';
        room.guestPlayer.abandoned = false;

        playerService.playerAbandoned(room, 'jane');

        expect(room.hostPlayer.abandoned).equal(false);
        expect(room.guestPlayer.abandoned).equal(true);
    });

    it('reconnectPlayer should change hostPlayer and not guestPlayer if the person trying to reconnect is the host', () => {
        const hostName = 'John Scrabble';
        const guestName = 'Jane Scrabble';
        const initialHost = { ...DEFAULT_PLAYER, name: hostName, socketId: '69' };
        const initialGuest = { ...DEFAULT_PLAYER, name: guestName, socketId: '420' };
        room.hostPlayer = initialHost;
        room.guestPlayer = initialGuest;
        const newSocketId = '42069';
        const newHost = { ...initialHost, socketId: newSocketId };
        playerService.reconnectPlayer(hostName, newSocketId, room);
        expect(room.hostPlayer).eql(newHost);
        expect(room.guestPlayer).eql(initialGuest);
    });

    it('reconnectPlayer should change guestPlayer and not hostPlayer if the person trying to reconnect is the guest', () => {
        const hostName = 'John Scrabble';
        const guestName = 'Jane Scrabble';
        const initialHost = { ...DEFAULT_PLAYER, name: hostName, socketId: '69' };
        const initialGuest = { ...DEFAULT_PLAYER, name: guestName, socketId: '420' };
        room.hostPlayer = initialHost;
        room.guestPlayer = initialGuest;
        const newSocketId = '42069';
        const newGuest = { ...initialGuest, socketId: newSocketId };
        playerService.reconnectPlayer(guestName, newSocketId, room);
        expect(room.hostPlayer).eql(initialHost);
        expect(room.guestPlayer).eql(newGuest);
    });

    it('reconnectPlayer should not change hostPlayer nor guestPlayer if the person trying to reconnect was not in the game originally', () => {
        const hostName = 'John Scrabble';
        const guestName = 'Jane Scrabble';
        const initialHost = { ...DEFAULT_PLAYER, name: hostName, socketId: '69' };
        const initialGuest = { ...DEFAULT_PLAYER, name: guestName, socketId: '420' };
        room.hostPlayer = initialHost;
        room.guestPlayer = initialGuest;
        const newSocketId = '42069';
        const fakePlayerName = 'Johnny Scrabble';
        expect(() => playerService.reconnectPlayer(fakePlayerName, newSocketId, room)).to.throw(
            'Tried to reconnect a player to a room when they were not in the room originally',
        );
        expect(room.hostPlayer).eql(initialHost);
        expect(room.guestPlayer).eql(initialGuest);
    });
});
