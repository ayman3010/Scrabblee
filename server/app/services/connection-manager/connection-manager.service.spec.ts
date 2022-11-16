/* eslint-disable no-unused-vars */
import { EMPTY_ROOM } from '@app/classes/constants/room';
import { Room } from '@app/classes/interfaces/room';
import { RoomManager } from '@app/services/room-manager/room-manager.service';
import { DEFAULT_GAME_OPTIONS } from '@common/constants/options-constants';
import { TEST_PLAYER, TEST_ROOM_CLIENT } from '@common/constants/test-room';
import { expect } from 'chai';
import * as sinon from 'sinon';
import * as io from 'socket.io';
import { ConnectionManagerService } from './connection-manager.service';

describe('connectionManager Service Tests', () => {
    let connectionService: ConnectionManagerService;
    let serverSocket: io.Socket;

    const playerName = 'John Scrabble';
    const id = 'socketId';
    const returnRoom = { ...EMPTY_ROOM };

    const playerServiceMock = {
        addPlayer: (name: string, socketId: string, room: Room) => {
            return;
        },
        removeGuest: (room: Room) => {
            return;
        },
        reconnectPlayer: (name: string, socketId: string, room: Room) => {
            return;
        },
        playerAbandoned: (room: Room, socketId: string) => {
            return;
        },
        setHost: (room: Room) => {
            return;
        },
    };

    const roomManagerMock = {
        createRoom: () => {
            return returnRoom;
        },

        deleteRoom: (roomKey: string) => {
            return true;
        },

        getAvailableRoom: (roomKey: string) => {
            return returnRoom;
        },
        getRoomFromKey: (roomKey: string) => {
            return returnRoom;
        },
        listAvailableRooms: () => {
            return;
        },
    };

    const mockBroadcastOperator = {
        disconnectSockets: () => {
            return;
        },
        socketsLeave: (sockets: string | string[]) => {
            return;
        },
    };

    const mockServerSocket = {
        emit: <T>(event: string, data?: T) => {
            return { event, data };
        },
        join: (room: string) => {
            return room;
        },
        leave: (room: string) => {
            return room;
        },
        to: (room: string) => {
            return mockBroadcastOperator;
        },
        id,
    };

    before(() => {
        const roomManager = roomManagerMock as unknown as RoomManager;
        connectionService = new ConnectionManagerService(playerServiceMock, roomManager);
    });

    beforeEach(async () => {
        serverSocket = mockServerSocket as unknown as io.Socket;
    });

    afterEach(() => {
        sinon.restore();
    });

    it('createRoom should call createRoom of roomManager then call addPlayer and join', () => {
        const createRoomSpy = sinon.spy(roomManagerMock, 'createRoom');
        const addPlayerSpy = sinon.spy(playerServiceMock, 'addPlayer');
        const joinSpy = sinon.spy(mockServerSocket, 'join');
        const gameOptions = { ...DEFAULT_GAME_OPTIONS };
        connectionService.createRoom(serverSocket, playerName, gameOptions);
        expect(createRoomSpy.called).equal(true);
        expect(addPlayerSpy.calledWith(playerName, id, returnRoom)).equal(true);
        expect(joinSpy.calledWith(returnRoom.key)).equal(true);
    });

    it('deleteRoom should call deleteRoom of roomManager', () => {
        const spy = sinon.spy(roomManagerMock, 'deleteRoom');
        connectionService.deleteRoom(serverSocket, returnRoom.key);
        expect(spy.calledWith(returnRoom.key)).equal(true);
    });

    it('joinRoom should call getAvailableRoom, addPlayer and join', () => {
        const getAvailableRoomSpy = sinon.spy(roomManagerMock, 'getAvailableRoom');
        const addPlayerSpy = sinon.spy(playerServiceMock, 'addPlayer');
        const joinSpy = sinon.spy(mockServerSocket, 'join');
        connectionService.joinRoom(serverSocket, playerName, returnRoom.key);
        expect(getAvailableRoomSpy.calledWith(returnRoom.key)).equal(true);
        expect(addPlayerSpy.calledWith(playerName, id, returnRoom)).equal(true);
        expect(joinSpy.calledWith(returnRoom.key)).equal(true);
    });

    it('joinRoom should return true if successful', () => {
        const returnValue = connectionService.joinRoom(serverSocket, 'key', returnRoom.key);
        expect(returnValue).equal(true);
    });

    it('joinRoom should return false if not successful', () => {
        const fakeGetAvailableRoom = () => {
            throw Error();
        };
        sinon.replace(roomManagerMock, 'getAvailableRoom', fakeGetAvailableRoom);
        const returnValue = connectionService.joinRoom(serverSocket, 'key', returnRoom.key);
        expect(returnValue).equal(false);
    });

    it('kickGuest should call getRoomFromKey, removeGuest and to', () => {
        const getRoomFromKeySpy = sinon.spy(roomManagerMock, 'getRoomFromKey');
        const removeGuestSpy = sinon.spy(playerServiceMock, 'removeGuest');
        const toSpy = sinon.spy(mockServerSocket, 'to');
        const socketsLeaveSpy = sinon.spy(mockBroadcastOperator, 'socketsLeave');
        connectionService.kickGuest(serverSocket, returnRoom.key);
        expect(getRoomFromKeySpy.calledWith(returnRoom.key)).equal(true);
        expect(removeGuestSpy.calledWith(returnRoom)).equal(true);
        expect(toSpy.calledWith(returnRoom.key)).equal(true);
        expect(socketsLeaveSpy.calledWith(returnRoom.guestPlayer.socketId)).equal(true);
    });

    it('kickGuest should return true if successful', () => {
        const returnValue = connectionService.kickGuest(serverSocket, returnRoom.key);
        expect(returnValue).equal(true);
    });

    it('kickGuest should return false if not successful', () => {
        const fakeGetRoomFromKey = () => {
            throw Error();
        };
        sinon.replace(roomManagerMock, 'getRoomFromKey', fakeGetRoomFromKey);
        const returnValue = connectionService.kickGuest(serverSocket, returnRoom.key);
        expect(returnValue).equal(false);
    });

    it("disconnectFromRoom should return true and call playerAbandoned() and socket.leave() if it's the host that's leaving", () => {
        const playerAbandonedStub = sinon.spy(playerServiceMock, 'playerAbandoned');
        const leaveStub = sinon.stub(mockServerSocket, 'leave');
        const returnValue = connectionService.disconnectFromRoom(serverSocket, returnRoom.key);
        expect(returnValue).equal(true);
        expect(playerAbandonedStub.calledWith(returnRoom)).equal(true);
        expect(leaveStub.calledWith(returnRoom.key)).equal(true);
    });

    it("disconnectFromRoom should return true and call playerAbandoned() and socket.leave() if it's the guest that's leaving", () => {
        const playerAbandonedStub = sinon.spy(playerServiceMock, 'playerAbandoned');
        const leaveStub = sinon.stub(mockServerSocket, 'leave');
        const returnValue = connectionService.disconnectFromRoom(serverSocket, returnRoom.key);
        expect(returnValue).equal(true);
        expect(playerAbandonedStub.calledWith(returnRoom)).equal(true);
        expect(leaveStub.calledWith(returnRoom.key)).equal(true);
    });

    it('disconnectFromRoom should return false if not successful', () => {
        const fakeGetRoomFromKey = () => {
            throw Error();
        };
        sinon.replace(roomManagerMock, 'getRoomFromKey', fakeGetRoomFromKey);
        const returnValue = connectionService.disconnectFromRoom(serverSocket, returnRoom.key);
        expect(returnValue).equal(false);
    });

    it('listAvailableRooms should call roomManager.listAvailableRooms', () => {
        const roomManagerSpy = sinon.spy(roomManagerMock, 'listAvailableRooms');
        connectionService.listAvailableRooms();
        expect(roomManagerSpy.called).equal(true);
    });

    it('should disconnect returns true when the game is single player ', () => {
        const room = JSON.parse(JSON.stringify(TEST_ROOM_CLIENT)) as Room;
        room.gameOptions.singlePlayer = false;
        expect(connectionService.shouldDisconnect(0, room)).equal(true);
    });

    it('should disconnect returns false when when there is two people in the room ', () => {
        const room = JSON.parse(JSON.stringify(TEST_ROOM_CLIENT)) as Room;
        room.gameOptions.singlePlayer = true;
        expect(connectionService.shouldDisconnect(2, room)).equal(false);
    });

    it('should disconnect returns true when when the game is multiplayer and there is no one in the room ', () => {
        const room = JSON.parse(JSON.stringify(TEST_ROOM_CLIENT)) as Room;
        room.gameOptions.singlePlayer = true;
        expect(connectionService.shouldDisconnect(0, room)).equal(true);
    });

    it('rejoinRoom should call roomManager.getRoomFromKey and playerService.reconnectPlayer and with the right parameters amd return true \
    when no error is thrown', () => {
        const spyGetRoomFromKey = sinon.spy(roomManagerMock, 'getRoomFromKey');
        const spyReconnectPlayer = sinon.spy(playerServiceMock, 'reconnectPlayer');
        const initialHostPlayer = { ...TEST_PLAYER };
        const initialGuestPlayer = { ...TEST_PLAYER, name: 'Jane Scrabble' };
        returnRoom.key = 'key';
        returnRoom.hostPlayer = initialHostPlayer;
        returnRoom.guestPlayer = initialGuestPlayer;

        const result = connectionService.rejoinRoom(serverSocket, initialHostPlayer.name, returnRoom.key);
        expect(result).equal(true);
        expect(spyGetRoomFromKey.called).equal(true);
        expect(spyGetRoomFromKey.calledWith(returnRoom.key)).equal(true);
        expect(spyReconnectPlayer.called).equal(true);
        expect(spyReconnectPlayer.calledWith(initialHostPlayer.name, serverSocket.id, returnRoom)).equal(true);
    });

    it('rejoinRoom should return false when an error is thrown', () => {
        const initialHostPlayer = { ...TEST_PLAYER };
        const initialGuestPlayer = { ...TEST_PLAYER, name: 'Jane Scrabble' };
        returnRoom.key = 'key';
        returnRoom.hostPlayer = initialHostPlayer;
        returnRoom.guestPlayer = initialGuestPlayer;
        const fakeGetRoomFromKey = () => {
            throw Error();
        };
        sinon.replace(roomManagerMock, 'getRoomFromKey', fakeGetRoomFromKey);

        const result = connectionService.rejoinRoom(serverSocket, initialHostPlayer.name, returnRoom.key);
        expect(result).equal(false);
    });
});
