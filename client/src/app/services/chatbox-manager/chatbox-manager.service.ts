import { Injectable } from '@angular/core';
import { HELP_TEXT } from '@app/classes/constants/feed-back-message';
import { Tools } from '@app/classes/tools/tools';
import { CommandHandlerService } from '@app/services/command-handler/command-handler.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { FROM_SYSTEM, SYSTEM_MESSAGE_COLOR } from '@common/constants/room-constants';
import { SECONDS_IN_MINUTE } from '@common/constants/time-constants';
import { CommandType } from '@common/enums/enums';
import { Letter } from '@common/interfaces/board-interface';
import { Command } from '@common/interfaces/command-interface';
import { Player } from '@common/interfaces/player';
import { RoomClient } from '@common/interfaces/room';
import { RoomMessage } from '@common/interfaces/room-message';
import { Subject } from 'rxjs';

export const DEFAULT_ROOM_MESSAGE = {
    value: '',
    roomKey: '',
    color: 'black',
    senderName: '',
};

@Injectable({
    providedIn: 'root',
})
export class ChatboxManagerService {
    playerId: string;
    currentRoom: RoomClient;
    currentPlayer: Player;
    currentMessage: RoomMessage;
    roomMessages: RoomMessage[];
    timer: number;
    messageEvent: Subject<void>;
    timerEvent: Subject<number>;
    roomEvent: Subject<RoomClient>;
    synchronizeRackEvent: Subject<void>;

    constructor(private socketService: SocketClientService, private commandHandler: CommandHandlerService, public gameManager: GameManagerService) {
        this.messageEvent = new Subject<void>();
        this.timerEvent = new Subject<number>();
        this.roomEvent = new Subject<RoomClient>();
        this.synchronizeRackEvent = new Subject();
        this.timer = SECONDS_IN_MINUTE;
        this.roomMessages = [];
        this.gameManager.roomEvent.asObservable().subscribe((newRoom: RoomClient) => {
            this.currentRoom = newRoom;
            this.setPlayerID();
            this.setCurrentPlayer();
            this.roomEvent.next(newRoom);
        });
    }

    init(): void {
        this.roomMessages = [];
        this.setPlayerID();
        this.currentRoom = this.gameManager.currentRoom;
        this.setCurrentPlayer();
    }

    setPlayerID(): void {
        this.playerId = this.socketService.socketID ? this.socketService.socketID : '';
    }

    setCurrentPlayer(): void {
        if (this.currentRoom)
            this.currentPlayer = this.playerId === this.currentRoom.hostPlayer.socketId ? this.currentRoom.hostPlayer : this.currentRoom.guestPlayer;
    }

    skipTurn(): void {
        this.synchronizeRackEvent.next();
        this.socketService.send('skipTurn', this.currentRoom);
    }

    executeCommand(command: Command): void {
        this.synchronizeRackEvent.next();
        if (command.commandType === CommandType.Pass) {
            this.skipTurn();
            this.sendMessage(CommandType.Pass);
            return;
        }
        if (command.commandType === CommandType.Help) {
            this.addMessageToRoom(Tools.buildRoomMessage(CommandType.Help, this.currentRoom.key, this.currentPlayer.name));
            this.addMessageToRoom(Tools.buildSystemRoomMessage(HELP_TEXT, this.currentRoom.key));
            return;
        }
        this.socketService.send('sendCommand', { command, room: this.gameManager.currentRoom });
    }

    addMessageToRoom(roomMessage: RoomMessage): void {
        this.currentMessage = roomMessage;
        this.roomMessages.push(this.currentMessage);
    }

    sendCommand(commandInLine: string): void {
        const commandArguments = commandInLine.split(' ');
        const roomMessage: RoomMessage = { value: '', roomKey: this.currentRoom.key, color: SYSTEM_MESSAGE_COLOR, senderName: FROM_SYSTEM };
        if (commandInLine === CommandType.Reserve.toString()) {
            this.addMessageToRoom(Tools.buildRoomMessage(commandInLine, this.currentRoom.key, this.currentPlayer.name));
            this.addMessageToRoom({ ...roomMessage, value: this.reserve });
            return;
        }
        try {
            if (this.currentPlayer.isTurn || commandArguments[0] === CommandType.Help) {
                this.executeCommand(this.commandHandler.populateCommandObject(commandArguments, this.currentPlayer.name));
            } else throw SyntaxError("Commande impossible à réaliser : Ce n'est pas votre tour!");
        } catch (error) {
            if (error instanceof SyntaxError) {
                roomMessage.value = error.message + ' \n ' + commandInLine;
            } else {
                roomMessage.value = 'Commande impossible à réaliser : Une erreur inattendue est survenu avec ' + commandInLine;
            }
            this.addMessageToRoom(roomMessage);
            return;
        }
    }

    sendMessage(message: string): void {
        const roomMessage: RoomMessage = {
            value: message,
            roomKey: this.currentRoom.key,
            color: '',
            senderName: this.currentPlayer.name,
        };
        this.socketService.send('roomMessage', roomMessage);
    }

    getMessageColor(senderName: string): string {
        return senderName === this.currentPlayer.name ? 'black' : 'blue';
    }

    sendToRoom(message: string): void {
        if (this.commandHandler.isCommand(message)) {
            this.sendCommand(message);
        } else {
            this.sendMessage(message);
        }
    }

    handleSockets(): void {
        this.socketService.on('roomMessage', (roomMessage: RoomMessage) => {
            if (roomMessage.senderName !== FROM_SYSTEM) roomMessage.color = this.getMessageColor(roomMessage.senderName);
            this.addMessageToRoom(roomMessage);
            this.messageEvent.next();
        });

        this.socketService.on('hintCommand', (hintCommands: string[]) => {
            for (const hint of hintCommands) {
                this.addMessageToRoom({ value: hint, roomKey: this.currentRoom.key, color: 'red', senderName: FROM_SYSTEM });
            }
        });

        this.socketService.on('turnChanged', (room: RoomClient) => {
            this.currentRoom = room;
            this.setCurrentPlayer();
            this.roomEvent.next(room);
        });

        this.socketService.on('timer', (timer: number) => {
            this.timer = timer;
            this.timerEvent.next(this.timer);
        });

        this.socketService.on('playerDisconnected', (room: RoomClient) => {
            this.currentRoom = room;
            this.roomEvent.next(room);
        });

        this.socketService.on('gameAccepted', (room: RoomClient) => {
            this.currentRoom = room;
            this.roomEvent.next(room);
        });

        this.socketService.on('updateRoom', (room: RoomClient) => {
            this.currentRoom = room;
        });
    }

    get reserve(): string {
        let reserve = 'Voici le contenu de la réserve:\n';
        for (const letter of this.gameManager.currentRoom.reserve.content) {
            reserve += letter.letter + ' : ' + letter.nbOfCopies + '\n';
        }
        return reserve;
    }

    set rack(rack: Letter[]) {
        const NO_MATCH = -1;
        const newRack = [];
        const rackToCompare: Letter[] = [...this.gameManager.rack.content];
        for (const letter of rack) {
            const isSameLetter = (value: Letter) => value.letter === letter.letter;
            const index = rackToCompare.findIndex(isSameLetter);

            if (index === NO_MATCH) return;

            const letterToAdd = rackToCompare.splice(index, 1)[0];
            newRack.push(letterToAdd);
        }
        newRack.unshift(...rackToCompare);
        this.gameManager.currentPlayer.rack = { content: newRack };
    }
}
