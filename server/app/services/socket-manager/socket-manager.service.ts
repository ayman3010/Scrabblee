import { Room } from '@app/classes/interfaces/room';
import { Tools } from '@app/classes/tools/tools';
import { ConnectionManagerService } from '@app/services/connection-manager/connection-manager.service';
import { RoomManager } from '@app/services/room-manager/room-manager.service';
import { CommandType, GameState } from '@common/enums/enums';
import { Command, ExchangeCommand, PlaceCommand } from '@common/interfaces/command-interface';
import { GameOptions } from '@common/interfaces/game-options';
import { ReconnectionInfo } from '@common/interfaces/reconnection';
import { RoomClient } from '@common/interfaces/room';
import { RoomMessage } from '@common/interfaces/room-message';
import * as http from 'http';
import * as io from 'socket.io';
import { Service } from 'typedi';

const SERVER_RESPONSE_TIME = 1000;
const CREATION_DELAY = 100;
const RECONNECTION_MAX_TIME = 5000;
@Service()
export class SocketManager {
    private sio: io.Server;
    private reconnectionMaxTime = RECONNECTION_MAX_TIME;

    constructor(private roomManager: RoomManager, private connectionService: ConnectionManagerService) {}

    initServer(server: http.Server): void {
        this.sio = new io.Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] } });
        this.roomManager.sio = this.sio;
    }

    handleSockets(): void {
        this.sio.on('connection', (socket) => {
            socket.on('createRoom', (object: { creatorName: string; gameOptions: GameOptions }) => {
                const room = this.connectionService.createRoom(socket, object.creatorName, object.gameOptions);
                socket.emit('updateRoom', Tools.convertToRoomClient(room));
                this.updateAvailableRooms();
                if (room.gameOptions.singlePlayer) {
                    setTimeout(() => {
                        this.roomManager.startGame(room);
                    }, CREATION_DELAY);
                }
            });

            socket.on('joinRoom', (room: RoomClient) => {
                const guestName = room.guestPlayer.name;
                if (this.connectionService.joinRoom(socket, guestName, room.key)) {
                    const roomUpdated = this.roomManager.getRoomFromKey(room.key);
                    this.sio.to(room.key).emit('updateRoom', Tools.convertToRoomClient(roomUpdated));
                } else socket.emit('connectionError');
                this.updateAvailableRooms();
            });

            socket.on('rejoinRoom', (info: ReconnectionInfo) => {
                if (this.connectionService.rejoinRoom(socket, info.playerName, info.roomKey)) {
                    const roomUpdated = this.roomManager.getRoomFromKey(info.roomKey);
                    this.sio.to(info.roomKey).emit('updateRoom', Tools.convertToRoomClient(roomUpdated));
                } else socket.emit('connectionError');
            });

            socket.on('listAvailableRooms', () => {
                this.updateAvailableRooms();
            });

            socket.on('roomMessage', (roomMessage: RoomMessage) => {
                this.roomManager.sendToRoom(roomMessage, socket);
            });

            socket.on('abandonGame', (leavingMessage: RoomMessage) => {
                this.roomManager.sendToRoom(leavingMessage, socket);
                this.connectionService.disconnectFromRoom(socket, leavingMessage.roomKey);
                this.roomManager.handleAbandon(leavingMessage.roomKey);
            });

            socket.on('getRoom', () => {
                this.roomManager.getRoom(socket);
            });

            socket.on('skipTurn', (room: RoomClient) => {
                this.roomManager.skipTurn(room.key);
            });

            socket.on('startGame', (room: RoomClient) => {
                this.roomManager.startGame(room as Room);
            });

            socket.on('refuseGame', (room: RoomClient) => {
                if (this.connectionService.kickGuest(socket, room.key)) {
                    const roomUpdated = this.roomManager.getRoomFromKey(room.key);
                    this.sio.to(room.key).emit('updateRoom', Tools.convertToRoomClient(roomUpdated));
                    roomUpdated.gameState = GameState.WaitingForGuest;
                } else socket.emit('disconnectionError');
                this.updateAvailableRooms();
            });

            socket.on('abandonWaiting', (room) => {
                if (room) {
                    room.gameState = GameState.GameAbandoned;
                    this.sio.to(room.key).emit('playerDisconnected', Tools.convertToRoomClient(room));
                    this.connectionService.deleteRoom(socket, room.key);
                    this.updateAvailableRooms();
                }
            });

            socket.on('sendCommand', (object: { room: RoomClient; command: Command }) => {
                switch (object.command.commandType) {
                    case CommandType.Place: {
                        this.roomManager.playTurn(object.command as PlaceCommand, object.room.key);
                        break;
                    }
                    case CommandType.Exchange: {
                        this.roomManager.exchange(object.command as ExchangeCommand, object.room.key);
                        break;
                    }
                    case CommandType.Hint: {
                        this.roomManager.getHint(socket, object.room as Room);
                        break;
                    }
                }
            });

            socket.on('disconnect', () => {
                setTimeout(() => {
                    try {
                        const socketRoomKey = this.roomManager.getRoom(socket);
                        const room = this.roomManager.getRoomFromKey(socketRoomKey);
                        const socketRoom = this.sio.sockets.adapter.rooms.get(socketRoomKey);
                        let socketRoomSize = 0;
                        if (socketRoom) socketRoomSize = socketRoom.size;
                        if (this.connectionService.shouldDisconnect(socketRoomSize, room)) {
                            this.connectionService.disconnectFromRoom(socket, socketRoomKey);
                            this.roomManager.handleAbandon(socketRoomKey);
                        }
                        if (socketRoomSize < 1) {
                            this.connectionService.deleteRoom(socket, socketRoomKey);
                        }
                    } catch {
                        return;
                    }
                }, this.reconnectionMaxTime);
            });
        });

        setInterval(() => {
            for (const room of this.roomManager.rooms.values()) {
                this.roomManager.handleTimer(room);
            }
        }, SERVER_RESPONSE_TIME);
    }

    private updateAvailableRooms(): void {
        this.sio.emit('listOfAvailableRooms', this.connectionService.listAvailableRooms());
    }
}
