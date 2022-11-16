import { Room } from '@app/classes/interfaces/room';
import { DEFAULT_PLAYER } from '@common/constants/room-constants';
import { GameState } from '@common/enums/enums';
import { Service } from 'typedi';

@Service()
export class PlayerManagerService {
    addPlayer(name: string, socketId: string, room: Room): void {
        const player = JSON.parse(JSON.stringify(DEFAULT_PLAYER));
        player.name = name;
        player.socketId = socketId;
        if (room.hostPlayer.socketId === '') room.hostPlayer = player;
        else {
            room.guestPlayer = player;
            room.gameState = GameState.GuestJoined;
        }
    }

    reconnectPlayer(name: string, socketId: string, room: Room): void {
        if (room.hostPlayer.name === name) room.hostPlayer.socketId = socketId;
        else if (room.guestPlayer.name === name) room.guestPlayer.socketId = socketId;
        else throw Error('Tried to reconnect a player to a room when they were not in the room originally.');
    }

    removeGuest(room: Room): void {
        room.guestPlayer = JSON.parse(JSON.stringify(DEFAULT_PLAYER));
        room.gameState = GameState.GameRefused;
    }

    setHost(room: Room): void {
        if (room.hostPlayer.abandoned) {
            const hostPlayer = JSON.parse(JSON.stringify(room.hostPlayer));
            room.hostPlayer = JSON.parse(JSON.stringify(room.guestPlayer));
            room.guestPlayer = JSON.parse(JSON.stringify(hostPlayer));
            room.guestPlayer.isTurn = !room.hostPlayer.isTurn;
        }
    }

    playerAbandoned(room: Room, socketId: string): void {
        if (room.hostPlayer.socketId === socketId) room.hostPlayer.abandoned = true;
        if (room.guestPlayer.socketId === socketId) room.guestPlayer.abandoned = true;
    }
}
