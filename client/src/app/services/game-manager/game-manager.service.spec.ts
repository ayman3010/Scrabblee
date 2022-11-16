/* eslint-disable dot-notation */
/* eslint-disable max-lines */
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TO_GAME, TO_HOME } from '@app/classes/constants/routing-constants';
import { Tools } from '@app/classes/tools/tools';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { SocketTestHelper } from '@app/services/socket-client/socket-client.service.spec';
import { DEFAULT_GAME_OPTIONS } from '@common/constants/options-constants';
import { INITIAL_RESERVE_CONTENT, RESERVE_CAPACITY } from '@common/constants/reserve-constant';
import { DEFAULT_PLAYER } from '@common/constants/room-constants';
import { TEST_PLAYER, TEST_ROOM_CLIENT } from '@common/constants/test-room';
import { GameState } from '@common/enums/enums';
import { Letter } from '@common/interfaces/board-interface';
import { ReconnectionInfo } from '@common/interfaces/reconnection';
import { RoomClient } from '@common/interfaces/room';
import { Socket } from 'socket.io-client';
import { GameManagerService } from './game-manager.service';

class SocketClientServiceMock extends SocketClientService {
    override connect() {
        return;
    }
}

describe('GameManagerService', () => {
    let service: GameManagerService;
    let routerSpy: jasmine.SpyObj<Router>;
    let currentRoom: RoomClient;
    let socketHelper: SocketTestHelper;
    let socketServiceMock: SocketClientServiceMock;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        routerSpy = jasmine.createSpyObj('Router', ['navigate'], { url: TO_GAME });
        socketServiceMock = new SocketClientServiceMock();
        socketServiceMock.socket = socketHelper as unknown as Socket;
        currentRoom = { ...TEST_ROOM_CLIENT };
        currentRoom.reserve = { content: INITIAL_RESERVE_CONTENT.map((letter) => Object.assign({ ...letter })), nbOfLetters: RESERVE_CAPACITY };

        TestBed.configureTestingModule({
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: SocketClientService, useValue: socketServiceMock },
            ],
        });
        service = TestBed.inject(GameManagerService);
        service.socketHandler();
        sessionStorage.clear();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('abandonWaiting should call disconnect and call send with its currentRoom', () => {
        const spy = spyOn(socketServiceMock, 'disconnect');
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.abandonWaiting();
        expect(spy).toHaveBeenCalled();
        expect(sendSpy).toHaveBeenCalledWith('abandonWaiting', service.currentRoom);
    });

    it('connectPlayer should not call connect if socket is alive', () => {
        spyOn(socketServiceMock, 'isSocketAlive').and.callFake(() => true);
        const spy = spyOn(socketServiceMock, 'connect');
        service.connectPlayer();
        expect(spy).not.toHaveBeenCalled();
    });

    it('connectPlayer should call connect if socket is not alive', () => {
        spyOn(socketServiceMock, 'isSocketAlive').and.callFake(() => false);
        const spy = spyOn(socketServiceMock, 'connect');
        service.connectPlayer();
        expect(spy).toHaveBeenCalled();
    });

    it('getRoom should call send with getRoom', () => {
        const spy = spyOn(socketServiceMock, 'send');
        service.getRoom();
        expect(spy).toHaveBeenCalledWith('getRoom');
    });

    it('listAvailableRooms should call send with listAvailableRooms', () => {
        const spy = spyOn(socketServiceMock, 'send');
        service.listAvailableRooms();
        expect(spy).toHaveBeenCalledWith('listAvailableRooms');
    });

    it('acceptGame should call send with startGame and the room', () => {
        const spy = spyOn(socketServiceMock, 'send');
        service.acceptGame(currentRoom);
        expect(spy).toHaveBeenCalledWith('startGame', currentRoom);
    });

    it('refuseGame should call send with refuseGame and the room', () => {
        const spy = spyOn(socketServiceMock, 'send');
        service.refuseGame(currentRoom);
        expect(spy).toHaveBeenCalledWith('refuseGame', currentRoom);
    });

    it('abandonGame should call disconnect and navigate to the home page', () => {
        service.currentRoom = currentRoom;
        const expectedMessage = Tools.buildSystemRoomMessage('John Scrabble a quitté la partie.', currentRoom.key);
        const spy = spyOn(socketServiceMock, 'disconnect');
        const sendSpy = spyOn(socketServiceMock, 'send');
        service.abandonGame('John Scrabble');
        expect(spy).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith([TO_HOME]);
        expect(sendSpy).toHaveBeenCalledWith('abandonGame', expectedMessage);
    });

    it('disconnect should call disconnect on the socketService', () => {
        const spy = spyOn(socketServiceMock, 'disconnect');
        service.disconnect();
        expect(spy).toHaveBeenCalled();
    });

    it('leaveWaitingRoom should call send with refuseGame and the room', () => {
        const spy = spyOn(socketServiceMock, 'send');
        service.leaveWaitingRoom(currentRoom);
        expect(spy).toHaveBeenCalledWith('refuseGame', currentRoom);
        expect(routerSpy.navigate).toHaveBeenCalledWith([TO_HOME]);
    });

    it('createRoom should call send with createRoom and the creator name', () => {
        const spy = spyOn(socketServiceMock, 'send');
        service.createRoom(TEST_PLAYER.name, DEFAULT_GAME_OPTIONS);
        expect(spy).toHaveBeenCalledWith('createRoom', { creatorName: TEST_PLAYER.name, gameOptions: DEFAULT_GAME_OPTIONS });
    });

    it('joinRoom should call send with joinRoom and the room', () => {
        const spy = spyOn(socketServiceMock, 'send');
        service.joinRoom(currentRoom, TEST_PLAYER.name);
        expect(spy).toHaveBeenCalledWith('joinRoom', currentRoom);
    });

    it('reinitializeGame should change players to DEFAULT_PLAYER if currentRoom is defined', () => {
        service.currentRoom = currentRoom;
        service.reinitializeGame();
        expect(service.currentRoom.guestPlayer).toEqual(DEFAULT_PLAYER);
        expect(service.currentRoom.hostPlayer).toEqual(DEFAULT_PLAYER);
        expect(service.currentRoom.gameState).toEqual(GameState.WaitingForGuest);
    });

    it('reinitializeGame should call navigate to home page', () => {
        service.reinitializeGame();
        expect(routerSpy.navigate).toHaveBeenCalledWith([TO_HOME]);
    });

    it('buildLetters should transform a rack into an array of Letter', () => {
        const expectedArray: Letter[] = [
            { letter: 'O', value: 1 },
            { letter: 'U', value: 1 },
            { letter: 'I', value: 1 },
        ];
        const returnValue = service.buildLetters({
            content: [
                { letter: 'o', value: 1 },
                { letter: 'u', value: 1 },
                { letter: 'i', value: 1 },
            ],
        });
        expect(returnValue).toEqual(expectedArray);
    });

    it('getRack should return the host rack if it is the currentPlayer', () => {
        service.currentRoom = currentRoom;
        service.currentRoom.hostPlayer = { ...TEST_PLAYER };
        service.currentRoom.hostPlayer.rack = {
            content: [
                { letter: 't', value: 1 },
                { letter: 'e', value: 1 },
                { letter: 's', value: 1 },
                { letter: 't', value: 1 },
            ],
        };
        service.playerId = service.currentRoom.hostPlayer.socketId;
        expect(service.rack).toEqual(service.currentRoom.hostPlayer.rack);
    });

    it('getRack should return the guest rack if it is the currentPlayer', () => {
        service.currentRoom = currentRoom;
        service.currentRoom.guestPlayer = { ...TEST_PLAYER };
        service.currentRoom.guestPlayer.rack = {
            content: [
                { letter: 't', value: 1 },
                { letter: 'e', value: 1 },
                { letter: 's', value: 1 },
                { letter: 't', value: 1 },
            ],
        };
        service.playerId = service.currentRoom.guestPlayer.socketId;
        expect(service.rack).toEqual(service.currentRoom.guestPlayer.rack);
    });

    it('currentPlayer getter should return the host if it is the currentPlayer', () => {
        service.currentRoom = currentRoom;
        service.currentRoom.hostPlayer = { ...TEST_PLAYER };
        service.playerId = service.currentRoom.hostPlayer.socketId;
        expect(service.currentPlayer).toEqual(service.currentRoom.hostPlayer);
    });

    it('currentPlayer getter should return the guest if it is the currentPlayer', () => {
        service.currentRoom = currentRoom;
        service.currentRoom.guestPlayer = { ...TEST_PLAYER };
        service.playerId = service.currentRoom.guestPlayer.socketId;
        expect(service.currentPlayer).toEqual(service.currentRoom.guestPlayer);
    });

    it('isTurn getter should return the isTurn of the currentPlayer', () => {
        service.currentRoom = currentRoom;
        const currentPlayer = { ...TEST_PLAYER, isTurn: true };
        spyOnProperty(service, 'currentPlayer', 'get').and.returnValue(currentPlayer);
        service.playerId = service.currentRoom.guestPlayer.socketId;
        expect(service.isTurn).toEqual(true);
    });

    it('reserveSize getter should return the number of letters left in the reserve of the currentRoom', () => {
        const expectedSize = 69;
        currentRoom.reserve.nbOfLetters = expectedSize;
        service.currentRoom = currentRoom;

        expect(service.reserveSize).toEqual(expectedSize);
    });

    it('socketHandler should call on the correct number of times', () => {
        const expectedTimes = 5;
        const spy = spyOn(socketServiceMock, 'on');
        service.socketHandler();
        expect(spy).toHaveBeenCalledTimes(expectedTimes);
    });

    it('should update availableRooms on signal listOfAvailableRooms', () => {
        const listRooms = [currentRoom];
        socketHelper.peerSideEmit('listOfAvailableRooms', listRooms);
        expect(service.availableRooms).toEqual(listRooms);
    });

    it('should update currentRoom on signal updateRoom', () => {
        const expectedRoom = currentRoom;
        socketHelper.peerSideEmit('updateRoom', expectedRoom);
        expect(service.currentRoom).toEqual(expectedRoom);
    });

    it('should update currentRoom on signal gameAccepted', fakeAsync(() => {
        socketServiceMock.socket.id = 'id';
        const expectedRoom = currentRoom;
        const spy = spyOn(service.rackEvent, 'next');
        socketHelper.peerSideEmit('gameAccepted', expectedRoom);
        tick(2);
        expect(service.currentRoom).toEqual(expectedRoom);
        expect(routerSpy.navigate).toHaveBeenCalledBefore(spy);
    }));

    it("should make the playerID as '' on signal gameAccepted if socketService.socketID is undefined", () => {
        socketServiceMock.socket.id = '';
        const expectedRoom = currentRoom;
        socketHelper.peerSideEmit('gameAccepted', expectedRoom);
        expect(service.currentRoom).toEqual(expectedRoom);
    });

    it('should update currentRoom on signal turnChanged', () => {
        const expectedRoom = currentRoom;
        expectedRoom.hostPlayer = { ...TEST_PLAYER };
        service.currentRoom = { ...expectedRoom };
        expectedRoom.timer++;
        const rackSpy = spyOn(service.rackEvent, 'next');
        const boardSpy = spyOn(service.boardEvent, 'next');
        socketHelper.peerSideEmit('turnChanged', expectedRoom);
        expect(service.currentRoom).toEqual(expectedRoom);
        expect(rackSpy).toHaveBeenCalled();
        expect(boardSpy).toHaveBeenCalled();
    });

    it('should update currentRoom and call next on roomEvent with the new room on signal gameOver', () => {
        const expectedRoom = currentRoom;
        expectedRoom.hostPlayer = { ...TEST_PLAYER };
        service.currentRoom = { ...expectedRoom };
        expectedRoom.timer++;

        const roomSpy = spyOn(service.roomEvent, 'next');

        socketHelper.peerSideEmit('gameOver', expectedRoom);

        expect(service.currentRoom).toEqual(expectedRoom);
        expect(roomSpy).toHaveBeenCalledWith(expectedRoom);
    });

    it("connectPlayer should not call this.rejoinRoom() if the cache doesn't contain a roomKey", () => {
        sessionStorage.setItem('roomKey', 'key');
        sessionStorage.setItem('playerName', 'John Scrabble');
        sessionStorage.removeItem('roomKey');

        const spy = spyOn(service, 'rejoinRoom');

        service.connectPlayer();

        expect(spy).not.toHaveBeenCalled();
    });

    it("connectPlayer should not call this.rejoinRoom() if the cache doesn't contain a playerName", () => {
        sessionStorage.setItem('roomKey', 'key');
        sessionStorage.setItem('playerName', 'John Scrabble');
        sessionStorage.removeItem('playerName');

        const spy = spyOn(service, 'rejoinRoom');

        service.connectPlayer();

        expect(spy).not.toHaveBeenCalled();
    });

    it('connectPlayer should call rejoinRoom() and socketService.on() if the cache contains a roomKey and a playerName', () => {
        sessionStorage.setItem('roomKey', 'key');
        sessionStorage.setItem('playerName', 'John Scrabble');

        const spyRejoin = spyOn(service, 'rejoinRoom');
        const spySocketOn = spyOn(socketServiceMock, 'on');

        service.connectPlayer();

        expect(spyRejoin).toHaveBeenCalled();
        expect(spySocketOn).toHaveBeenCalled();
    });

    it('when roomRejoined event is received with a room, should update currentRoom, playerId and call next on roomEvent and rackEvent', () => {
        sessionStorage.setItem('roomKey', 'key');
        sessionStorage.setItem('playerName', 'John Scrabble');

        service.connectPlayer();

        const spyRoomEvent = spyOn(service.roomEvent, 'next');
        const spyRackEvent = spyOn(service.rackEvent, 'next');
        const expectedRoom = { ...TEST_ROOM_CLIENT, key: 'alt-key' };

        socketHelper.peerSideEmit('roomRejoined', expectedRoom);

        expect(spyRoomEvent).toHaveBeenCalled();
        expect(spyRackEvent).toHaveBeenCalled();
        expect(service.currentRoom).toEqual(expectedRoom);
        expect(service.playerId).toEqual(socketServiceMock.socketID);
    });

    it('when roomRejoined event is received with a room, should update currentRoom, playerId and call next on roomEvent and rackEvent', () => {
        sessionStorage.setItem('roomKey', 'key');
        sessionStorage.setItem('playerName', 'John Scrabble');
        Object.defineProperty(routerSpy, 'url', {
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            get() {
                return TO_HOME;
            },
        });

        service.connectPlayer();

        const spyRoomEvent = spyOn(service.roomEvent, 'next');
        const spyRackEvent = spyOn(service.rackEvent, 'next');
        const expectedRoom = { ...TEST_ROOM_CLIENT, key: 'alt-key' };

        socketHelper.peerSideEmit('roomRejoined', expectedRoom);

        expect(spyRoomEvent).not.toHaveBeenCalled();
        expect(spyRackEvent).not.toHaveBeenCalled();
    });

    it('when roomRejoined event is received without a room, should not update currentRoom or playerId, and should not call \
    next on roomEvent or rackEvent', () => {
        sessionStorage.setItem('roomKey', 'key');
        sessionStorage.setItem('playerName', 'John Scrabble');
        service.playerId = 'notJohnScrabble';

        service.connectPlayer();

        const spyRoomEvent = spyOn(service.roomEvent, 'next');
        const spyRackEvent = spyOn(service.rackEvent, 'next');
        const expectedRoom = { ...TEST_ROOM_CLIENT, key: 'alt-key' };

        socketHelper.peerSideEmit('roomRejoined', undefined);

        expect(spyRoomEvent).not.toHaveBeenCalled();
        expect(spyRackEvent).not.toHaveBeenCalled();
        expect(service.currentRoom).not.toEqual(expectedRoom);
        expect(service.playerId).not.toEqual(socketServiceMock.socketID);
    });

    it('connectPlayer should call reconnectPlayer() ', () => {
        const spy = spyOn(service, 'reconnectPlayer');
        service.connectPlayer();
        expect(spy).toHaveBeenCalled();
    });

    it('reconnectPlayer should call rejoinRoom() if the cache contains a roomKey and a playerName', () => {
        sessionStorage.setItem('roomKey', 'key');
        sessionStorage.setItem('playerName', 'John Scrabble');

        service.reconnectPlayer();

        const spyRoomEvent = spyOn(service.roomEvent, 'next');
        const spyRackEvent = spyOn(service.rackEvent, 'next');
        const expectedRoom = { ...TEST_ROOM_CLIENT, key: 'alt-key' };

        socketHelper.peerSideEmit('roomRejoined', expectedRoom);

        expect(spyRoomEvent).toHaveBeenCalled();
        expect(spyRackEvent).toHaveBeenCalled();
        expect(service.currentRoom).toEqual(expectedRoom);
        expect(service.playerId).toEqual(socketServiceMock.socketID);
    });

    it('rejoinRoom should set the playerName in the sessionStorage and call socketService.send with the right arguments', () => {
        sessionStorage.setItem('roomKey', 'key');
        sessionStorage.setItem('playerName', 'John Scrabble');

        const info: ReconnectionInfo = { roomKey: 'key', playerName: 'John Scrabble2' };
        const spy = spyOn(socketServiceMock, 'send');

        service.rejoinRoom(info);

        const newPlayerName = sessionStorage.getItem('playerName');

        expect(newPlayerName).toEqual(info.playerName);
        expect(spy).toHaveBeenCalledWith('rejoinRoom', info);
    });
});
