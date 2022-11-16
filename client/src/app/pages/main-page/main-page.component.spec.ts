/* eslint-disable max-classes-per-file */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';
import { HighScoresComponent } from '@app/components/high-scores/high-scores.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { DEFAULT_GAME_OPTIONS } from '@common/constants/options-constants';
import { TEST_ROOM_CLIENT } from '@common/constants/test-room';
import { GameState, GameType } from '@common/enums/enums';
import { RoomClient } from '@common/interfaces/room';
import { Observable } from 'rxjs';
import SpyObj = jasmine.SpyObj;

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;
    let gameManagerServiceSpy: SpyObj<GameManagerService>;
    let currentRoom: RoomClient | undefined;
    const formBuilder = new FormBuilder();
    let data: FormGroup | undefined;
    class MatDialogMock {
        gameOptionsDialog: MatDialogRefMock;
        open(): MatDialogRefMock {
            return new MatDialogRefMock();
        }
    }

    class MatDialogRefMock {
        close(): void {
            return;
        }

        afterClosed(): Observable<FormGroup> {
            return new Observable((observer) => {
                observer.next(data);
                observer.complete();
            });
        }
    }

    beforeEach(async () => {
        currentRoom = JSON.parse(JSON.stringify(TEST_ROOM_CLIENT));
        gameManagerServiceSpy = jasmine.createSpyObj('GameManagerService', ['abandonWaiting', 'connectPlayer', 'createRoom'], {
            currentRoom,
        });

        await TestBed.configureTestingModule({
            imports: [RouterTestingModule, HttpClientModule],
            declarations: [MainPageComponent],
            providers: [
                { provide: MatDialog, useClass: MatDialogMock },
                { provide: MatDialogRef, useClass: MatDialogRefMock },
                { provide: GameManagerService, useValue: gameManagerServiceSpy },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('selectGameType should change gameType to chosen gameType, but not call connectPlayer and createRoom from \
        gameManagerService nor call openWaitingRoomDialog() when data is undefined', () => {
        data = undefined;

        const openWaitingRoomDialogSpy = spyOn(component, 'openWaitingRoomDialog').and.stub();

        component.selectGameType(GameType.CLASSIC);

        expect(component.gameType).toEqual(GameType.CLASSIC);
        expect(gameManagerServiceSpy.connectPlayer).not.toHaveBeenCalled();
        expect(gameManagerServiceSpy.createRoom).not.toHaveBeenCalled();
        expect(openWaitingRoomDialogSpy).not.toHaveBeenCalled();
    });

    it('selectGameType should change gameType to chosen gameType and call connectPlayer and createRoom from \
        gameManagerService and call openWaitingRoomDialog() when data is not undefined', () => {
        data = formBuilder.group({
            name: DEFAULT_GAME_OPTIONS.name,
            aiDifficulty: DEFAULT_GAME_OPTIONS.aiDifficulty,
            turnDuration: DEFAULT_GAME_OPTIONS.turnDuration,
            dictionary: DEFAULT_GAME_OPTIONS.dictionary,
        });

        const openWaitingRoomDialogSpy = spyOn(component, 'openWaitingRoomDialog').and.stub();

        component.selectGameType(GameType.CLASSIC);

        expect(component.gameType).toEqual(GameType.CLASSIC);
        expect(gameManagerServiceSpy.connectPlayer).toHaveBeenCalled();
        expect(gameManagerServiceSpy.createRoom).toHaveBeenCalled();
        expect(openWaitingRoomDialogSpy).toHaveBeenCalled();
    });

    it('selectGameType should change gameType to chosen gameType and call connectPlayer and createRoom from \
        gameManagerService, but not call openWaitingRoomDialog() when the game would be in singleplayer', () => {
        data = formBuilder.group({
            name: DEFAULT_GAME_OPTIONS.name,
            aiDifficulty: DEFAULT_GAME_OPTIONS.aiDifficulty,
            turnDuration: DEFAULT_GAME_OPTIONS.turnDuration,
            dictionary: DEFAULT_GAME_OPTIONS.dictionary,
            singlePlayer: true,
        });

        const openWaitingRoomDialogSpy = spyOn(component, 'openWaitingRoomDialog').and.stub();

        component.selectGameType(GameType.CLASSIC);

        expect(component.gameType).toEqual(GameType.CLASSIC);
        expect(gameManagerServiceSpy.connectPlayer).toHaveBeenCalled();
        expect(gameManagerServiceSpy.createRoom).toHaveBeenCalled();
        expect(openWaitingRoomDialogSpy).not.toHaveBeenCalled();
    });

    it('openWaitingRoomDialog should call gameManager.abandonWaiting() if the currentRoom is undefined', () => {
        data = undefined;
        Object.defineProperty(gameManagerServiceSpy, 'currentRoom', {
            // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
            get() {
                return undefined;
            },
        });

        component.openWaitingRoomDialog();
        expect(gameManagerServiceSpy.abandonWaiting).toHaveBeenCalled();
    });

    it('openWaitingRoomDialog should not call gameManager.abandonWaiting() if the currentState of the room is GameAccepted', () => {
        data = undefined;
        if (currentRoom) currentRoom.gameState = GameState.GameAccepted;

        component.openWaitingRoomDialog();
        expect(gameManagerServiceSpy.abandonWaiting).not.toHaveBeenCalled();
    });

    it('openWaitingRoomDialog should call gameManager.abandonWaiting() if the currentState of the room is not GameAccepted', () => {
        data = undefined;
        if (currentRoom) currentRoom.gameState = GameState.GameRefused;

        component.openWaitingRoomDialog();
        expect(gameManagerServiceSpy.abandonWaiting).toHaveBeenCalled();
    });

    it('displayHighScores should open a dialog with HighScoresComponent', () => {
        const spy = spyOn(component.dialog, 'open').and.stub();
        component.displayHighScores();
        expect(spy).toHaveBeenCalledWith(HighScoresComponent);
    });
});
