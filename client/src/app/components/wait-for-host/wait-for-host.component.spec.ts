/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { SocketClientService } from '@app/services/socket-client/socket-client.service';
import { TEST_ROOM_CLIENT } from '@common/constants/test-room';
import { GameState } from '@common/enums/enums';
import { RoomClient } from '@common/interfaces/room';
import { Subject } from 'rxjs';
import { WaitForHostComponent } from './wait-for-host.component';

describe('WaitForHostComponent', () => {
    let component: WaitForHostComponent;
    let fixture: ComponentFixture<WaitForHostComponent>;
    let matSnackBarSpy: jasmine.SpyObj<MatSnackBar>;
    let currentRoom: RoomClient;
    const gameStateUpdate: Subject<GameState> = new Subject<GameState>();

    const socketService: jasmine.SpyObj<SocketClientService> = jasmine.createSpyObj('socketClientService', ['disconnect']);

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

    const disconnect = () => {
        return;
    };

    // eslint-disable-next-line no-unused-vars
    const leaveWaitingRoom = (room: RoomClient) => {
        return;
    };

    let gameManagerServiceStub: Partial<GameManagerService>;

    beforeEach(() => {
        currentRoom = { ...TEST_ROOM_CLIENT };
        matSnackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);
        gameManagerServiceStub = {
            gameStateUpdate,
            currentRoom,
            socketService,
            getRoom,
            socketHandler,
            disconnect,
            leaveWaitingRoom,
        };
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatProgressSpinnerModule],
            declarations: [WaitForHostComponent],
            providers: [
                { provide: GameManagerService, useValue: gameManagerServiceStub },
                { provide: MatSnackBar, useValue: matSnackBarSpy },
                { provide: MatDialogRef, useClass: MatDialogRefMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitForHostComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        socketService.disconnect.calls.reset();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initially take the currentRoom of gameManagerService', () => {
        expect(component.currentRoom).toEqual(currentRoom);
    });

    it('updateRoom should update currentRoom', () => {
        const newTimer = currentRoom.timer + 1;
        const newRoom = { ...TEST_ROOM_CLIENT };
        newRoom.timer = newTimer;
        gameManagerServiceStub.currentRoom = newRoom;
        component.updateRoom();
        expect(component.currentRoom).toEqual(newRoom);
    });

    it('updateRoom should call returnToAvailableGames', () => {
        const spy = spyOn(component, 'returnToAvailableGames').and.stub();
        component.updateRoom();
        expect(spy).toHaveBeenCalled();
    });

    it('returnToAvailableGames should not call notifyUserRefusal or disconnect if game is not refused', () => {
        component.currentRoom.gameState = GameState.GameAccepted;
        const spy = spyOn(component, 'notifyUserRefusal');
        component.returnToAvailableGames();
        expect(spy).not.toHaveBeenCalled();
    });

    it('updateRoom should be called if gameManager.gameStateUpdate.next() has been called', () => {
        const spy = spyOn(component, 'updateRoom');
        component.ngOnInit();
        gameManagerServiceStub.gameStateUpdate?.next();
        expect(spy).toHaveBeenCalled();
    });

    it('returnToAvailableGames should not change GameState if game is not refused', () => {
        component.currentRoom.gameState = GameState.GameAccepted;
        const currentGameState = gameManagerServiceStub.currentRoom?.gameState;
        component.returnToAvailableGames();
        expect(gameManagerServiceStub.currentRoom?.gameState).toEqual(currentGameState);
    });

    it('returnToAvailableGames should call notifyUserRefusal and abandonRoom when the game state is GameRefused', () => {
        component.currentRoom.gameState = GameState.GameRefused;
        const spy = spyOn(component, 'notifyUserRefusal');
        component.returnToAvailableGames();
        expect(spy).toHaveBeenCalled();
        expect(gameManagerServiceStub.currentRoom?.gameState).toEqual(GameState.WaitingForGuest);
    });

    it('returnToAvailableGames should change GameState', () => {
        const newGameState = GameState.WaitingForGuest;
        component.currentRoom.gameState = GameState.GameRefused;
        component.returnToAvailableGames();
        expect(gameManagerServiceStub.currentRoom?.gameState).toEqual(newGameState);
    });

    it("notifyUserRefusal should call the snackbar's open upon being called", () => {
        component.notifyUserRefusal();

        expect(matSnackBarSpy.open).toHaveBeenCalled();
    });

    it('returnToMainMenu should call gameManager.leaveWaitingRoom with currentRoom and waitingDialog.close', () => {
        gameManagerServiceStub.leaveWaitingRoom = jasmine.createSpy('leaveWaitingRoom');
        const spy = spyOn(component.waitingDialog, 'close');
        component.returnToMainMenu();
        expect(gameManagerServiceStub.leaveWaitingRoom).toHaveBeenCalledWith(currentRoom);
        expect(spy).toHaveBeenCalled();
    });
});
