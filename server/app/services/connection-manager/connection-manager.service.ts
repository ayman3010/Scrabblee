import { Room } from '@app/classes/interfaces/room';
import { Tools } from '@app/classes/tools/tools';
import { PlayerManagerService } from '@app/services/player-manager/player-manager.service';
import { RoomManager } from '@app/services/room-manager/room-manager.service';
import { GameOptions } from '@common/interfaces/game-options';
import { RoomClient } from '@common/interfaces/room';
import * as io from 'socket.io';
import { Service } from 'typedi';

const ONE_PLAYER = 1;
const TWO_PLAYERS = 2;

@Service()
export class ConnectionManagerService {
    constructor(private playerService: PlayerManagerService, private roomManager: RoomManager) {}

    createRoom(socket: io.Socket, roomCreatorName: string, gameOptions: GameOptions): Room {
        const room = this.roomManager.createRoom();
        room.gameOptions = { ...gameOptions };

        this.playerService.addPlayer(roomCreatorName, socket.id, room);
        socket.join(room.key);
        return room;
    }

    deleteRoom(socket: io.Socket, roomKey: string): void {
        this.roomManager.deleteRoom(roomKey);
        socket.to(roomKey).disconnectSockets();
        socket.leave(roomKey);
    }

    joinRoom(socket: io.Socket, joinerName: string, roomKey: string): boolean {
        try {
            const room = this.roomManager.getAvailableRoom(roomKey);
            this.playerService.addPlayer(joinerName, socket.id, room);
            socket.join(room.key);
            return true;
        } catch {
            return false;
        }
    }

    rejoinRoom(socket: io.Socket, joinerName: string, roomKey: string): boolean {
        try {
            const room = this.roomManager.getRoomFromKey(roomKey);
            socket.join(roomKey);
            this.playerService.reconnectPlayer(joinerName, socket.id, room);
            socket.emit('roomRejoined', Tools.convertToRoomClient(room));
            return true;
        } catch {
            socket.emit('roomRejoined', undefined);
            return false;
        }
    }

    kickGuest(socket: io.Socket, roomKey: string): boolean {
        try {
            const room = this.roomManager.getRoomFromKey(roomKey);
            socket.to(roomKey).socketsLeave(room.guestPlayer.socketId);
            this.playerService.removeGuest(room);
            return true;
        } catch {
            return false;
        }
    }

    shouldDisconnect(socketRoomSize: number, room: Room): boolean {
        return (socketRoomSize < TWO_PLAYERS && !room.gameOptions.singlePlayer) || (socketRoomSize < ONE_PLAYER && room.gameOptions.singlePlayer);
    }

    disconnectFromRoom(socket: io.Socket, roomKey: string): boolean {
        try {
            const room = this.roomManager.getRoomFromKey(roomKey);
            this.playerService.playerAbandoned(room, socket.id);
            socket.leave(roomKey);
            return true;
        } catch {
            return false;
        }
    }

    listAvailableRooms(): RoomClient[] {
        return this.roomManager.listAvailableRooms();
    }
}
