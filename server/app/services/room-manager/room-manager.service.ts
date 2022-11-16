import { EMPTY_ROOM } from '@app/classes/constants/room';
import { Room } from '@app/classes/interfaces/room';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { Tools } from '@app/classes/tools/tools';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GamesHistoryService } from '@app/services/games-history/games-history.service';
import { HighScoresService } from '@app/services/high-scores/high-scores.service';
import { PlayerManagerService } from '@app/services/player-manager/player-manager.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { MINIMUM_LETTERS_FOR_EXCHANGE } from '@common/constants/reserve-constant';
import { FROM_SYSTEM } from '@common/constants/room-constants';
import { CommandType, GameState } from '@common/enums/enums';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
import { Command, ExchangeCommand, PlaceCommand } from '@common/interfaces/command-interface';
import { RoomClient } from '@common/interfaces/room';
import { RoomMessage } from '@common/interfaces/room-message';
import * as io from 'socket.io';
import { Service } from 'typedi';

const NUMBER_LENGTH_FOR_KEY = 36;
const BEGIN_SUBSTRING_NUMBER = 2;
const KEY_SIZE = 9;
const VIRTUAL_PLAYER_RESPONSE = 3000;
@Service()
export class RoomManager {
    rooms: Map<string, Room> = new Map<string, Room>();
    timer: number;
    sio: io.Server;
    private virtualPlayerResponse: number = VIRTUAL_PLAYER_RESPONSE;

    constructor(
        private gameManager: GameManagerService,
        private highScoresService: HighScoresService,
        private virtualPlayer: VirtualPlayerService,
        private playerManager: PlayerManagerService,
        private gamesHistoryService: GamesHistoryService,
    ) {}

    createRoom(): Room {
        let roomKey = this.generateRoomKey();
        while (this.rooms.has(roomKey)) {
            roomKey = this.generateRoomKey();
        }
        const room: Room = JSON.parse(JSON.stringify(EMPTY_ROOM));
        room.key = roomKey;
        this.rooms.set(room.key, room);
        this.listAvailableRooms();
        return room;
    }

    deleteRoom(roomKey: string): boolean {
        return this.rooms.delete(roomKey);
    }

    listAvailableRooms(): RoomClient[] {
        const availableRooms: RoomClient[] = [];
        for (const room of this.rooms.values()) {
            if (this.isAvailable(room)) {
                availableRooms.push(Tools.convertToRoomClient(room));
            }
        }
        return availableRooms;
    }

    getRoom(socket: io.Socket): string {
        for (const room of this.rooms.values()) {
            const playerIsConnected = room.guestPlayer.socketId === socket.id || room.hostPlayer.socketId === socket.id;
            if (playerIsConnected) {
                this.emitEventToRoom('updateRoom', room.key, socket, Tools.convertToRoomClient(room));
                return room.key;
            }
        }
        return '';
    }

    sendToRoom(roomMessage: RoomMessage, socket: io.Socket): void {
        this.emitEventToRoom('roomMessage', roomMessage.roomKey, socket, roomMessage);
    }

    async startGame(room: Room): Promise<void> {
        if (room.gameOptions.singlePlayer)
            room.guestPlayer.name = await this.virtualPlayer.getVirtualPlayerName(room.hostPlayer.name, room.gameOptions.aiDifficulty);
        this.gameManager.initializeRoom(room);
        this.rooms.set(room.key, room);
        if (this.shouldGuestStart()) this.changeTurn(room);
        this.sio.to(room.key).emit('gameAccepted', Tools.convertToRoomClient(room));
    }

    playTurn(command: PlaceCommand, roomKey: string): void {
        const room = this.getRoomFromKey(roomKey);
        const previousHostPoints = room.hostPlayer.points;
        const previousGuestPoints = room.guestPlayer.points;
        this.gameManager.playTurn(command, room);
        if (room.guestPlayer.points !== previousGuestPoints || room.hostPlayer.points !== previousHostPoints) {
            room.nbSkippedTurns = 0;
            this.sio
                .to(room.key)
                .emit(
                    'roomMessage',
                    Tools.buildRoomMessage(
                        command.commandType +
                            ' ' +
                            Tools.coordinatesToString(command.placement) +
                            Tools.orientationToString(command.orientation) +
                            ' ' +
                            command.lettersToPlace,
                        room.key,
                        command.senderName,
                    ),
                );
            const pointsMadeThisTurn =
                room.hostPlayer.points !== previousHostPoints
                    ? room.hostPlayer.points - previousHostPoints
                    : room.guestPlayer.points - previousGuestPoints;
            this.sio
                .to(room.key)
                .emit(
                    'roomMessage',
                    Tools.buildSystemRoomMessage(
                        command.senderName +
                            ' a obtenu ' +
                            pointsMadeThisTurn +
                            ` point${pointsMadeThisTurn > 1 ? 's' : ''} pour son placement réussi.`,
                        room.key,
                    ),
                );
        } else {
            if (room.skipEvent.observed) room.skipEvent.next();

            this.sio
                .to(room.key)
                .emit('roomMessage', Tools.buildSystemRoomMessage('la commande entrée par ' + command.senderName + ' est invalide', room.key));
        }
        this.changeTurn(room);
    }

    getHint(socket: io.Socket, room: Room): void {
        const currentPlayerRack = room.hostPlayer.socketId === socket.id ? room.hostPlayer.rack : room.guestPlayer.rack;
        const currentPlayerName = room.hostPlayer.socketId === socket.id ? room.hostPlayer.name : room.guestPlayer.name;
        socket.emit('roomMessage', Tools.buildRoomMessage(CommandType.Hint, room.key, currentPlayerName));
        socket.emit('hintCommand', this.virtualPlayer.generateHints(room.board, currentPlayerRack));
    }

    exchange(command: ExchangeCommand, roomKey: string): void {
        const room = this.getRoomFromKey(roomKey);
        let exchangeSuccessful = false;
        if (this.gameManager.exchangeLetters(room, command.letters)) {
            room.nbSkippedTurns = 0;
            exchangeSuccessful = true;
        } else if (room.skipEvent.observed) room.skipEvent.next();

        this.changeTurn(room);

        const failureReason =
            room.reserve.nbOfLetters < MINIMUM_LETTERS_FOR_EXCHANGE
                ? 'la réserve ne contient plus assez de lettres pour permettre les échanges'
                : "au moins une d'entre elles ne figurait pas dans son chevalet.";

        const currentPlayerSocketId = room.hostPlayer.name === command.senderName ? room.hostPlayer.socketId : room.guestPlayer.socketId;
        const otherPlayerSocketId = room.hostPlayer.name === command.senderName ? room.guestPlayer.socketId : room.hostPlayer.socketId;
        this.sio
            .to(currentPlayerSocketId)
            .emit('roomMessage', Tools.buildRoomMessage(command.commandType + ' ' + command.letters, room.key, command.senderName));

        const resultMessage = exchangeSuccessful
            ? command.senderName + ' a échangé ' + command.letters.length + ` lettre${command.letters.length > 1 ? 's' : ''}.`
            : command.senderName +
              " a essayé d'échanger " +
              command.letters.length +
              ` lettre${command.letters.length > 1 ? 's' : ''}, mais ` +
              failureReason;

        this.sio.to(otherPlayerSocketId).emit('roomMessage', Tools.buildSystemRoomMessage(resultMessage, room.key));

        const currentPlayerResultMessage: string = exchangeSuccessful
            ? command.senderName + ` a échangé ${command.letters.length > 1 ? 'les lettres suivantes' : 'la lettre suivante'} : ` + command.letters
            : command.senderName +
              ` a essayé d'échanger ${command.letters.length > 1 ? 'les lettres suivantes' : 'la lettre suivante'} : ` +
              command.letters +
              ', mais ' +
              failureReason;
        this.sio.to(currentPlayerSocketId).emit('roomMessage', Tools.buildSystemRoomMessage(currentPlayerResultMessage, room.key));
    }

    handleTimer(room: Room): void {
        if (room.gameState === GameState.GameAccepted) {
            if (room.timer > 0) {
                room.timer--;
            } else {
                room.timer = room.gameOptions.turnDuration;
                this.skipTurn(room.key);
            }
            this.rooms.set(room.key, room);
            this.sio.to(room.key).emit('timer', room.timer);
        }
    }

    skipTurn(roomKey: string): void {
        const room = this.getRoomFromKey(roomKey);
        room.nbSkippedTurns++;
        const skipName = this.gameManager.isHostPlayerTurn(room) ? room.hostPlayer.name : room.guestPlayer.name;
        this.sio.to(room.key).emit('roomMessage', Tools.buildSystemRoomMessage(skipName + ' a passé son tour.', room.key));

        if (room.skipEvent.observed) room.skipEvent.next();
        this.changeTurn(room);
    }

    getRoomFromKey(key: string): Room {
        const room = this.rooms.get(key);
        if (room) return room;
        else throw Error('There is no room for specified key (' + key + ').');
    }

    getAvailableRoom(key: string): Room {
        const room = this.getRoomFromKey(key);
        if (this.isAvailable(room)) return room;
        else throw Error('Room with specified key (' + key + ') is not available.');
    }

    isAvailable(room: Room): boolean {
        return room.guestPlayer.socketId === '' && !room.gameOptions.singlePlayer;
    }

    async convertGameToSolo(room: Room): Promise<void> {
        this.playerManager.setHost(room);
        room.gameOptions.aiDifficulty = AiDifficulty.BEGINNER;
        room.gameOptions.singlePlayer = true;
        room.guestPlayer.name = await this.virtualPlayer.getVirtualPlayerName(room.hostPlayer.name, room.gameOptions.aiDifficulty);
        for (const objective of room.objectives) (objective as AbstractObjective).updateOwnerName();
        this.sio.to(room.key).emit('updateRoom', Tools.convertToRoomClient(room));
        this.rooms.set(room.key, room);
        this.sio.to(room.key).emit('roomMessage', Tools.buildRoomMessage(room.guestPlayer.name + ' has joined the game', room.key, FROM_SYSTEM));
        setTimeout(async () => {
            if (room.gameOptions.singlePlayer && room.guestPlayer.isTurn) {
                await this.playVirtualPlayerTurn(room);
            }
        }, this.virtualPlayerResponse);
    }

    handleAbandon(roomKey: string): void {
        try {
            const room = this.getRoomFromKey(roomKey);
            if (room.gameState === GameState.GameOver) return;
            if (!room.gameOptions.singlePlayer) {
                this.convertGameToSolo(room);
                return;
            }
            this.gameManager.endGamePointsUpdate(room);
            this.handleGameEnd(room);
        } catch {
            return;
        }
    }

    private async playVirtualPlayerTurn(room: Room): Promise<void> {
        const command: Command = await this.virtualPlayer.getVirtualPlayerCommand(
            room.board,
            room.guestPlayer.rack,
            room.gameOptions.aiDifficulty,
            room.reserve.nbOfLetters,
        );
        command.senderName = room.guestPlayer.name;
        if (command.commandType === CommandType.Place) {
            this.playTurn(command as PlaceCommand, room.key);
            return;
        }
        if (command.commandType === CommandType.Exchange) {
            this.exchange(command as ExchangeCommand, room.key);
            return;
        }
        this.skipTurn(room.key);
        return;
    }

    private changeTurn(room: Room): void {
        this.gameManager.nextTurnInitialization(room);
        this.rooms.set(room.key, room);
        if (room.gameState === GameState.GameOver) {
            this.handleGameEnd(room);
            return;
        }
        this.sio.to(room.key).emit('turnChanged', Tools.convertToRoomClient(room));
        setTimeout(async () => {
            if (room.gameOptions.singlePlayer && room.guestPlayer.isTurn) {
                await this.playVirtualPlayerTurn(room);
            }
        }, this.virtualPlayerResponse);
    }

    private generateRoomKey(): string {
        return Math.random().toString(NUMBER_LENGTH_FOR_KEY).substr(BEGIN_SUBSTRING_NUMBER, KEY_SIZE);
    }

    private emitEventToRoom<T>(event: string, roomKey: string, socket: io.Socket, data?: T): void {
        const roomSockets = this.sio.sockets.adapter.rooms.get(roomKey);
        if (roomSockets?.has(socket.id)) this.sio.to(roomKey).emit(event, data);
    }

    private handleGameEndMessage(room: Room): void {
        this.sio.to(room.key).emit('roomMessage', Tools.buildSystemRoomMessage(this.gameManager.finalGameResults(room), room.key));
    }

    private handleGameEnd(room: Room): void {
        this.gamesHistoryService.extractGameHistory(room);
        this.highScoresService.extractHighScoreFromRoom(room);
        this.handleGameEndMessage(room);
        room.gameState = GameState.GameOver;
        this.sio.to(room.key).emit('gameOver', Tools.convertToRoomClient(room));
        this.rooms.set(room.key, room);
    }

    private shouldGuestStart(): boolean {
        return Math.floor(Math.random() * 2) > 0;
    }
}
