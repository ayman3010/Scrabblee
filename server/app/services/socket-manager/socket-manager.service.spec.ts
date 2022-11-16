/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */
/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable dot-notation */
import { LETTERS_VALUE } from '@app/classes/constants/board-constant';
import { TEST_ROOM } from '@app/classes/constants/room';
import { Room } from '@app/classes/interfaces/room';
import { DEFAULT_COMMAND, DEFAULT_EXCHANGE_COMMAND, DEFAULT_PLACE_COMMAND } from '@common/constants/command-constants';
import { DEFAULT_GAME_OPTIONS } from '@common/constants/options-constants';
import { DEFAULT_ROOM_MESSAGE, EMPTY_BOARD } from '@common/constants/room-constants';
import { SECONDS_IN_MINUTE } from '@common/constants/time-constants';
import { CommandType, GameState, Orientation } from '@common/enums/enums';
import { Command, ExchangeCommand, PlaceCommand } from '@common/interfaces/command-interface';
import { ReconnectionInfo } from '@common/interfaces/reconnection';
import { Server } from 'app/server';
import { expect } from 'chai';
import { Subject } from 'rxjs';
import * as sinon from 'sinon';
import { io as ioClient, Socket } from 'socket.io-client';
import { Container } from 'typedi';
import { SocketManager } from './socket-manager.service';

const RESPONSE_DELAY = 25;
const MEDIUM_RESPONSE_DELAY = 75;
const LONG_RESPONSE_DELAY = 1000;
describe('SocketManager Service Tests', () => {
    let socketManager: SocketManager;
    let server: Server;
    let clientSocket: Socket;

    const DEFAULT_ROOM: Room = {
        key: 'randomKey',
        hostPlayer: { name: '', socketId: '', isTurn: true, rack: { content: [] }, points: 0, abandoned: false },
        guestPlayer: { name: '', socketId: '', isTurn: true, rack: { content: [] }, points: 0, abandoned: false },
        timer: SECONDS_IN_MINUTE,
        gameState: GameState.WaitingForGuest,
        board: EMPTY_BOARD,
        nbOfTurns: 0,
        reserve: {
            nbOfLetters: 0,
            content: [
                { letter: 'a', nbOfCopies: 9 },
                { letter: 'b', nbOfCopies: 2 },
                { letter: 'c', nbOfCopies: 2 },
            ],
        },
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

    const urlString = 'http://localhost:3000';

    beforeEach((done) => {
        const timeout = setTimeout(() => {
            done();
        }, 5 * LONG_RESPONSE_DELAY);
        if (clientSocket) clientSocket.disconnect();
        sinon.restore();
        if (socketManager)
            socketManager['sio'].close(() => {
                clearTimeout(timeout);
                done();
            });
        else {
            clearTimeout(timeout);
            done();
        }
    });

    beforeEach(() => {
        server = Container.get(Server);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sinon.stub(server as any, 'connectToDatabase');
        server['socketManager']['reconnectionMaxTime'] = 20;
        server.init();
        socketManager = server['socketManager'];
        // We do not want to display that the server is listening on port 3000 for every test
        sinon.stub(console, 'log');
        sinon.stub(socketManager['roomManager']['gamesHistoryService'], 'extractGameHistory');
    });

    beforeEach((done) => {
        const timeout = setTimeout(() => {
            done();
        }, 5 * LONG_RESPONSE_DELAY);
        let isDone = false;
        socketManager['sio'].on('connection', (socket) => {
            if (!isDone) {
                isDone = true;
                clearTimeout(timeout);
                done();
            }
        });
        clientSocket = ioClient(urlString);
    });

    it('should call createRoom() method', (done) => {
        const returnedRoom: Room = JSON.parse(JSON.stringify(DEFAULT_ROOM));
        returnedRoom.gameOptions.singlePlayer = false;
        const stub = sinon.stub(socketManager['connectionService'], 'createRoom').returns(returnedRoom);
        sinon.stub(socketManager as any, 'updateAvailableRooms');
        clientSocket.emit('createRoom', 'creatorName', returnedRoom.gameOptions);
        setTimeout(() => {
            expect(stub.called).to.be.true;
            done();
        }, RESPONSE_DELAY);
    });

    it('should call startGame() method on createRoom event if the game is in singleplayer', (done) => {
        const returnedRoom: Room = JSON.parse(JSON.stringify(DEFAULT_ROOM));
        returnedRoom.gameOptions.singlePlayer = true;
        sinon.stub(socketManager['connectionService'], 'createRoom').returns(returnedRoom);
        const stub = sinon.stub(socketManager['roomManager'], 'startGame');
        sinon.stub(socketManager as any, 'updateAvailableRooms');

        clientSocket.emit('createRoom', 'creatorName');
        setTimeout(() => {
            expect(stub.called).to.be.true;
            done();
        }, MEDIUM_RESPONSE_DELAY * 2);
    });

    it('rejoinRoom should not call roomManager.getRoomFromKey if rejoinRoom returns false', (done) => {
        const room = JSON.parse(JSON.stringify(DEFAULT_ROOM));
        const info: ReconnectionInfo = { playerName: room.guestPlayer.name, roomKey: room.key };
        room.hostPlayer.socketId = clientSocket.id;
        sinon.stub(socketManager as any, 'updateAvailableRooms');
        const rejoinStub = sinon.stub(socketManager['connectionService'], 'rejoinRoom');
        rejoinStub.returns(false);
        const getRoomStub = sinon.stub(socketManager['roomManager'], 'getRoomFromKey').returns(room);
        clientSocket.emit('rejoinRoom', info);
        setTimeout(() => {
            expect(!getRoomStub.called);
            done();
        }, 5);
    });

    it('joinRoom should not call roomManager.getRoomFromKey if joinRoom returns false', (done) => {
        const room = JSON.parse(JSON.stringify(DEFAULT_ROOM));
        room.hostPlayer.socketId = clientSocket.id;
        sinon.stub(socketManager as any, 'updateAvailableRooms');
        const joinStub = sinon.stub(socketManager['connectionService'], 'joinRoom');
        joinStub.returns(false);
        const getRoomStub = sinon.stub(socketManager['roomManager'], 'getRoomFromKey').returns(room);
        clientSocket.emit('joinRoom', room);
        setTimeout(() => {
            expect(!getRoomStub.called);
            done();
        }, 5);
    });

    it('rejoinRoom should call roomManager.getRoomFromKey if rejoinRoom returns true', (done) => {
        const room = JSON.parse(JSON.stringify(DEFAULT_ROOM));
        const info: ReconnectionInfo = { playerName: room.guestPlayer.name, roomKey: room.key };
        room.hostPlayer.socketId = clientSocket.id;
        sinon.stub(socketManager as any, 'updateAvailableRooms');
        const rejoinStub = sinon.stub(socketManager['connectionService'], 'rejoinRoom');
        rejoinStub.returns(true);
        const getRoomStub = sinon.stub(socketManager['roomManager'], 'getRoomFromKey').returns(room);
        clientSocket.emit('rejoinRoom', info);
        setTimeout(() => {
            expect(rejoinStub.called).to.be.true;
            expect(getRoomStub.called).to.be.true;
            done();
        }, MEDIUM_RESPONSE_DELAY);
    });

    it('should call joinRoom() method', (done) => {
        const room = DEFAULT_ROOM;
        room.hostPlayer.socketId = clientSocket.id;
        const joinStub = sinon.stub(socketManager['connectionService'], 'joinRoom');
        sinon.stub(socketManager as any, 'updateAvailableRooms');
        joinStub.returns(true);
        const getRoomStub = sinon.stub(socketManager['roomManager'], 'getRoomFromKey').returns(room);
        clientSocket.emit('joinRoom', room);
        setTimeout(() => {
            expect(joinStub.called).to.be.true;
            expect(getRoomStub.called).to.be.true;
            done();
        }, MEDIUM_RESPONSE_DELAY);
    });

    it('disconnect should call connectionService.disconnectFromRoom and roomManager.handleAbandon if there \
is only one person left in the room, but not deleteRoom', (done) => {
        const room = DEFAULT_ROOM;
        room.hostPlayer.socketId = clientSocket.id;
        const disconnectFromRoomStub = sinon.stub(socketManager['connectionService'], 'disconnectFromRoom');
        const handleAbandonStub = sinon.stub(socketManager['roomManager'], 'handleAbandon');
        const getRoomStub = sinon.stub(socketManager['roomManager'], 'getRoom');
        getRoomStub.returns('scrbl');
        const sioGetRoomStub = sinon.stub(socketManager['sio'].sockets.adapter.rooms, 'get');
        socketManager['sio'].sockets.adapter.rooms.get = sioGetRoomStub;
        const returnedSockets = new Set<string>();
        returnedSockets.add('scrbl');
        sioGetRoomStub.returns(returnedSockets);
        disconnectFromRoomStub.returns(false);
        const deleteRoomStub = sinon.stub(socketManager['connectionService'], 'deleteRoom');
        sinon.stub(socketManager['roomManager'], 'getRoomFromKey').returns(TEST_ROOM);
        sinon.stub(socketManager['connectionService'], 'shouldDisconnect').returns(true);
        clientSocket.disconnect();
        setTimeout(() => {
            expect(socketManager['sio'].sockets.adapter.rooms.get('scrbl')).eql(returnedSockets);
            expect(getRoomStub.called).to.be.true;
            expect(disconnectFromRoomStub.called).to.be.true;
            expect(sioGetRoomStub.called).to.be.true;
            expect(handleAbandonStub.called).to.be.true;
            expect(deleteRoomStub.called).to.be.false;
            socketManager = server['socketManager'];
            done();
        }, RESPONSE_DELAY * 4);
    });

    it('disconnect should not call connectionService.disconnectFromRoom and roomManager.handleAbandon \
and deleteRoom if there is two people left in the room', (done) => {
        const room = DEFAULT_ROOM;
        room.hostPlayer.socketId = clientSocket.id;
        const disconnectFromRoomStub = sinon.stub(socketManager['connectionService'], 'disconnectFromRoom');
        const handleAbandonStub = sinon.stub(socketManager['roomManager'], 'handleAbandon');
        const getRoomStub = sinon.stub(socketManager['roomManager'], 'getRoom');
        getRoomStub.returns('scrbl');
        const sioGetRoomStub = sinon.stub(socketManager['sio'].sockets.adapter.rooms, 'get');
        const returnedSockets = new Set<string>();
        returnedSockets.add('scrbl');
        returnedSockets.add('scrbl2');
        sioGetRoomStub.returns(returnedSockets);
        socketManager['sio'].sockets.adapter.rooms.get = sioGetRoomStub;
        disconnectFromRoomStub.returns(false);
        const deleteRoomStub = sinon.stub(socketManager['connectionService'], 'deleteRoom');
        sinon.stub(socketManager['roomManager'], 'getRoomFromKey').returns(TEST_ROOM);
        sinon.stub(socketManager['connectionService'], 'shouldDisconnect').returns(false);
        clientSocket.disconnect();
        setTimeout(() => {
            expect(getRoomStub.called).to.be.true;
            expect(disconnectFromRoomStub.called).to.be.false;
            expect(handleAbandonStub.called).to.be.false;
            expect(sioGetRoomStub.called).to.be.true;
            expect(deleteRoomStub.called).to.be.false;
            socketManager = server['socketManager'];
            done();
        }, RESPONSE_DELAY * 4);
    });

    it('disconnect should call connectionService.disconnectFromRoom and roomManager.handleAbandon \
and deleteRoom if there is nobody left in the room', (done) => {
        const room = DEFAULT_ROOM;
        room.hostPlayer.socketId = clientSocket.id;
        const disconnectFromRoomStub = sinon.stub(socketManager['connectionService'], 'disconnectFromRoom');
        const handleAbandonStub = sinon.stub(socketManager['roomManager'], 'handleAbandon');
        const getRoomStub = sinon.stub(socketManager['roomManager'], 'getRoom');
        getRoomStub.returns('scrbl');
        const sioGetRoomStub = sinon.stub(socketManager['sio'].sockets.adapter.rooms, 'get');
        const returnedSockets = new Set<string>();
        sioGetRoomStub.returns(returnedSockets);
        socketManager['sio'].sockets.adapter.rooms.get = sioGetRoomStub;
        disconnectFromRoomStub.returns(false);
        const deleteRoomStub = sinon.stub(socketManager['connectionService'], 'deleteRoom');
        sinon.stub(socketManager['roomManager'], 'getRoomFromKey').returns(TEST_ROOM);
        sinon.stub(socketManager['connectionService'], 'shouldDisconnect').returns(true);
        clientSocket.disconnect();
        setTimeout(() => {
            expect(getRoomStub.called).to.be.true;
            expect(disconnectFromRoomStub.called).to.be.true;
            expect(handleAbandonStub.called).to.be.true;
            expect(sioGetRoomStub.called).to.be.true;
            expect(deleteRoomStub.called).to.be.true;
            socketManager = server['socketManager'];
            done();
        }, RESPONSE_DELAY * 5);
    });

    it('disconnect should not call connectionService.disconnectFromRoom and roomManager.handleAbandon \
and deleteRoom if there is no room associated with that socket', (done) => {
        const room = DEFAULT_ROOM;
        room.hostPlayer.socketId = clientSocket.id;

        const disconnectFromRoomStub = sinon.stub(socketManager['connectionService'], 'disconnectFromRoom');
        const handleAbandonStub = sinon.stub(socketManager['roomManager'], 'handleAbandon');
        const getRoomStub = sinon.stub(socketManager['roomManager'], 'getRoom');
        getRoomStub.returns('scrbl');
        const sioGetRoomStub = sinon.stub(socketManager['sio'].sockets.adapter.rooms, 'get');
        sioGetRoomStub.returns(undefined);
        socketManager['sio'].sockets.adapter.rooms.get = sioGetRoomStub;
        disconnectFromRoomStub.returns(false);
        const deleteRoomStub = sinon.stub(socketManager['connectionService'], 'deleteRoom');
        const error = new Error('some fake error');
        sinon.stub(socketManager['roomManager'], 'getRoomFromKey').throws(error);
        sinon.stub(socketManager['connectionService'], 'shouldDisconnect').returns(false);
        clientSocket.disconnect();
        setTimeout(() => {
            expect(getRoomStub.called).to.be.true;
            expect(disconnectFromRoomStub.called).to.be.false;
            expect(handleAbandonStub.called).to.be.false;
            expect(sioGetRoomStub.called).to.be.true;
            expect(deleteRoomStub.called).to.be.false;
            socketManager = server['socketManager'];
            done();
        }, RESPONSE_DELAY * 2);
    });

    it('should call updateAvailableRooms() method on listAvailableRooms event', (done) => {
        const stub = sinon.stub(socketManager as any, 'updateAvailableRooms');
        clientSocket.emit('listAvailableRooms');
        setTimeout(() => {
            expect(stub.called).to.be.true;
            done();
        }, RESPONSE_DELAY);
    });

    it('should call sendToRoom() method on roomMessage event', (done) => {
        const roomMessage = DEFAULT_ROOM_MESSAGE;
        const spy = sinon.stub(socketManager['roomManager'], 'sendToRoom');
        clientSocket.emit('roomMessage', roomMessage);
        setTimeout(() => {
            expect(spy.called).to.be.true;
            done();
        }, RESPONSE_DELAY);
    });

    it('should call sendToRoom(), disconnectFromRoom() and handleAbandon() method on abandonGame event', (done) => {
        const roomMessage = DEFAULT_ROOM_MESSAGE;
        const sendToRoomStub = sinon.stub(socketManager['roomManager'], 'sendToRoom');
        const disconnectFromRoomStub = sinon.stub(socketManager['connectionService'], 'disconnectFromRoom');
        const handleAbandonStub = sinon.stub(socketManager['roomManager'], 'handleAbandon');
        clientSocket.emit('abandonGame', roomMessage);
        setTimeout(() => {
            expect(sendToRoomStub.called).to.be.true;
            expect(disconnectFromRoomStub.called).to.be.true;
            expect(handleAbandonStub.called).to.be.true;
            done();
        }, RESPONSE_DELAY);
    });

    it('should call getRoom() method', (done) => {
        const spy = sinon.stub(socketManager['roomManager'], 'getRoom');
        clientSocket.emit('getRoom');
        setTimeout(() => {
            expect(spy.called).to.be.true;
            done();
        }, RESPONSE_DELAY);
    });

    it('should call skipTurn() method on turnChanged event', (done) => {
        const room = DEFAULT_ROOM;
        room.hostPlayer.socketId = clientSocket.id;
        const spy = sinon.stub(socketManager['roomManager'], 'skipTurn');
        clientSocket.emit('skipTurn', room);
        setTimeout(() => {
            expect(spy.called).to.be.true;
            done();
        }, MEDIUM_RESPONSE_DELAY);
    });

    it('should call startGame() method on startGame event', (done) => {
        const room = DEFAULT_ROOM;
        room.hostPlayer.socketId = clientSocket.id;
        const spy = sinon.stub(socketManager['roomManager'], 'startGame');
        clientSocket.emit('startGame', room);
        setTimeout(() => {
            expect(spy.called).to.be.true;
            done();
        }, RESPONSE_DELAY * 4);
    });

    it('should call kickGuest() method on refuseGame event', (done) => {
        const room = DEFAULT_ROOM;
        room.hostPlayer.socketId = clientSocket.id;
        sinon.stub(socketManager as any, 'updateAvailableRooms');
        sinon.stub(socketManager['roomManager'], 'getRoomFromKey').returns(TEST_ROOM);
        const kickStub = sinon.stub(socketManager['connectionService'], 'kickGuest');
        kickStub.returns(true);
        clientSocket.emit('refuseGame', room);
        setTimeout(() => {
            expect(kickStub.called).to.be.true;
            done();
        }, RESPONSE_DELAY * 5);
    });

    it('should not call refuseGame() method on refuseGame event if kickGuest returns false', (done) => {
        const room = DEFAULT_ROOM;
        room.hostPlayer.socketId = clientSocket.id;
        sinon.stub(socketManager as any, 'updateAvailableRooms');
        const kickStub = sinon.stub(socketManager['connectionService'], 'kickGuest');
        kickStub.returns(false);
        clientSocket.emit('refuseGame', room);
        setTimeout(() => {
            expect(kickStub.called).to.be.true;
            done();
        }, RESPONSE_DELAY * 4);
    });

    it('should call abandonWaiting() method on abandonWaiting event', (done) => {
        const room = DEFAULT_ROOM;
        room.hostPlayer.socketId = clientSocket.id;
        sinon.stub(socketManager as any, 'updateAvailableRooms');
        const spy = sinon.stub(socketManager['connectionService'], 'deleteRoom');
        clientSocket.emit('abandonWaiting', room);
        setTimeout(() => {
            expect(spy.called).to.be.true;
            done();
        }, RESPONSE_DELAY);
    });

    it('should not call abandonWaiting() method on abandonWaiting event with no room', (done) => {
        const room = DEFAULT_ROOM;
        room.hostPlayer.socketId = clientSocket.id;
        sinon.stub(socketManager as any, 'updateAvailableRooms');
        const stub = sinon.stub(socketManager['connectionService'], 'deleteRoom');
        clientSocket.emit('abandonWaiting', undefined);
        setTimeout(() => {
            expect(stub.called).to.be.false;
            done();
        }, RESPONSE_DELAY);
    });

    it('should call playTurn() method on sendCommand event when command is a place command', (done) => {
        const room = DEFAULT_ROOM;
        const command: PlaceCommand = DEFAULT_PLACE_COMMAND;
        command.commandType = CommandType.Place;
        command.placement = { coordH: 7, coordV: 7 };
        command.lettersToPlace = 'ab';
        command.orientation = Orientation.Horizontal;
        room.hostPlayer.socketId = clientSocket.id;
        const stub = sinon.stub(socketManager['roomManager'], 'playTurn');
        clientSocket.emit('sendCommand', { room, command });
        setTimeout(() => {
            expect(stub.called).to.be.true;
            done();
        }, RESPONSE_DELAY);
    });

    it('should call getHint() method on sendCommand event when command is a hint command', (done) => {
        const room = DEFAULT_ROOM;
        const command: Command = { ...DEFAULT_COMMAND };
        command.commandType = CommandType.Hint;
        room.hostPlayer.socketId = clientSocket.id;
        const stub = sinon.stub(socketManager['roomManager'], 'getHint');
        clientSocket.emit('sendCommand', { room, command });
        setTimeout(() => {
            expect(stub.called).to.be.true;
            done();
        }, RESPONSE_DELAY);
    });

    it('should call exchange() method on sendCommand event when command is an exchange command', (done) => {
        const room = DEFAULT_ROOM;
        room.hostPlayer.rack = {
            content: [
                { letter: 'a', value: LETTERS_VALUE['a'] },
                { letter: 'b', value: LETTERS_VALUE['b'] },
                { letter: 'a', value: LETTERS_VALUE['a'] },
                { letter: 'a', value: LETTERS_VALUE['a'] },
                { letter: 'a', value: LETTERS_VALUE['a'] },
                { letter: 'a', value: LETTERS_VALUE['a'] },
                { letter: 'a', value: LETTERS_VALUE['a'] },
            ],
        };
        room.guestPlayer.rack = {
            content: [
                { letter: 'a', value: LETTERS_VALUE['a'] },
                { letter: 'b', value: LETTERS_VALUE['b'] },
                { letter: 'a', value: LETTERS_VALUE['a'] },
                { letter: 'a', value: LETTERS_VALUE['a'] },
                { letter: 'a', value: LETTERS_VALUE['a'] },
                { letter: 'a', value: LETTERS_VALUE['a'] },
                { letter: 'a', value: LETTERS_VALUE['a'] },
            ],
        };
        const command: ExchangeCommand = DEFAULT_EXCHANGE_COMMAND;
        command.commandType = CommandType.Exchange;
        command.letters = 'ab';
        room.hostPlayer.socketId = clientSocket.id;
        const spy = sinon.stub(socketManager['roomManager'], 'exchange');
        clientSocket.emit('sendCommand', { room, command });
        setTimeout(() => {
            expect(spy.called).to.be.true;
            done();
        }, RESPONSE_DELAY);
    });

    it('updateAvailableRooms should call emit with the proper arguments', () => {
        const stub = sinon.stub(socketManager['sio'], 'emit');
        socketManager['updateAvailableRooms']();
        expect(stub.calledWith('listOfAvailableRooms', socketManager['connectionService'].listAvailableRooms())).to.be.true;
    });

    it('should call handleTimer', (done) => {
        const spy = sinon.stub(socketManager['roomManager'], 'handleTimer');
        socketManager['roomManager'].rooms.set(DEFAULT_ROOM.key, DEFAULT_ROOM);
        setTimeout(() => {
            expect(spy.called).equals(true);
            done();
        }, LONG_RESPONSE_DELAY);
    });
});
