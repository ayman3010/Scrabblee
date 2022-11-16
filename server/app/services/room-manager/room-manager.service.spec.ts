/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable @typescript-eslint/no-shadow */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable no-unused-expressions */
import { EMPTY_ROOM } from '@app/classes/constants/room';
import { Room } from '@app/classes/interfaces/room';
import { DrawObjective } from '@app/classes/objectives/draw-objective/draw-objective';
import { Tools } from '@app/classes/tools/tools';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GamesHistoryService } from '@app/services/games-history/games-history.service';
import { HighScoresService } from '@app/services/high-scores/high-scores.service';
import { PlayerManagerService } from '@app/services/player-manager/player-manager.service';
import { VirtualPlayerService } from '@app/services/virtual-player/virtual-player.service';
import { DEFAULT_EXCHANGE_COMMAND, DEFAULT_PLACE_COMMAND } from '@common/constants/command-constants';
import { DEFAULT_GAME_OPTIONS } from '@common/constants/options-constants';
import { INITIAL_RESERVE_CONTENT, MINIMUM_LETTERS_FOR_EXCHANGE, RESERVE_CAPACITY } from '@common/constants/reserve-constant';
import { DEFAULT_ROOM_MESSAGE, EMPTY_BOARD } from '@common/constants/room-constants';
import { TEST_ROOM_CLIENT } from '@common/constants/test-room';
import { SECONDS_IN_MINUTE } from '@common/constants/time-constants';
import { CommandType, GameState } from '@common/enums/enums';
import { Board } from '@common/interfaces/board-interface';
import { Command, ExchangeCommand, PlaceCommand } from '@common/interfaces/command-interface';
import { Rack } from '@common/interfaces/rack-interface';
import { expect } from 'chai';
import { Subject } from 'rxjs';
import * as sinon from 'sinon';
import * as io from 'socket.io';
import { RoomManager } from './room-manager.service';

describe('RoomManager Service Tests', () => {
    let roomManager: RoomManager;
    let serverSocket: io.Socket;
    let room: Room;
    let highScoresService: sinon.SinonStubbedInstance<HighScoresService>;
    let gamesHistoryService: sinon.SinonStubbedInstance<GamesHistoryService>;
    let gameManagerServiceStub: sinon.SinonStubbedInstance<GameManagerService>;
    let playerManagerStub: sinon.SinonStubbedInstance<PlayerManagerService>;
    let virtualPlayer: sinon.SinonStubbedInstance<VirtualPlayerService>;
    const gameManagerServiceMock = {
        playTurn: (command: PlaceCommand, mockRoom: Room) => {
            mockRoom.guestPlayer.points++;
        },
        nextTurnInitialization: (mockRoom: Room) => {
            mockRoom.nbOfTurns++;
            mockRoom.guestPlayer.isTurn = !room.guestPlayer.isTurn;
            mockRoom.hostPlayer.isTurn = !room.hostPlayer.isTurn;
            return mockRoom;
        },
        exchangeLetters: (mockRoom: Room, letters: string) => {
            return true;
        },
        initializeRoom: (mockRoom: Room) => {
            mockRoom.gameState = GameState.GameAccepted;
            return;
        },
        isHostPlayerTurn: (mockRoom: Room) => {
            return mockRoom.hostPlayer.isTurn;
        },
        finalGameResults: (mockRoom: Room) => {
            return mockRoom.key;
        },
        endGamePointsUpdate: (mockRoom: Room) => {
            return;
        },
    };

    const DEFAULT_ROOM: Room = {
        key: 'randomKey',
        hostPlayer: { name: '', socketId: '', isTurn: true, rack: { content: [] }, points: 0, abandoned: false },
        guestPlayer: { name: '', socketId: '', isTurn: true, rack: { content: [] }, points: 0, abandoned: false },
        timer: SECONDS_IN_MINUTE,
        gameState: GameState.WaitingForGuest,
        board: EMPTY_BOARD,
        nbOfTurns: 0,
        reserve: { content: INITIAL_RESERVE_CONTENT.map((letter) => Object.assign({ ...letter })), nbOfLetters: RESERVE_CAPACITY },
        nbSkippedTurns: 0,
        gameOptions: DEFAULT_GAME_OPTIONS,
        dateBegin: new Date(),

        drawEvent: new Subject(),
        skipEvent: new Subject(),
        exchangeEvent: new Subject(),
        placeEvent: new Subject(),
        boardWordsEvent: new Subject(),
        objectives: [],
    };

    const mockServerSocket = {
        emit: <T>(event: string, data?: T) => {
            return { event, data };
        },
        join: (roomKey: string) => {
            return roomKey;
        },
        leave: (roomKey: string) => {
            return roomKey;
        },
        id: 'randomSocketId',
    };
    const virtualPlayerMock = {
        getVirtualPlayerCommand: (board: Board, rack: Rack) => {
            const command: Command = DEFAULT_PLACE_COMMAND;
            return command;
        },
        generateHints: (socket: io.Socket, mockRoom: Room) => {
            return ['hints'];
        },
        getVirtualPlayerName: (hostName: string) => {
            return 'name';
        },
    };

    const playerManagerMock = {
        setHost: (room: Room) => {
            return;
        },
    };

    beforeEach(() => {
        virtualPlayer = sinon.createStubInstance(VirtualPlayerService);
        highScoresService = sinon.createStubInstance(HighScoresService);
        gamesHistoryService = sinon.createStubInstance(GamesHistoryService);
        gameManagerServiceStub = sinon.createStubInstance(GameManagerService);
        playerManagerStub = sinon.createStubInstance(PlayerManagerService);
        roomManager = new RoomManager(
            gameManagerServiceStub as unknown as GameManagerService,
            highScoresService as unknown as HighScoresService,
            virtualPlayer as unknown as VirtualPlayerService,
            playerManagerStub as unknown as PlayerManagerService,
            gamesHistoryService as unknown as GamesHistoryService,
        );
        roomManager['virtualPlayerResponse'] = 1;
        roomManager.sio = new io.Server();

        serverSocket = mockServerSocket as unknown as io.Socket;
        roomManager.rooms = new Map<string, Room>();
        room = JSON.parse(JSON.stringify(DEFAULT_ROOM));
        gameManagerServiceMock.playTurn = (command: PlaceCommand, mockRoom: Room) => {
            mockRoom.guestPlayer.points++;
        };
        gameManagerServiceMock.nextTurnInitialization = (mockRoom: Room) => {
            mockRoom.nbOfTurns++;
            mockRoom.guestPlayer.isTurn = !room.guestPlayer.isTurn;
            mockRoom.hostPlayer.isTurn = !room.hostPlayer.isTurn;
            return mockRoom;
        };
        gameManagerServiceMock.exchangeLetters = (mockRoom: Room, letters: string) => {
            return true;
        };
        gameManagerServiceMock.initializeRoom = (mockRoom: Room) => {
            mockRoom.gameState = GameState.GameAccepted;
            return;
        };
        gameManagerServiceMock.isHostPlayerTurn = (mockRoom: Room) => {
            return mockRoom.hostPlayer.isTurn;
        };
        gameManagerServiceMock.finalGameResults = (mockRoom: Room) => {
            return mockRoom.key;
        };
        gameManagerServiceMock.endGamePointsUpdate = (mockRoom: Room) => {
            return;
        };
        playerManagerMock.setHost = (room: Room) => {
            return;
        };
    });

    afterEach(async () => {
        sinon.restore();
        roomManager.rooms.clear();
    });

    it('createRoom() should create a room and add it to the list of rooms', () => {
        const roomsSize = roomManager.rooms.size;
        roomManager.createRoom();
        expect(roomManager.rooms.size).to.be.equal(roomsSize + 1);
    });

    it('createRoom should assign a unique room key if the first generated room key was already taken', () => {
        room = { ...EMPTY_ROOM };
        room.key = 'randomKey';

        roomManager.rooms.set(room.key, room);
        const stub = sinon.stub(roomManager as any, 'generateRoomKey');
        stub.returns('randomKey');
        stub.onSecondCall().returns('otherRandomKey');
        roomManager.createRoom();
        expect(roomManager.rooms.has('otherRandomKey')).to.be.true;
    });

    it('deleteRoom() should remove the room with the specified key and return true if it exists', () => {
        roomManager.rooms.set(DEFAULT_ROOM.key, { ...DEFAULT_ROOM });
        const roomsSize = roomManager.rooms.size;
        const returnValue = roomManager.deleteRoom(DEFAULT_ROOM.key);
        expect(roomManager.rooms.size).equal(roomsSize - 1);
        expect(returnValue).true;
    });

    it('deleteRoom() should return false if room does not exist', () => {
        const returnValue = roomManager.deleteRoom(DEFAULT_ROOM.key);
        expect(returnValue).false;
    });

    it('generate room key should return a key of length 9', () => {
        expect(roomManager['generateRoomKey']().length).to.equal(9);
    });

    it('listAvailableRooms() returns empty map when the list of rooms is empty ', () => {
        roomManager.rooms = new Map<string, Room>();
        roomManager.listAvailableRooms();
        expect(roomManager.listAvailableRooms()).eql([]);
    });

    it('playVirtualPlayerTurn() calls playTurn when it is a place command', async () => {
        const resolves = JSON.parse(JSON.stringify(DEFAULT_PLACE_COMMAND));
        resolves.commandType = CommandType.Place;
        virtualPlayer.getVirtualPlayerCommand.resolves(resolves);
        const spy = sinon.stub(roomManager, 'playTurn');
        await roomManager['playVirtualPlayerTurn'](DEFAULT_ROOM);
        expect(spy.called).true;
    });

    it('playVirtualPlayerTurn() calls exchange when it is an exchange command', async () => {
        const resolves = JSON.parse(JSON.stringify(DEFAULT_PLACE_COMMAND));
        resolves.commandType = CommandType.Exchange;
        virtualPlayer.getVirtualPlayerCommand.resolves(resolves);
        const spy = sinon.stub(roomManager, 'exchange');
        await roomManager['playVirtualPlayerTurn'](DEFAULT_ROOM);
        expect(spy.called).equal(true);
    });

    it('playVirtualPlayerTurn() calls skipTurn when it is a skip command', async () => {
        virtualPlayer.getVirtualPlayerCommand.resolves({ commandType: CommandType.Pass, senderName: 'virtualPlayer' });
        const spy = sinon.stub(roomManager, 'skipTurn');
        await roomManager['playVirtualPlayerTurn'](DEFAULT_ROOM);
        expect(spy.called).equal(true);
    });

    it('listAvailableRooms() returns empty map when there is no available rooms', () => {
        const availableRooms: Map<string, Room> = new Map<string, Room>();
        const availableRoom: Room = DEFAULT_ROOM;
        availableRoom.key = 'randomKey';
        availableRoom.hostPlayer = {
            name: 'creatorName',
            socketId: serverSocket.id,
            rack: { content: [] },
            points: 0,
            isTurn: true,
            abandoned: false,
        };
        roomManager.rooms.set(availableRoom.key, availableRoom);
        const spy = sinon.spy(mockServerSocket, 'emit');
        roomManager.listAvailableRooms();
        expect(spy.calledWith('listOfAvailableRooms', availableRooms));
    });

    it('getHint() calls emit', () => {
        room.hostPlayer.socketId = serverSocket.id;
        roomManager.getHint(serverSocket, room);
        const spy = sinon.spy(mockServerSocket, 'emit');
        expect(spy.called);
    });

    it("getHint() calls emit even when it's the guest's turn", () => {
        room.hostPlayer.socketId = 'wow';
        roomManager.getHint(serverSocket, room);
        const spy = sinon.spy(mockServerSocket, 'emit');
        expect(spy.called);
    });

    it('listAvailableRooms() returns the roomrs with no guestPlayer ', () => {
        const availableRooms: Map<string, Room> = new Map<string, Room>();
        const availableRoom: Room = { ...DEFAULT_ROOM };
        availableRoom.gameOptions.singlePlayer = false;
        availableRoom.key = 'randomKey1';
        availableRoom.hostPlayer = {
            name: 'creatorName',
            socketId: serverSocket.id,
            rack: { content: [] },
            points: 0,
            isTurn: true,
            abandoned: false,
        };
        const occupiedRoom: Room = { ...availableRoom };
        availableRoom.key = 'randomKey2';
        occupiedRoom.guestPlayer = {
            name: 'guestName',
            socketId: 'randomSocketId',
            rack: { content: [] },
            points: 0,
            isTurn: false,
            abandoned: false,
        };
        roomManager.rooms.set(availableRoom.key, availableRoom);
        roomManager.rooms.set(occupiedRoom.key, occupiedRoom);
        availableRooms.set(availableRoom.key, availableRoom);
        const spy = sinon.spy(mockServerSocket, 'emit');
        roomManager.listAvailableRooms();
        expect(spy.calledWith('listOfAvailableRooms', availableRooms));
    });

    it('getRoom() returns the rooms which contains the socket', () => {
        roomManager.rooms = new Map<string, Room>();
        room.key = 'randomKey';
        room.hostPlayer = {
            name: 'creatorName',
            socketId: serverSocket.id,
            rack: { content: [] },
            points: 0,
            isTurn: true,
            abandoned: false,
        };
        roomManager.rooms.set(room.key, room);
        const spy = sinon.spy(mockServerSocket, 'emit');
        roomManager.getRoom(serverSocket);
        expect(spy.calledWith('roomReceived', room));
    });

    it('getRoom() does not call emit if no room is available', () => {
        roomManager.rooms = new Map<string, Room>();
        room.key = 'randomKey';
        room.hostPlayer = {
            name: 'creatorName',
            socketId: 'notServerSocketId',
            rack: { content: [] },
            points: 0,
            isTurn: true,
            abandoned: false,
        };
        roomManager.rooms.set(room.key, room);
        const spy = sinon.spy(mockServerSocket, 'emit');
        roomManager.getRoom(serverSocket);
        expect(spy.notCalled);
    });

    it('getRoom() does not call emit if no room contains the socketid', () => {
        roomManager.rooms = new Map<string, Room>();
        roomManager.rooms.set(room.key, room);
        const spy = sinon.spy(mockServerSocket, 'emit');
        roomManager.getRoom(serverSocket);
        expect(spy.notCalled);
    });

    it('getRoom() does not call emit if there is no rooms', () => {
        roomManager.rooms = new Map<string, Room>();
        const spy = sinon.spy(mockServerSocket, 'emit');
        roomManager.getRoom(serverSocket);
        expect(spy.notCalled);
    });

    it('sendToRoom() calls emitEventToRoomEvent()', () => {
        const roomMessage = DEFAULT_ROOM_MESSAGE;
        roomManager.rooms = new Map<string, Room>();
        const spy = sinon.spy(roomManager as any, 'emitEventToRoom');
        roomManager.sendToRoom(roomMessage, serverSocket);
        expect(spy.calledWith('roomMessage', roomMessage.roomKey, serverSocket, roomMessage));
    });

    it('startGame() sets room to the right parameters', () => {
        const expectedRoom = JSON.parse(JSON.stringify(DEFAULT_ROOM));
        expectedRoom.gameState = GameState.GameAccepted;
        expectedRoom.timer = SECONDS_IN_MINUTE + 1;
        room.gameOptions.turnDuration = SECONDS_IN_MINUTE + 1;
        gameManagerServiceStub.initializeRoom.callsFake((toChange: Room) => {
            toChange.timer = toChange.gameOptions.turnDuration;
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sinon.stub(roomManager as any, 'shouldGuestStart').returns(false);
        roomManager.startGame(room);
        expect(room.timer).to.be.equal(expectedRoom.timer);
    });

    it('startGame() calls virtualPlayer.getVirtualPlayerName() if the game is in singleplayer', () => {
        room.gameOptions.singlePlayer = true;
        const stub = virtualPlayer.getVirtualPlayerName.resolves('Bob Scrabble');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sinon.stub(roomManager as any, 'shouldGuestStart').returns(false);
        roomManager.startGame(room);
        expect(stub.called).to.be.true;
    });

    it('startGame() does not call changeTurn() if shouldGuestStart() returns false', () => {
        room.gameOptions.singlePlayer = true;
        sinon.stub(virtualPlayerMock, 'getVirtualPlayerName').returns('Bob Scrabble');
        const changeTurnStub = sinon.stub(roomManager as any, 'changeTurn');
        sinon.stub(roomManager as any, 'shouldGuestStart').returns(false);
        roomManager.startGame(room);
        expect(changeTurnStub.called).to.be.false;
    });

    it('startGame() calls changeTurn() if shouldGuestStart() returns true', async () => {
        room.gameOptions.singlePlayer = true;
        sinon.stub(virtualPlayerMock, 'getVirtualPlayerName').returns('Bob Scrabble');
        const changeTurnStub = sinon.stub(roomManager as any, 'changeTurn');
        sinon.stub(roomManager as any, 'shouldGuestStart').returns(true);
        await roomManager.startGame(room);
        expect(changeTurnStub.called).to.be.true;
    });

    it('handleTimer() does not modify value if game is not accepted ', () => {
        roomManager.rooms.set(room.key, room);
        room.gameState = GameState.WaitingForGuest;
        roomManager.handleTimer(room);
        expect(room.timer).to.be.equal(SECONDS_IN_MINUTE);
    });

    it('handleTimer() decrements the timer if the value is not null', () => {
        room.gameState = GameState.GameAccepted;
        roomManager.handleTimer(room);
        expect(roomManager.rooms.get(room.key)?.timer).to.be.equal(SECONDS_IN_MINUTE - 1);
    });

    it('handleTimer() reinitialize to maximum value if the timer hits 0', () => {
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        room.gameState = GameState.GameAccepted;
        room.timer = 0;
        room.gameOptions.turnDuration = SECONDS_IN_MINUTE;
        roomManager.handleTimer(room);
        expect(roomManager.rooms.get(room.key)?.timer).to.be.equal(SECONDS_IN_MINUTE);
    });

    it('handleTimer() calls skipTurn() if the timer hits 0', () => {
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        room.gameState = GameState.GameAccepted;
        room.timer = 0;
        const spy = sinon.spy(roomManager, 'skipTurn');
        roomManager.handleTimer(room);
        expect(spy.called).to.be.true;
    });

    it('skipTurn() switch the turns of guest and host player and sends a message notifying both players that the host skipped their turn', () => {
        room = { ...EMPTY_ROOM };
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        gameManagerServiceStub.isHostPlayerTurn.returns(true);
        const stub = sinon.stub(roomManager as any, 'changeTurn');
        roomManager.skipTurn(room.key);
        expect(stub.called).to.be.equal(true);
    });

    it('skipTurn() should call next of skipEvent', () => {
        room = { ...EMPTY_ROOM };
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        gameManagerServiceStub.isHostPlayerTurn.returns(false);
        sinon.stub(roomManager as any, 'changeTurn');

        const stub = sinon.createStubInstance(Subject);
        room.skipEvent = stub as unknown as Subject<void>;
        Object.defineProperty(stub, 'observed', {
            get() {
                return true;
            },
        });
        roomManager.skipTurn(room.key);
        expect(stub.next.called).equal(true);
    });

    it('playTurn() calls playTurn from gameManagerService', () => {
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        const command: PlaceCommand = DEFAULT_PLACE_COMMAND;
        roomManager.playTurn(command, room.key);
        expect(gameManagerServiceStub.playTurn.called).to.be.true;
    });

    it('playTurn() call next of skipEvent if command failed', () => {
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        const command: PlaceCommand = DEFAULT_PLACE_COMMAND;
        const stub = sinon.createStubInstance(Subject);
        room.skipEvent = stub as unknown as Subject<void>;
        Object.defineProperty(stub, 'observed', {
            get() {
                return true;
            },
        });
        roomManager.playTurn(command, room.key);
        expect(stub.next.called).equal(true);
    });

    it('playTurn() calls changeTurn when place command fails for the host', () => {
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        const command: PlaceCommand = DEFAULT_PLACE_COMMAND;
        const stub = sinon.stub(roomManager as any, 'changeTurn');
        roomManager.playTurn(command, room.key);
        expect(stub.called).to.be.true;
    });

    it('playTurn() calls changeTurn when place command fails for the guest', () => {
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        roomManager.skipTurn(room.key);
        const command: PlaceCommand = DEFAULT_PLACE_COMMAND;
        const stub = sinon.stub(roomManager as any, 'changeTurn');
        roomManager.playTurn(command, room.key);
        expect(stub.called).to.be.true;
    });

    it('playTurn() calls changeTurn when place command succeeds', () => {
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        const command: PlaceCommand = DEFAULT_PLACE_COMMAND;
        room.hostPlayer.rack.content = [
            { letter: 'p', value: 1 },
            { letter: 'a', value: 1 },
            { letter: 's', value: 1 },
        ];
        const spy = sinon.spy(roomManager as any, 'changeTurn');
        gameManagerServiceStub.playTurn.callsFake((commande: PlaceCommand, roomToUpdate: Room) => {
            roomToUpdate.hostPlayer.points++;
        });
        roomManager.playTurn(command, room.key);
        gameManagerServiceStub.playTurn.callsFake((commande: PlaceCommand, roomToUpdate: Room) => {
            return;
        });

        expect(spy.called).to.be.true;
    });

    it('playTurn() calls changeTurn when place command succeeds for more than one point for guest', () => {
        const command: PlaceCommand = DEFAULT_PLACE_COMMAND;
        room.guestPlayer.rack.content = [
            { letter: 'p', value: 1 },
            { letter: 'a', value: 1 },
            { letter: 's', value: 1 },
        ];
        const spy = sinon.spy(roomManager as any, 'changeTurn');
        gameManagerServiceStub.playTurn.callsFake((commande: PlaceCommand, roomToUpdate: Room) => {
            roomToUpdate.guestPlayer.points += 3;
        });
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        roomManager.playTurn(command, room.key);
        gameManagerServiceStub.playTurn.callsFake((commande: PlaceCommand, roomToUpdate: Room) => {
            return;
        });

        expect(spy.called).to.be.true;
    });

    it('exchange calls exchangeLetters() of gameManager', () => {
        room.reserve = { content: INITIAL_RESERVE_CONTENT.map((letter) => Object.assign({ ...letter })), nbOfLetters: RESERVE_CAPACITY };
        room.board = EMPTY_BOARD;
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        const command: ExchangeCommand = JSON.parse(JSON.stringify(DEFAULT_EXCHANGE_COMMAND));
        roomManager.exchange(command, room.key);
        expect(gameManagerServiceStub.exchangeLetters.called).to.be.true;
    });

    it('exchange calls changeTurn() if gameManager.exchangeLetters() returns true', () => {
        room.reserve = { content: INITIAL_RESERVE_CONTENT.map((letter) => Object.assign({ ...letter })), nbOfLetters: RESERVE_CAPACITY };
        room.board = EMPTY_BOARD;
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        const command: ExchangeCommand = JSON.parse(JSON.stringify(DEFAULT_EXCHANGE_COMMAND));
        const stub = sinon.stub(roomManager as any, 'changeTurn');
        gameManagerServiceStub.exchangeLetters.returns(true);
        roomManager.exchange(command, room.key);
        expect(stub.called).to.be.true;
    });

    it('exchange calls changeTurn() if gameManager.exchangeLetters() returns true and gives the \
alternative message for multiple letters exchanged', () => {
        room.reserve = { content: INITIAL_RESERVE_CONTENT.map((letter) => Object.assign({ ...letter })), nbOfLetters: RESERVE_CAPACITY };
        room.board = EMPTY_BOARD;
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        const command: ExchangeCommand = JSON.parse(JSON.stringify(DEFAULT_EXCHANGE_COMMAND));
        command.letters = 'ab';
        const stub = sinon.stub(roomManager as any, 'changeTurn');
        gameManagerServiceStub.exchangeLetters.returns(true);
        roomManager.exchange(command, room.key);
        expect(stub.called).to.be.true;
    });

    it('exchange calls changeTurn() if gameManager.exchangeLetters() returns true and gives the \
alternative message for the reserve not having enough letters left', () => {
        room.reserve = {
            content: INITIAL_RESERVE_CONTENT.map((letter) => Object.assign({ ...letter })),
            nbOfLetters: MINIMUM_LETTERS_FOR_EXCHANGE - 1,
        };
        room.board = EMPTY_BOARD;
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        const command: ExchangeCommand = JSON.parse(JSON.stringify(DEFAULT_EXCHANGE_COMMAND));
        command.letters = 'a';
        const stub = sinon.stub(roomManager as any, 'changeTurn');
        gameManagerServiceStub.exchangeLetters.returns(true);
        roomManager.exchange(command, room.key);
        expect(stub.called).to.be.true;
    });

    it('exchange calls changeTurn() if gameManager.exchangeLetters() returns false', () => {
        room.reserve = { content: INITIAL_RESERVE_CONTENT.map((letter) => Object.assign({ ...letter })), nbOfLetters: RESERVE_CAPACITY };
        room.board = EMPTY_BOARD;
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        const command: ExchangeCommand = JSON.parse(JSON.stringify(DEFAULT_EXCHANGE_COMMAND));
        command.senderName = room.hostPlayer.name;
        const spy = sinon.spy(roomManager as any, 'changeTurn');
        sinon.stub(gameManagerServiceMock, 'exchangeLetters').returns(false);
        roomManager.exchange(command, room.key);
        expect(spy.called).to.be.true;
    });

    it('exchange calls next of skipEvent if exchange failed', () => {
        room.reserve = { content: INITIAL_RESERVE_CONTENT.map((letter) => Object.assign({ ...letter })), nbOfLetters: RESERVE_CAPACITY };
        room.board = EMPTY_BOARD;
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        const command: ExchangeCommand = JSON.parse(JSON.stringify(DEFAULT_EXCHANGE_COMMAND));
        command.senderName = room.hostPlayer.name;
        sinon.stub(gameManagerServiceMock, 'exchangeLetters').returns(false);

        const stub = sinon.createStubInstance(Subject);
        room.skipEvent = stub as unknown as Subject<void>;
        Object.defineProperty(stub, 'observed', {
            get() {
                return true;
            },
        });
        roomManager.exchange(command, room.key);
        expect(stub.next.called).equal(true);
    });

    it('exchange calls changeTurn() if gameManager.exchangeLetters() returns false and gives the \
    alternative message for multiple letters exchanged', () => {
        room.reserve = { content: INITIAL_RESERVE_CONTENT.map((letter) => Object.assign({ ...letter })), nbOfLetters: RESERVE_CAPACITY };
        room.board = EMPTY_BOARD;
        sinon.stub(roomManager, 'getRoomFromKey').returns(room);
        const command: ExchangeCommand = JSON.parse(JSON.stringify(DEFAULT_EXCHANGE_COMMAND));
        command.senderName = room.guestPlayer.name;
        command.letters = 'ab';
        const spy = sinon.spy(roomManager as any, 'changeTurn');
        sinon.stub(gameManagerServiceMock, 'exchangeLetters').returns(false);
        roomManager.exchange(command, room.key);
        expect(spy.called).to.be.true;
    });

    it('changeTurn() calls nextTurnInitialization()', () => {
        roomManager['changeTurn'](room);
        expect(gameManagerServiceStub.nextTurnInitialization.called).to.be.true;
    });

    it('changeTurn() calls playVirtualPlayerTurn()', (done) => {
        room = JSON.parse(JSON.stringify(TEST_ROOM_CLIENT)) as Room;
        room.gameOptions.singlePlayer = true;
        room.guestPlayer.isTurn = true;
        room.gameState = GameState.GameAccepted;
        roomManager.rooms.set(room.key, room);
        const stub = sinon.stub(roomManager as any, 'playVirtualPlayerTurn');
        roomManager['changeTurn'](room);
        setTimeout(() => {
            expect(stub.called).to.be.true;
            done();
        }, 20);
    });

    it('getRoomFromKey should return the room with the specified key', () => {
        roomManager.rooms.set(room.key, room);
        const returnValue = roomManager.getRoomFromKey(room.key);
        expect(returnValue).equal(room);
    });

    it('getRoomFromKey should throw if there is no associated room to the specified key', () => {
        const getRoomFromKey = () => {
            roomManager.getRoomFromKey(DEFAULT_ROOM.key);
        };
        expect(getRoomFromKey).throw();
    });

    it('changeTurn calls handleGameUpdate', () => {
        room.gameState = GameState.GameOver;
        room.gameOptions.singlePlayer = true;
        const handleGameEndStub = sinon.stub(roomManager as any, 'handleGameEnd');

        roomManager['changeTurn'](room);
        expect(handleGameEndStub.called).equal(true);
    });

    it('getAvailableRoom should return the room with the specified key if it is available', () => {
        roomManager.rooms.set(room.key, room);
        sinon.replace(roomManager, 'isAvailable', () => {
            return true;
        });
        const returnValue = roomManager.getAvailableRoom(room.key);
        expect(returnValue).equal(room);
    });

    it('getAvailableRoom should throw if the room with specified key is not available', () => {
        roomManager.rooms.set(room.key, room);
        sinon.replace(roomManager, 'isAvailable', () => {
            return false;
        });
        const getRoomFromKey = () => {
            roomManager.getAvailableRoom(room.key);
        };
        expect(getRoomFromKey).throw();
    });

    it('isAvailable should return true if room is available', () => {
        room.guestPlayer.socketId = '';
        room.gameOptions.singlePlayer = false;
        const returnValue = roomManager.isAvailable(room);
        expect(returnValue).equal(true);
    });

    it('isAvailable should return false if room is not available', () => {
        room.guestPlayer.socketId = 'no';
        const returnValue = roomManager.isAvailable(room);
        expect(returnValue).equal(false);
    });

    it('emitEventToRoom should call to() on the sio if the roomSockets has the socket.id', () => {
        const sioGetRoomStub = sinon.stub(roomManager['sio'].sockets.adapter.rooms, 'get');
        const returnedSockets = new Set<string>();
        returnedSockets.add('scrbl');
        returnedSockets.add('randomSocketId');
        sioGetRoomStub.returns(returnedSockets);
        roomManager['sio'].sockets.adapter.rooms.get = sioGetRoomStub;
        const sioToSpy = sinon.spy(roomManager['sio'], 'to');
        roomManager['emitEventToRoom']('eventScrabble', 'roomKey', serverSocket);
        expect(sioGetRoomStub.called).equal(true);
        expect(sioToSpy.called).equal(true);
    });

    it('handleGameEndMessage should call Tools.buildSystemRoomMessage and gameManager.finalGameResults', () => {
        const expectedMessage = Tools.buildSystemRoomMessage('', 'aLegitKey');
        const buildSystemRoomMessageStub = sinon.stub(Tools, 'buildSystemRoomMessage').returns(expectedMessage);
        gameManagerServiceStub.finalGameResults.returns('');

        roomManager['handleGameEndMessage'](room);

        expect(buildSystemRoomMessageStub.called).equal(true);
        expect(gameManagerServiceStub.finalGameResults.called).equal(true);
    });

    it("handleGameEnd should call handleGameEndMessage(), set the room's gameState to GameOver and update the room in rooms", () => {
        const handleGameEndMessageStub = sinon.stub(roomManager as any, 'handleGameEndMessage');
        room.gameState = GameState.GameAccepted;

        roomManager['handleGameEnd'](room);

        const resultingRoom = roomManager.getRoomFromKey(room.key);

        expect(handleGameEndMessageStub.called).equal(true);
        expect(room.gameState).equal(GameState.GameOver);
        expect(resultingRoom).equal(room);
        expect(highScoresService.extractHighScoreFromRoom.calledWith(room)).equal(true);
    });

    it('convertGameToSolo() calls set host', (done) => {
        playerManagerStub.setHost.returns();
        sinon.stub(roomManager as any, 'playVirtualPlayerTurn').returns('');
        roomManager.convertGameToSolo(room);
        setTimeout(() => {
            expect(playerManagerStub.setHost.called).equal(true);
            done();
        }, 20);
    });

    it("convertGameToSolo() calls playVirtualPlayerTurn when it's virtual player's turn", (done) => {
        room.guestPlayer.isTurn = true;
        room.gameOptions.singlePlayer = true;
        const playVirtualPlayerStub = sinon.stub(roomManager as any, 'playVirtualPlayerTurn');
        roomManager.convertGameToSolo(room);
        setTimeout(() => {
            expect(playVirtualPlayerStub.called).equal(true);
            done();
        }, 20);
    });

    it('convertGameToSolo() calls updateOwnerName of every objective in room', (done) => {
        room.guestPlayer.isTurn = true;
        room.gameOptions.singlePlayer = true;
        room.drawEvent = new Subject<void>();
        const playVirtualPlayerStub = sinon.stub(roomManager as any, 'playVirtualPlayerTurn');
        const objective = new DrawObjective(room);
        room.objectives = [objective];
        const stub = sinon.stub(objective, 'updateOwnerName');
        roomManager.convertGameToSolo(room);
        setTimeout(() => {
            expect(stub.called).equal(true);
            expect(playVirtualPlayerStub.called).equal(true);
            done();
        }, 20);
    });

    it("convertGameToSolo() does not calls playVirtualPlayerTurn when it's virtual player's turn", (done) => {
        room.guestPlayer.isTurn = false;
        room.gameOptions.singlePlayer = false;
        const playVirtualPlayerStub = sinon.stub(roomManager as any, 'playVirtualPlayerTurn');
        roomManager.convertGameToSolo(room);
        setTimeout(() => {
            expect(playVirtualPlayerStub.called).equal(false);
            done();
        }, 20);
    });

    it("handleAbandon should call getRoomFromKey(), gameManager.endGamePointsUpdate() and handleGameEnd() if the room's gameState \
is not GameOver", () => {
        room.gameState = GameState.GameAccepted;
        room.gameOptions.singlePlayer = true;
        const handleGameEndStub = sinon.stub(roomManager as any, 'handleGameEnd');
        const getRoomFromKeyStub = sinon.stub(roomManager, 'getRoomFromKey').returns(room);

        roomManager['handleAbandon'](room.key);

        expect(getRoomFromKeyStub.called).equal(true);
        expect(handleGameEndStub.called).equal(true);
        expect(gameManagerServiceStub.endGamePointsUpdate.called).equal(true);
    });

    it('handleAbandon should call convert game to solo when game is multiplayer', () => {
        room.gameOptions.singlePlayer = false;

        roomManager.rooms.set(room.key, room);

        const convertToSoloStub = sinon.stub(roomManager, 'convertGameToSolo');
        roomManager['handleAbandon'](room.key);
        expect(convertToSoloStub.called).equal(true);
    });

    it("handleAbandon should call getRoomFromKey(), but not gameManager.endGamePointsUpdate() and handleGameEnd() if \
the room's gameState is GameOver", () => {
        room.gameState = GameState.GameOver;
        room.gameOptions.singlePlayer = true;
        const handleGameEndStub = sinon.stub(roomManager as any, 'handleGameEnd');
        const getRoomFromKeyStub = sinon.stub(roomManager, 'getRoomFromKey').returns(room);

        roomManager['handleAbandon'](room.key);

        expect(getRoomFromKeyStub.called).equal(true);
        expect(handleGameEndStub.called).equal(false);
        expect(gameManagerServiceStub.endGamePointsUpdate.called).equal(false);
    });

    it('handleAbandon should call getRoomFromKey(), but not gameManager.endGamePointsUpdate() and handleGameEnd() if \
there is no room matching the key', () => {
        room.gameState = GameState.GameOver;
        const handleGameEndStub = sinon.stub(roomManager as any, 'handleGameEnd');
        const getRoomFromKeyStub = sinon.stub(roomManager, 'getRoomFromKey').throws();

        roomManager['handleAbandon'](room.key);

        expect(getRoomFromKeyStub.called).equal(true);
        expect(handleGameEndStub.called).equal(false);
        expect(gameManagerServiceStub.endGamePointsUpdate.called).equal(false);
    });

    it('shouldGuestStart should return true if the random value is above 1', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        sinon.stub(Math, 'random').returns(0.6);

        expect(roomManager['shouldGuestStart']()).equal(true);
    });

    it('shouldGuestStart should return true if the random value is below 1', () => {
        // eslint-disable-next-line @typescript-eslint/no-magic-numbers
        sinon.stub(Math, 'random').returns(0.4);

        expect(roomManager['shouldGuestStart']()).equal(false);
    });
});
