/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JoinGameDialogComponent } from '@app/components/join-game-dialog/join-game-dialog.component';
import { WaitForHostComponent } from '@app/components/wait-for-host/wait-for-host.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { TEST_PLAYER, TEST_ROOM_CLIENT } from '@common/constants/test-room';
import { GameState, GameType } from '@common/enums/enums';
import { PlayerNameData } from '@common/interfaces/interfaces';
import { Player } from '@common/interfaces/player';
import { RoomClient } from '@common/interfaces/room';
import { Observable, Subject } from 'rxjs';
import { AvailableGamesComponent } from './available-games.component';

describe('AvailableGamesComponent', () => {
    let component: AvailableGamesComponent;
    let fixture: ComponentFixture<AvailableGamesComponent>;
    let gameManagerServiceMock: Partial<GameManagerService>;
    const gameStateUpdate: Subject<GameState> = new Subject<GameState>();
    const data: PlayerNameData = { playerName: '', validName: false };
    let room: RoomClient;
    const availableRoomsEvent: Subject<RoomClient[]> = new Subject<RoomClient[]>();

    const joinRoom = () => {
        return;
    };

    const connectPlayer = () => {
        return;
    };

    const socketHandler = () => {
        return;
    };

    const listAvailableRooms = () => {
        return;
    };

    const leaveWaitingRoom = () => {
        return;
    };

    class MatDialogMock {
        nameInputDialog: MatDialogRefMock;
        open(): MatDialogRefMock {
            return new MatDialogRefMock();
        }
    }
    class MatDialogRefMock {
        close(): void {
            return;
        }

        afterClosed(): Observable<PlayerNameData> {
            return new Observable((observer) => {
                observer.next(data);
                observer.complete();
            });
        }
    }

    beforeEach(() => {
        room = { ...TEST_ROOM_CLIENT };
        const availableRooms = [room];
        gameManagerServiceMock = {
            gameStateUpdate,
            availableRooms,
            joinRoom,
            connectPlayer,
            socketHandler,
            listAvailableRooms,
            leaveWaitingRoom,
            availableRoomsEvent,
        };
        gameManagerServiceMock.joinRoom = jasmine.createSpy('joinRoom');
        data.playerName = '';
        data.validName = false;
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatTableModule, BrowserAnimationsModule, AppMaterialModule],
            declarations: [AvailableGamesComponent],
            providers: [
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: MatDialogRef, useClass: MatDialogRefMock },
                { provide: GameManagerService, useValue: gameManagerServiceMock },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AvailableGamesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it("filterRooms() should get called on chatboxManagerService's availableRoomsEvent.next()", () => {
        const spy = spyOn(component, 'filterRooms');
        gameManagerServiceMock.availableRoomsEvent = availableRoomsEvent;
        gameManagerServiceMock.availableRoomsEvent.next();
        expect(spy).toHaveBeenCalled();
    });

    it("filterRooms() should get called on chatboxManagerService's availableRoomsEvent.next()", () => {
        component.gameType = GameType.CLASSIC;
        component.rooms = [TEST_ROOM_CLIENT];
        const returnValue = component.filterRooms();
        expect(returnValue).toEqual([TEST_ROOM_CLIENT]);
    });

    it('randomRoomPlacement() should not call openDialog if the number of rooms available is 0', async () => {
        component.rooms = [];
        const spy = spyOn(component, 'openDialog');
        component.randomRoomPlacement();
        expect(spy).not.toHaveBeenCalled();
    });

    it('randomRoomPlacement() should call openDialog if the number of rooms available is not 0', async () => {
        component.rooms = [TEST_ROOM_CLIENT];
        const spy = spyOn(component, 'openDialog');
        component.randomRoomPlacement();
        expect(spy).toHaveBeenCalled();
    });

    it('should not change the value of playerNameData.playerName if no name was provided by the dialog', async () => {
        const expected = '';

        component.openDialog(room);
        const result = component.playerNameData.playerName;
        expect(result).toEqual(expected);
    });

    it('should not call joinRoom or propagateEvent if no name was provided by the dialog', async () => {
        component.playerNameData = data;
        const spy = spyOn(component.gameStarting, 'emit');
        component.openDialog(room);

        expect(gameManagerServiceMock.joinRoom).not.toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should call doAfterNameSubmitted with room and the new GameState when the dialog is closed with a valid playerName', () => {
        const expectedPlayer: Player = { ...TEST_PLAYER };
        const expectedRoom: RoomClient = { ...room };
        expectedRoom.guestPlayer = expectedPlayer;
        room.guestPlayer = { ...expectedPlayer };
        room.guestPlayer.name = '';
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const spy = spyOn<any>(component, 'doAfterNameSubmitted');
        const dialogSpy = spyOn(component.dialog, 'open').and.callThrough();
        const initialData = { ...data };

        data.playerName = expectedPlayer.name;
        data.validName = true;

        gameManagerServiceMock.gameStateUpdate = new Subject<GameState>();
        component.openDialog(room);
        gameManagerServiceMock.gameStateUpdate.next(GameState.GameAccepted);
        expect(spy).toHaveBeenCalled();
        expect(dialogSpy).toHaveBeenCalledWith(JoinGameDialogComponent, { data: initialData });
    });

    it('should not call propagateEvent if the GameState returned by the host is GameRefused', () => {
        const expectedPlayer: Player = { ...TEST_PLAYER };
        const expectedRoom: RoomClient = { ...room };
        expectedRoom.guestPlayer = expectedPlayer;
        room.guestPlayer = { ...expectedPlayer };
        room.guestPlayer.name = '';
        const spy = spyOn(component.gameStarting, 'emit');
        const dialogSpy = spyOn(component.dialog, 'open').and.callThrough();
        const initialData = { ...data };

        data.playerName = expectedPlayer.name;
        data.validName = true;

        gameManagerServiceMock.gameStateUpdate = new Subject<GameState>();
        component.openDialog(room);
        gameManagerServiceMock.gameStateUpdate.next(GameState.GameRefused);
        expect(gameManagerServiceMock.joinRoom).toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
        expect(dialogSpy).toHaveBeenCalledTimes(2);
        expect(dialogSpy).toHaveBeenCalledWith(JoinGameDialogComponent, { data: initialData });
        expect(dialogSpy).toHaveBeenCalledWith(WaitForHostComponent);
    });

    it('doAfterNameSubmitted should not call propagateEvent if the GameState returned by the host is not GameAccepted or GameRefused', () => {
        const expectedPlayer: Player = { ...TEST_PLAYER };
        const expectedRoom: RoomClient = { ...room };
        expectedRoom.guestPlayer = expectedPlayer;
        room.guestPlayer = { ...expectedPlayer };
        room.guestPlayer.name = '';
        const spy = spyOn(component.gameStarting, 'emit');
        const dialogSpy = spyOn(component.dialog, 'open').and.callThrough();

        data.playerName = expectedPlayer.name;
        data.validName = true;

        gameManagerServiceMock.gameStateUpdate = new Subject<GameState>();
        // eslint-disable-next-line dot-notation
        component['doAfterNameSubmitted'](room, data);
        gameManagerServiceMock.gameStateUpdate.next(GameState.GuestJoined);
        expect(gameManagerServiceMock.joinRoom).toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
        expect(dialogSpy).toHaveBeenCalledTimes(1);
        expect(dialogSpy).toHaveBeenCalledWith(WaitForHostComponent);
    });

    it('doAfterNameSubmitted should not call gameManager.leaveWaitingRoom if the current GameState is GameAccepted when the dialog is closed', () => {
        const expectedPlayer: Player = { ...TEST_PLAYER };
        const expectedRoom: RoomClient = { ...room };
        expectedRoom.guestPlayer = expectedPlayer;
        room.guestPlayer = { ...expectedPlayer };
        room.guestPlayer.name = '';
        const dialogSpy = spyOn(component.dialog, 'open').and.callThrough();

        data.playerName = expectedPlayer.name;
        data.validName = true;
        gameManagerServiceMock.currentRoom = room;
        gameManagerServiceMock.currentRoom.gameState = GameState.GameAccepted;

        gameManagerServiceMock.gameStateUpdate = new Subject<GameState>();
        gameManagerServiceMock.leaveWaitingRoom = jasmine.createSpy('leaveWaitingRoom');
        // eslint-disable-next-line dot-notation
        component['doAfterNameSubmitted'](room, data);
        gameManagerServiceMock.gameStateUpdate.next(GameState.GameAccepted);
        expect(gameManagerServiceMock.joinRoom).toHaveBeenCalled();
        expect(gameManagerServiceMock.leaveWaitingRoom).not.toHaveBeenCalled();
        expect(dialogSpy).toHaveBeenCalledTimes(1);
        expect(dialogSpy).toHaveBeenCalledWith(WaitForHostComponent);
    });

    it('doAfterNameSubmitted should not call propagateEvent if the GameState returned by the host is GameRefused', () => {
        const expectedPlayer: Player = { ...TEST_PLAYER };
        const expectedRoom: RoomClient = { ...room };
        expectedRoom.guestPlayer = expectedPlayer;
        room.guestPlayer = { ...expectedPlayer };
        room.guestPlayer.name = '';
        const spy = spyOn(component.gameStarting, 'emit');
        const dialogSpy = spyOn(component.dialog, 'open').and.callThrough();

        data.playerName = expectedPlayer.name;
        data.validName = true;

        gameManagerServiceMock.gameStateUpdate = new Subject<GameState>();
        // eslint-disable-next-line dot-notation
        component['doAfterNameSubmitted'](room, data);
        gameManagerServiceMock.gameStateUpdate.next(GameState.GameRefused);
        expect(gameManagerServiceMock.joinRoom).toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
        expect(dialogSpy).toHaveBeenCalledTimes(1);
        expect(dialogSpy).toHaveBeenCalledWith(WaitForHostComponent);
    });
});
