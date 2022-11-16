/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable max-lines */
import { TestBed } from '@angular/core/testing';
import { CommandHandlerService } from '@app/services/command-handler/command-handler.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { SocketTestHelper } from '@app/services/socket-client/socket-client.service.spec';
import { FROM_SYSTEM } from '@common/constants/room-constants';
import { TEST_PLAYER, TEST_ROOM_CLIENT } from '@common/constants/test-room';
import { CommandType, Orientation } from '@common/enums/enums';
import { Letter } from '@common/interfaces/board-interface';
import { Command, PlaceCommand } from '@common/interfaces/command-interface';
import { Player } from '@common/interfaces/player';
import { Rack } from '@common/interfaces/rack-interface';
import { Reserve } from '@common/interfaces/reserve-interface';
import { RoomClient } from '@common/interfaces/room';
import { RoomMessage } from '@common/interfaces/room-message';
import { Subject } from 'rxjs';
import { Socket } from 'socket.io-client';
import { ChatboxManagerService, DEFAULT_ROOM_MESSAGE } from './chatbox-manager.service';

class SocketClientServiceMock extends SocketClientService {
    override connect() {
        return;
    }
}

describe('ChatboxManagerService', () => {
    let service: ChatboxManagerService;
    let commandHandlerServiceSpy: jasmine.SpyObj<CommandHandlerService>;
    let gameManagerServiceStub: Partial<GameManagerService>;
    let currentRoom: RoomClient;
    let socketHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;
    let currentPlayer: Player;
    const roomEvent: Subject<RoomClient> = new Subject<RoomClient>();

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        currentPlayer = JSON.parse(JSON.stringify(TEST_PLAYER));
        commandHandlerServiceSpy = jasmine.createSpyObj('CommandHandlerService', [
            'isValidCommandSyntax',
            'hasAdequateArguments',
            'populateCommandObject',
            'isCommand',
        ]);
        currentRoom = { ...TEST_ROOM_CLIENT };
        gameManagerServiceStub = {
            currentPlayer,
            currentRoom,
            rack: currentPlayer.rack,
            roomEvent,
            reinitializeGame: () => {
                return;
            },
            connectPlayer: () => {
                return;
            },
        };
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: SocketClientService, useValue: socketServiceMock },
                { provide: CommandHandlerService, useValue: commandHandlerServiceSpy },
                { provide: GameManagerService, useValue: gameManagerServiceStub },
            ],
        });
        service = TestBed.inject(ChatboxManagerService);
        service.currentRoom = currentRoom;
        service.handleSockets();
        service.currentPlayer = currentPlayer;
        service.roomMessages = [];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('setPlayer should change currentPlayer to hostPlayer if it is the active player', () => {
        const expectedPlayer = { ...TEST_PLAYER };
        service.playerId = expectedPlayer.socketId;
        service.currentRoom.hostPlayer = expectedPlayer;
        service.setCurrentPlayer();
        expect(service.currentPlayer).toEqual(expectedPlayer);
    });

    it('setPlayer should change currentPlayer to guestPlayer if it is the active player', () => {
        const expectedPlayer = { ...TEST_PLAYER };
        service.playerId = expectedPlayer.socketId;
        service.currentRoom.guestPlayer = expectedPlayer;
        service.setCurrentPlayer();
        expect(service.currentPlayer).toEqual(expectedPlayer);
    });

    it('skipTurn should call send with the skipTurn command and the room', () => {
        const skipTurnCommand = 'skipTurn';
        const spy = spyOn(socketServiceMock, 'send');
        service.skipTurn();
        expect(spy).toHaveBeenCalledWith(skipTurnCommand, service.currentRoom);
    });

    it('executeCommand should call skipTurn if commandType is !passer', () => {
        const command: Command = {
            commandType: CommandType.Pass,
            senderName: 'John Scrabble',
        };
        const spy = spyOn(service, 'skipTurn');
        service.executeCommand(command);
        expect(spy).toHaveBeenCalled();
    });

    it('executeCommand should call addMessageToRoom !aide', () => {
        const command: Command = {
            commandType: CommandType.Help,
            senderName: 'John Scrabble',
        };
        const spy = spyOn(service, 'addMessageToRoom');
        service.executeCommand(command);
        expect(spy).toHaveBeenCalled();
    });

    it('executeCommand should call send with sendCommand and the command', () => {
        const command: PlaceCommand = {
            commandType: CommandType.Place,
            placement: { coordH: 0, coordV: 0 },
            orientation: Orientation.Horizontal,
            lettersToPlace: '',
            senderName: '',
        };
        const sendCommand = 'sendCommand';
        const spy = spyOn(socketServiceMock, 'send');
        service.executeCommand(command);
        expect(spy).toHaveBeenCalledWith(sendCommand, { command, room: service.gameManager.currentRoom });
    });

    it('addMessageToRoom should change currentMessage and push into roomMessages', () => {
        const roomMessage: RoomMessage = { ...DEFAULT_ROOM_MESSAGE };
        const beforeLength = service.roomMessages.length;
        service.addMessageToRoom(roomMessage);
        expect(service.currentMessage).toEqual(roomMessage);
        expect(service.roomMessages.length).toEqual(beforeLength + 1);
    });

    it('sendCommand should call populateCommandObject with splitted command if it is the currentPlayer turn', () => {
        service.currentPlayer = { ...TEST_PLAYER };
        service.currentPlayer.isTurn = true;
        const commandInLine = '!placer h8h oui';
        const spy = spyOn(service, 'executeCommand');
        service.sendCommand(commandInLine);
        expect(commandHandlerServiceSpy.populateCommandObject).toHaveBeenCalledWith([CommandType.Place, 'h8h', 'oui'], service.currentPlayer.name);
        expect(spy).toHaveBeenCalled();
    });

    it('sendCommand should call addMessageToRoom with reserve if it is command !réserve', () => {
        service.currentPlayer.isTurn = true;
        const commandInLine = CommandType.Reserve;
        const spy = spyOn(service, 'addMessageToRoom');
        const reserveSpy = spyOnProperty(service, 'reserve', 'get');
        service.sendCommand(commandInLine);
        expect(spy).toHaveBeenCalled();
        expect(reserveSpy).toHaveBeenCalled();
    });

    it('sendCommand should call addMessageToRoom if it catch an error', () => {
        service.currentPlayer.isTurn = false;
        const commandInLine = '!placer h8h oui';
        const spy = spyOn(service, 'addMessageToRoom');
        service.sendCommand(commandInLine);
        expect(spy).toHaveBeenCalled();
    });

    it('sendCommand should call addMessageToRoom if it catch an error', () => {
        service.currentPlayer.isTurn = true;
        const commandInLine = '!placer h8h oui';
        const unexpectedError = () => {
            throw Error();
        };
        commandHandlerServiceSpy.populateCommandObject.and.callFake(unexpectedError);
        const spy = spyOn(service, 'addMessageToRoom');
        service.sendCommand(commandInLine);
        expect(spy).toHaveBeenCalled();
    });

    it('sendMessage should call send with roomMessage', () => {
        const message = 'Salut';
        const roomMessage: RoomMessage = {
            value: message,
            roomKey: service.currentRoom?.key,
            color: '',
            senderName: service.currentPlayer.name,
        };
        const spy = spyOn(socketServiceMock, 'send');
        service.sendMessage(message);
        expect(spy).toHaveBeenCalledWith('roomMessage', roomMessage);
    });

    it('getMessageColor should return the color black if the currentPlayer is the sender', () => {
        const color = 'black';
        currentRoom.guestPlayer = { ...TEST_PLAYER };
        service.currentPlayer = currentRoom.hostPlayer;
        const returnValue = service.getMessageColor(currentRoom.hostPlayer.name);
        expect(returnValue).toEqual(color);
    });

    it('getMessageColor should return the color blue if the currentPlayer is not the sender', () => {
        const color = 'blue';
        currentRoom.guestPlayer = { ...TEST_PLAYER };
        service.currentPlayer = currentRoom.guestPlayer;
        const returnValue = service.getMessageColor(currentRoom.hostPlayer.name);
        expect(returnValue).toEqual(color);
    });

    it('sendToRoom should call send command if message is a command', () => {
        const message = CommandType.Pass;
        const spy = spyOn(service, 'sendCommand');
        commandHandlerServiceSpy.isCommand.and.returnValue(true);
        service.sendToRoom(message);
        expect(spy).toHaveBeenCalledWith(message);
    });

    it('sendToRoom should call sendMessage if message is not a command', () => {
        const message = 'pas passer';
        const spy = spyOn(service, 'sendMessage');
        commandHandlerServiceSpy.isCommand.and.returnValue(false);
        service.sendToRoom(message);
        expect(spy).toHaveBeenCalledWith(message);
    });

    it('setPlayerID should update PlayerID if socket.id not undefined', () => {
        socketServiceMock.socket.id = 'id';
        service.setPlayerID();
        expect(service.playerId).toEqual('id');
    });

    it("setPlayerID should update PlayerID to '' if socket.id is undefined", () => {
        socketServiceMock.socket.id = '';
        service.setPlayerID();
        expect(service.playerId).toEqual('');
    });

    it('handleSockets call the correct number of times on', () => {
        const expectedTimes = 7;
        const spy = spyOn(socketServiceMock, 'on');
        service.handleSockets();
        expect(spy).toHaveBeenCalledTimes(expectedTimes);
    });

    it('should call addMessageToRoom and getMessageColor if sender is not the system on signal roomMessage', () => {
        const expectedMessage: RoomMessage = { value: 'Oui', roomKey: 'key', color: 'red', senderName: 'realPlayer69' };
        const spy = spyOn(service, 'addMessageToRoom');
        const colorSpy = spyOn(service, 'getMessageColor');
        socketHelper.peerSideEmit('roomMessage', expectedMessage);
        expect(colorSpy).toHaveBeenCalledWith(expectedMessage.senderName);
        expect(spy).toHaveBeenCalledWith(expectedMessage);
    });

    it('should call addMessageToRoom and not getMessageColor if sender is the system on signal roomMessage', () => {
        const expectedMessage: RoomMessage = { value: 'Oui', roomKey: 'key', color: 'red', senderName: FROM_SYSTEM };
        const spy = spyOn(service, 'addMessageToRoom');
        const colorSpy = spyOn(service, 'getMessageColor');
        socketHelper.peerSideEmit('roomMessage', expectedMessage);
        expect(colorSpy).not.toHaveBeenCalled();
        expect(spy).toHaveBeenCalledWith(expectedMessage);
    });

    it('should update currentRoom on signal turnChanged', () => {
        const expectedRoom = currentRoom;
        socketHelper.peerSideEmit('turnChanged', expectedRoom);
        expect(service.currentRoom).toEqual(expectedRoom);
    });

    it('should update currentRoom on signal updateRoom', () => {
        const expectedRoom: RoomClient = { ...currentRoom, timer: 69 };
        socketHelper.peerSideEmit('updateRoom', expectedRoom);
        expect(service.currentRoom).toEqual(expectedRoom);
    });

    it('should update timer on signal timer', () => {
        const expectedTime = currentRoom.timer + 1;
        socketHelper.peerSideEmit('timer', expectedTime);
        expect(service.timer).toEqual(expectedTime);
    });

    it('should update currentRoom on signal playerDisconnected', () => {
        const expectedRoom = currentRoom;
        const roomEventSpy = spyOn(service.roomEvent, 'next');
        socketHelper.peerSideEmit('playerDisconnected', expectedRoom);
        expect(service.currentRoom).toEqual(expectedRoom);
        expect(roomEventSpy).toHaveBeenCalled();
    });

    it('should update currentRoom on signal gameAccepted', () => {
        const expectedRoom = currentRoom;
        socketHelper.peerSideEmit('gameAccepted', expectedRoom);
        expect(service.currentRoom).toEqual(expectedRoom);
    });

    it('should update currentRoom on signal hintCommand', () => {
        const expectedHints = ['1', '2', '3'];
        const spy = spyOn(service, 'addMessageToRoom');
        socketHelper.peerSideEmit('hintCommand', expectedHints);
        expect(spy).toHaveBeenCalledTimes(expectedHints.length);
    });

    it('should clear the messages, set the currentRoom to that of gameManagerService and call both setCurrentPlayer and \
setPlayerID on init()', () => {
        const spyCurrentPlayer = spyOn(service, 'setCurrentPlayer');
        const spyPlayerID = spyOn(service, 'setPlayerID');
        gameManagerServiceStub.currentRoom = { ...TEST_ROOM_CLIENT };

        service.init();

        expect(service.currentRoom).toEqual(gameManagerServiceStub.currentRoom);
        expect(service.roomMessages).toEqual([]);
        expect(spyCurrentPlayer).toHaveBeenCalled();
        expect(spyPlayerID).toHaveBeenCalled();
    });

    it('setCurrentPlayer, setPlayerID, roomEvent.next should be called and currentRoom should update on gameManagerService.roomEvent.next()', () => {
        gameManagerServiceStub.currentRoom = { ...TEST_ROOM_CLIENT };
        gameManagerServiceStub.currentRoom.key = 'alt-key';
        gameManagerServiceStub.roomEvent = roomEvent;

        const spyCurrentPlayer = spyOn(service, 'setCurrentPlayer');
        const spyPlayerID = spyOn(service, 'setPlayerID');
        const spyRoomEventNext = spyOn(service.roomEvent, 'next');

        gameManagerServiceStub.roomEvent.next(gameManagerServiceStub.currentRoom);

        expect(service.currentRoom).toEqual(gameManagerServiceStub.currentRoom);
        expect(spyCurrentPlayer).toHaveBeenCalled();
        expect(spyPlayerID).toHaveBeenCalled();
        expect(spyRoomEventNext).toHaveBeenCalled();
    });

    it('getCurrentPlayer should not change the currentPlayer if the gameManagerService has an undefined currentRoom', () => {
        gameManagerServiceStub.currentRoom = undefined;
        gameManagerServiceStub.roomEvent = roomEvent;

        const expected = service.currentPlayer;

        gameManagerServiceStub.roomEvent.next(gameManagerServiceStub.currentRoom);

        service.setCurrentPlayer();

        expect(service.currentPlayer).toEqual(expected);
    });

    it('reserve getter should return the formated string', () => {
        const reserve: Reserve = {
            nbOfLetters: 5,
            content: [
                { letter: 'a', nbOfCopies: 5 },
                { letter: '*', nbOfCopies: 0 },
            ],
        };
        gameManagerServiceStub.currentRoom = { ...TEST_ROOM_CLIENT, reserve };

        const expected = 'Voici le contenu de la réserve:\na : 5\n* : 0\n';

        expect(service.reserve).toEqual(expected);
    });

    it('rack setter should put missing letters of client rack at the beginning of the array', () => {
        const letters: Letter[] = [
            { letter: 'A', value: 1 },
            { letter: 'B', value: 2 },
            { letter: 'A', value: 3 },
            { letter: 'C', value: 4 },
        ];
        const rackClient: Letter[] = [
            { letter: 'A', value: 1 },
            { letter: 'B', value: 2 },
        ];
        const rackServer: Rack = { content: letters };

        Object.defineProperty(gameManagerServiceStub, 'currentPlayer', {
            get() {
                return currentPlayer;
            },
        });

        Object.defineProperty(gameManagerServiceStub, 'rack', {
            get() {
                return currentPlayer.rack;
            },
        });

        service.gameManager.currentPlayer.rack = rackServer;

        const expected: Letter[] = [
            { letter: 'A', value: 3 },
            { letter: 'C', value: 4 },
            { letter: 'A', value: 1 },
            { letter: 'B', value: 2 },
        ];

        service.rack = rackClient;

        expect(gameManagerServiceStub.rack).toEqual({ content: expected });
    });

    it('rack setter should reorder letters of server rack to match client rack', () => {
        const letters: Letter[] = [
            { letter: 'A', value: 1 },
            { letter: 'B', value: 2 },
            { letter: 'A', value: 1 },
            { letter: 'C', value: 4 },
        ];
        const rackClient: Letter[] = [
            { letter: 'A', value: 1 },
            { letter: 'C', value: 4 },
            { letter: 'A', value: 1 },
            { letter: 'B', value: 2 },
        ];
        const rackServer: Rack = { content: letters };

        Object.defineProperty(gameManagerServiceStub, 'currentPlayer', {
            get() {
                return currentPlayer;
            },
        });

        Object.defineProperty(gameManagerServiceStub, 'rack', {
            get() {
                return currentPlayer.rack;
            },
        });

        service.gameManager.currentPlayer.rack = rackServer;

        const expected: Letter[] = [
            { letter: 'A', value: 1 },
            { letter: 'C', value: 4 },
            { letter: 'A', value: 1 },
            { letter: 'B', value: 2 },
        ];

        service.rack = rackClient;

        expect(gameManagerServiceStub.rack).toEqual({ content: expected });
    });

    it('rack setter should not take in account client rack if a letter was changed', () => {
        const letters: Letter[] = [
            { letter: 'A', value: 1 },
            { letter: 'B', value: 2 },
            { letter: 'A', value: 1 },
            { letter: 'C', value: 4 },
        ];
        const rackClient: Letter[] = [
            { letter: 'A', value: 1 },
            { letter: 'C', value: 4 },
            { letter: 'D', value: 1 },
            { letter: 'B', value: 2 },
        ];
        const rackServer: Rack = { content: letters };

        Object.defineProperty(gameManagerServiceStub, 'currentPlayer', {
            get() {
                return currentPlayer;
            },
        });

        Object.defineProperty(gameManagerServiceStub, 'rack', {
            get() {
                return currentPlayer.rack;
            },
        });

        service.gameManager.currentPlayer.rack = rackServer;

        service.rack = rackClient;

        expect(gameManagerServiceStub.rack).toEqual(rackServer);
    });
});
