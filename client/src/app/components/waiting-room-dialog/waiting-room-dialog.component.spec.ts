import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TEST_ROOM_CLIENT } from '@common/constants/test-room';
import { GameState } from '@common/enums/enums';
import { RoomClient } from '@common/interfaces/room';
import { Subject } from 'rxjs';
import { WaitingRoomDialogComponent } from './waiting-room-dialog.component';

describe('WaitingRoomDialogComponent', () => {
    let component: WaitingRoomDialogComponent;
    let fixture: ComponentFixture<WaitingRoomDialogComponent>;
    let socketServiceSpy: jasmine.SpyObj<SocketClientService>;
    let undefinedRoom: RoomClient;

    let currentRoom: RoomClient;
    let socketService: jasmine.SpyObj<SocketClientService>;

    let roomEvent: Subject<RoomClient>;

    class MatDialogRefMock {
        close(): void {
            return;
        }
    }

    const getRoom = () => {
        return;
    };

    const socketHandler = () => {
        return;
    };

    const acceptGame = () => {
        return;
    };

    const refuseGame = () => {
        return;
    };

    const abandonWaiting = () => {
        return;
    };

    let gameManagerServiceStub: Partial<GameManagerService>;

    beforeEach(() => {
        roomEvent = new Subject<RoomClient>();
        socketServiceSpy = jasmine.createSpyObj('SocketClientService', ['connect', 'isSocketAlive']);
        socketService = jasmine.createSpyObj('socketClientService', ['disconnect']);

        currentRoom = { ...TEST_ROOM_CLIENT };

        gameManagerServiceStub = {
            currentRoom,
            socketService,
            getRoom,
            socketHandler,
            acceptGame,
            refuseGame,
            abandonWaiting,
            roomEvent,
        };
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatProgressSpinnerModule],
            declarations: [WaitingRoomDialogComponent],
            providers: [
                { provide: SocketClientService, useValue: socketServiceSpy },
                { provide: MatDialogRef, useClass: MatDialogRefMock },
                { provide: GameManagerService, useValue: gameManagerServiceStub },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngOnInit should call getRoom and socketHandler from gameManagerService', () => {
        gameManagerServiceStub.getRoom = jasmine.createSpy('getRoom').and.stub();
        gameManagerServiceStub.socketHandler = jasmine.createSpy('socketHandler').and.stub();
        component.ngOnInit();
        expect(gameManagerServiceStub.getRoom).toHaveBeenCalled();
        expect(gameManagerServiceStub.socketHandler).toHaveBeenCalled();
    });

    it('should initially take the currentRoom of gameManagerService', () => {
        expect(component.room).toEqual(currentRoom);
    });

    it('roomIsJoined should return false if game is waiting for guest or refused', () => {
        component.room.gameState = GameState.WaitingForGuest;
        let returnValue = component.roomIsJoined();
        expect(returnValue).toBeFalsy();

        component.room.gameState = GameState.GameRefused;
        returnValue = component.roomIsJoined();
        expect(returnValue).toBeFalsy();
    });

    it('roomIsJoined should return false if room is undefined', () => {
        component.room = undefinedRoom;
        const returnValue = component.roomIsJoined();

        expect(returnValue).toBeFalsy();
    });

    it('roomIsJoined should return true if game is not waiting for guest and not refused', () => {
        component.room.gameState = GameState.GuestJoined;
        const returnValue = component.roomIsJoined();
        expect(returnValue).toBeTruthy();
    });

    it('proceedToGame should not call acceptGame or navigate if game is not joined', () => {
        component.room.gameState = GameState.GameRefused;
        gameManagerServiceStub.acceptGame = jasmine.createSpy('acceptGame').and.stub();
        component.proceedToGame();
        expect(gameManagerServiceStub.acceptGame).not.toHaveBeenCalled();
    });

    it('proceedToGame should call acceptGame with room and navigate with URL to the game page', () => {
        component.room.gameState = GameState.GuestJoined;
        gameManagerServiceStub.acceptGame = jasmine.createSpy('acceptGame').and.stub();
        component.proceedToGame();
        expect(gameManagerServiceStub.acceptGame).toHaveBeenCalledOnceWith(component.room);
    });

    it('convertToSinglePlayer should call acceptGame with room after changing the gameOptions.singleplayer to true', () => {
        component.room.gameOptions.singlePlayer = false;
        gameManagerServiceStub.acceptGame = jasmine.createSpy('acceptGame').and.stub();
        component.convertToSinglePlayer();
        expect(gameManagerServiceStub.acceptGame).toHaveBeenCalledOnceWith(component.room);
        expect(component.room.gameOptions.singlePlayer).toEqual(true);
    });

    it('refuseGame should call refuseGame with room and navigate with URL to the waiting-room page', () => {
        gameManagerServiceStub.refuseGame = jasmine.createSpy('refuseGame').and.stub();
        component.refuseGame();
        expect(gameManagerServiceStub.refuseGame).toHaveBeenCalledOnceWith(component.room);
    });

    it('refuseGame should change gameState to waiting for guest', () => {
        const expectedValue = GameState.WaitingForGuest;
        component.refuseGame();
        expect(gameManagerServiceStub.currentRoom?.gameState).toEqual(expectedValue);
        expect(component.room.gameState).toEqual(expectedValue);
    });

    it('quitGame should call abandonWaiting from gameManagerService and navigate from router', () => {
        gameManagerServiceStub.abandonWaiting = jasmine.createSpy('abandonWaiting').and.stub();
        component.abandon();
        expect(gameManagerServiceStub.abandonWaiting).toHaveBeenCalled();
    });

    it('should update room on signal and call isJoined()', () => {
        const room: RoomClient = currentRoom;
        const spy = spyOn(component, 'roomIsJoined');
        gameManagerServiceStub.roomEvent?.next(room);
        expect(component.room).toEqual(room);
        expect(spy).toHaveBeenCalled();
    });

    it('should not update room on signal and call isJoined() if no room is provided', () => {
        const room: RoomClient = currentRoom;
        const spy = spyOn(component, 'roomIsJoined');
        gameManagerServiceStub.roomEvent?.next(room);
        expect(component.room).toEqual(room);
        expect(spy).toHaveBeenCalled();
    });

    it('should change rack on signal', () => {
        const room: RoomClient = currentRoom;
        component.room = room;
        gameManagerServiceStub.roomEvent?.next();
        expect(component.room).toEqual(room);
    });
});
