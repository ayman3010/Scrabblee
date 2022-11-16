import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { TO_GAME, TO_HOME } from '@app/classes/constants/routing-constants';
import { Tools } from '@app/classes/tools/tools';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { DEFAULT_PLAYER } from '@common/constants/room-constants';
import { GameState } from '@common/enums/enums';
import { Letter, Tile } from '@common/interfaces/board-interface';
import { GameOptions } from '@common/interfaces/game-options';
import { Player } from '@common/interfaces/player';
import { Rack } from '@common/interfaces/rack-interface';
import { ReconnectionInfo } from '@common/interfaces/reconnection';
import { RoomClient } from '@common/interfaces/room';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class GameManagerService {
    availableRooms: RoomClient[];
    availableRoomsEvent: Subject<RoomClient[]>;
    currentRoom: RoomClient;
    boardEvent: Subject<Tile[][]>;
    rackEvent: Subject<Letter[]>;
    roomEvent: Subject<RoomClient>;
    gameStateUpdate: Subject<GameState>;
    playerId: string;

    constructor(public socketService: SocketClientService, private router: Router) {
        this.boardEvent = new Subject<Tile[][]>();
        this.rackEvent = new Subject<Letter[]>();
        this.roomEvent = new Subject<RoomClient>();
        this.availableRoomsEvent = new Subject<RoomClient[]>();
        this.gameStateUpdate = new Subject<GameState>();
        this.availableRooms = [];
        this.socketService.connect();
    }

    abandonWaiting(): void {
        this.socketService.send('abandonWaiting', this.currentRoom);
        this.socketService.disconnect();
    }

    connectPlayer(): void {
        if (!this.socketService.isSocketAlive()) {
            this.socketService.connect();
            if (this.router.url === TO_GAME) this.reconnectPlayer();
        }
    }

    reconnectPlayer(): void {
        const previousRoomKey = sessionStorage.getItem('roomKey');
        const previousName = sessionStorage.getItem('playerName');
        if (previousRoomKey && previousName) {
            this.rejoinRoom({ roomKey: previousRoomKey, playerName: previousName });
            this.socketHandler();
            this.socketService.on('roomRejoined', (updatedRoom: RoomClient) => {
                if (!updatedRoom) {
                    sessionStorage.removeItem('roomKey');
                    sessionStorage.removeItem('playerName');
                    return;
                }
                this.currentRoom = updatedRoom;
                this.playerId = this.socketService.socketID;
                this.roomEvent.next(this.currentRoom);
                this.boardEvent.next(this.currentRoom.board.content);
                this.rackEvent.next(this.buildLetters(this.rack));
            });
        }
    }

    getRoom(): void {
        this.socketService.send('getRoom');
    }

    listAvailableRooms(): void {
        this.socketService.send('listAvailableRooms');
    }

    acceptGame(room: RoomClient): void {
        this.socketService.send('startGame', room);
    }

    refuseGame(room: RoomClient): void {
        this.socketService.send('refuseGame', room);
    }

    leaveWaitingRoom(room: RoomClient): void {
        this.socketService.send('refuseGame', room);
        this.router.navigate([TO_HOME]);
    }

    abandonGame(name: string): void {
        this.socketService.send('abandonGame', Tools.buildSystemRoomMessage(name + ' a quitté la partie.', this.currentRoom.key));
        this.socketService.disconnect();
        this.router.navigate([TO_HOME]);
    }

    disconnect(): void {
        this.socketService.disconnect();
    }

    createRoom(creatorName: string, gameOptions: GameOptions): void {
        sessionStorage.setItem('playerName', creatorName);
        this.socketService.send('createRoom', { creatorName, gameOptions });
    }

    joinRoom(room: RoomClient, playerName: string): void {
        sessionStorage.setItem('playerName', playerName);
        this.socketService.send('joinRoom', room);
    }

    rejoinRoom(info: ReconnectionInfo): void {
        sessionStorage.setItem('playerName', info.playerName);
        this.socketService.send('rejoinRoom', info);
    }

    reinitializeGame(): void {
        if (this.currentRoom) {
            this.currentRoom.hostPlayer = { ...DEFAULT_PLAYER };
            this.currentRoom.guestPlayer = { ...DEFAULT_PLAYER };
            this.currentRoom.gameState = GameState.WaitingForGuest;
        }
        this.router.navigate([TO_HOME]);
    }

    socketHandler(): void {
        this.socketService.on('listOfAvailableRooms', (roomsFromServer: RoomClient[]) => {
            this.availableRooms = roomsFromServer;
            this.availableRoomsEvent.next(roomsFromServer);
        });

        this.socketService.on('updateRoom', (room: RoomClient) => {
            this.currentRoom = room;
            this.roomEvent.next(this.currentRoom);
            this.gameStateUpdate.next(room.gameState);
        });

        this.socketService.on('gameAccepted', async (room: RoomClient) => {
            this.playerId = this.socketService.socketID ? this.socketService.socketID : '';
            this.currentRoom = room;
            this.gameStateUpdate.next(room.gameState);
            await this.router.navigate([TO_GAME]);
            sessionStorage.setItem('roomKey', room.key);
            this.rackEvent.next(this.buildLetters(this.rack));
            this.roomEvent.next(this.currentRoom);
        });

        this.socketService.on('turnChanged', (room: RoomClient) => {
            this.currentRoom = room;
            this.boardEvent.next(room.board.content);
            this.roomEvent.next(room);
            this.rackEvent.next(this.buildLetters(this.rack));
        });

        this.socketService.on('gameOver', (room: RoomClient) => {
            this.currentRoom = room;
            this.roomEvent.next(room);
            this.boardEvent.next(room.board.content);
            this.rackEvent.next(this.buildLetters(this.rack));
        });
    }

    buildLetters(rack: Rack): Letter[] {
        const rackLetters: Letter[] = [];
        for (const rackLetter of rack.content) {
            rackLetters.push({ letter: rackLetter.letter.toUpperCase(), value: rackLetter.value });
        }
        return rackLetters;
    }

    get rack(): Rack {
        return this.currentPlayer.rack;
    }

    get isTurn(): boolean {
        return this.currentPlayer.isTurn;
    }

    get currentPlayer(): Player {
        return this.playerId === this.currentRoom.hostPlayer.socketId ? this.currentRoom.hostPlayer : this.currentRoom.guestPlayer;
    }

    get reserveSize(): number {
        return this.currentRoom.reserve.nbOfLetters;
    }
}
