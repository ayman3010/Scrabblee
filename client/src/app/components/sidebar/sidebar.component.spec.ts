/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { TO_HOME } from '@app/classes/constants/routing-constants';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { TextSizeButtonComponent } from '@app/components/text-size-button/text-size-button.component';
import { FormatTime } from '@app/pipes/format-time/format-time.pipe';
import { BoardInputHandlerService } from '@app/services/board-input-handler/board-input-handler.service';
import { ChatboxManagerService } from '@app/services/chatbox-manager/chatbox-manager.service';
import { ClearBoardSelectionService } from '@app/services/clear-board-selection/clear-board-selection.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { NUMBER_OF_PRIVATE_OBJECTIVES, NUMBER_OF_PUBLIC_OBJECTIVES } from '@common/constants/objective-constants';
import { TEST_PLAYER, TEST_ROOM_CLIENT } from '@common/constants/test-room';
import { GameState } from '@common/enums/enums';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
import { ObjectiveClient } from '@common/interfaces/objective-client';
import { RoomClient } from '@common/interfaces/room';
import { RoomMessage } from '@common/interfaces/room-message';
import { Observable, Subject } from 'rxjs';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let gameManagerSpy: jasmine.SpyObj<GameManagerService>;
    let boardInputHandlerSpy: jasmine.SpyObj<BoardInputHandlerService>;
    let clearBoardSelectionDetectorSpy: jasmine.SpyObj<ClearBoardSelectionService>;
    const playerId = 'xd369';
    const roomMessages: RoomMessage[] = [];
    let currentRoom: RoomClient;
    let testRoom: RoomClient;
    let result = false;
    let chatBoxManagerStub: Partial<ChatboxManagerService>;
    const messageEvent: Subject<void> = new Subject<void>();
    const timerEvent: Subject<number> = new Subject<number>();
    const roomEvent: Subject<RoomClient> = new Subject<RoomClient>();

    const handleSockets = () => {
        return;
    };

    // eslint-disable-next-line no-unused-vars
    const sendToRoom = (message: string) => {
        return;
    };

    const skipTurn = () => {
        return;
    };

    const init = () => {
        return;
    };

    class MatDialogMock {
        gameOptionsDialog: MatDialogRefMock;
        open(): MatDialogRefMock {
            return new MatDialogRefMock();
        }
    }
    class MatDialogRefMock {
        close(confirm: boolean): boolean {
            return confirm;
        }

        afterClosed(): Observable<boolean> {
            return new Observable((observer) => {
                observer.next(result);
                observer.complete();
            });
        }
    }

    beforeEach(() => {
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        clearBoardSelectionDetectorSpy = jasmine.createSpyObj('ClearBoardSelection', ['notify']);
        currentRoom = { ...TEST_ROOM_CLIENT };
        testRoom = { ...TEST_ROOM_CLIENT };
        testRoom.hostPlayer = { ...TEST_PLAYER };
        testRoom.guestPlayer = { ...TEST_PLAYER };
        result = false;

        gameManagerSpy = jasmine.createSpyObj('GameManagerService', ['abandonGame', 'connectPlayer']);

        const gameManager = gameManagerSpy;

        chatBoxManagerStub = {
            gameManager,
            playerId,
            currentRoom,
            roomMessages,
            timer: currentRoom.timer,
            currentPlayer: currentRoom.hostPlayer,
            roomEvent,
            messageEvent,
            timerEvent,
            handleSockets,
            sendToRoom,
            skipTurn,
            init,
        };
    });

    beforeEach(async () => {
        boardInputHandlerSpy = jasmine.createSpyObj('BoardInputHandlerService', ['']);

        await TestBed.configureTestingModule({
            imports: [MatInputModule, FormsModule],
            declarations: [SidebarComponent, FormatTime, TextSizeButtonComponent],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: MatDialog, useClass: MatDialogMock },
            ],
        })
            .overrideComponent(SidebarComponent, {
                set: {
                    providers: [
                        { provide: BoardInputHandlerService, useValue: boardInputHandlerSpy },
                        { provide: ChatboxManagerService, useValue: chatBoxManagerStub },
                        { provide: ClearBoardSelectionService, useValue: clearBoardSelectionDetectorSpy },
                    ],
                },
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;
        component.currentRoom = currentRoom;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initially take the current attributes of chatBoxManagerService', () => {
        expect(component.playerId).toEqual(playerId);
        expect(component.currentRoom).toEqual(currentRoom);
        expect(component.timer).toEqual(currentRoom.timer);
        expect(component.isTurn).toEqual(component.currentPlayer.isTurn);
        expect(component.currentPlayer).toEqual(currentRoom.hostPlayer);
    });

    it('should be updated on change of attributes of chatBoxManagerService', () => {
        const updatedTime = component.currentRoom.timer + 1;
        chatBoxManagerStub.timer = updatedTime;
        component.updateInfo();
        expect(component.timer).toEqual(updatedTime);
    });

    it('ngOnInit should call handleSockets', () => {
        chatBoxManagerStub.handleSockets = jasmine.createSpy('handleSockets');
        component.ngOnInit();
        expect(chatBoxManagerStub.handleSockets).toHaveBeenCalled();
    });

    it("ngOnInit should still work if chatBoxManager's currentPlayer is undefined", () => {
        chatBoxManagerStub.currentPlayer = undefined;
        const ngOnInitTwo = () => {
            component.ngOnInit();
        };
        expect(ngOnInitTwo).not.toThrowError();
    });

    it('skipTurn should call skipTurn', () => {
        chatBoxManagerStub.skipTurn = jasmine.createSpy('skipTurn');
        component.skipTurn();
        expect(chatBoxManagerStub.skipTurn).toHaveBeenCalled();
    });

    it('abandonGame should call chatBoxManager.gameManager.abandonGame and router.navigate with the correct path', () => {
        component.abandonGame();
        expect(gameManagerSpy.abandonGame).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith([TO_HOME]);
    });

    it('abandonGame should not call chatBoxManager.gameManager.abandonGame if there is no current player, but \
still call router.navigate with the correct path', () => {
        chatBoxManagerStub.currentPlayer = undefined;
        component.updateInfo();
        component.abandonGame();
        expect(gameManagerSpy.abandonGame).not.toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith([TO_HOME]);
    });

    it('quitGame should not call router.navigate if the currentRoom is undefined', () => {
        chatBoxManagerStub.currentRoom = undefined;
        component.ngOnInit(); // To put it as undefined
        component.quitGame();
        expect(routerSpy.navigate).not.toHaveBeenCalledWith([TO_HOME]);
    });

    it('quitGame should not call router.navigate if the currentRoom is not currently in the GameAbandoned state', () => {
        component.currentRoom.gameState = GameState.GameAccepted;
        component.quitGame();
        expect(routerSpy.navigate).not.toHaveBeenCalledWith([TO_HOME]);
    });

    it('quitGame should call router.navigate if the currentRoom is currently in the GameAbandoned state', () => {
        component.currentRoom.gameState = GameState.GameAbandoned;
        component.quitGame();
        expect(routerSpy.navigate).toHaveBeenCalledWith([TO_HOME]);
    });

    it('openAbandonDialog should call dialog.open() and should not call abandonGame when the close returned false', () => {
        component.openAbandonDialog();
        expect(gameManagerSpy.abandonGame).not.toHaveBeenCalled();
    });

    it('openAbandonDialog should call chatBoxManager.gameManager.abandonGame and router.navigate with the correct path', () => {
        result = true;
        component.openAbandonDialog();
        expect(gameManagerSpy.abandonGame).toHaveBeenCalled();
    });

    it("timer should get updated on chatboxManagerService's timerEvent.next()", () => {
        const expected = 69;
        component.timer = 60;
        chatBoxManagerStub.timerEvent = timerEvent;
        chatBoxManagerStub.timerEvent.next(expected);
        expect(component.timer).toEqual(expected);
    });

    it("updateInfo() should get called on chatboxManagerService's roomEvent.next()", () => {
        const spy = spyOn(component, 'updateInfo');
        chatBoxManagerStub.roomEvent = roomEvent;
        chatBoxManagerStub.roomEvent.next();
        expect(spy).toHaveBeenCalled();
    });

    it('mouseDetect should call next of boardSelectionDetector', () => {
        component.mouseDetect();
        expect(clearBoardSelectionDetectorSpy.notify).toHaveBeenCalled();
    });

    it('getWinnerPoints should return the right amount of point if the first player is winning.', () => {
        testRoom.hostPlayer.points = 420;
        testRoom.guestPlayer.points = 69;
        const expected = 420;

        expect(component['getWinnerPoints'](testRoom.hostPlayer, testRoom.guestPlayer)).toEqual(expected);
    });

    it('getWinnerPoints should return the right amount of point if the second player is winning.', () => {
        testRoom.hostPlayer.points = 69;
        testRoom.guestPlayer.points = 420;
        const expected = 420;

        expect(component['getWinnerPoints'](testRoom.hostPlayer, testRoom.guestPlayer)).toEqual(expected);
    });

    it('getWinnerPoints should return the right amount of point if there is a tie.', () => {
        testRoom.hostPlayer.points = 69;
        testRoom.guestPlayer.points = 69;
        const expected = 69;

        expect(component['getWinnerPoints'](testRoom.hostPlayer, testRoom.guestPlayer)).toEqual(expected);
    });

    it('generateCongratulations should call getWinnerPoints() and return the name of the first player if they are winning', () => {
        testRoom.hostPlayer.name = 'John Scrabble';
        testRoom.guestPlayer.name = 'Jane Scrabble';
        testRoom.hostPlayer.points = 420;
        testRoom.guestPlayer.points = 69;
        component.currentRoom = testRoom;
        const expected = 'John Scrabble a gagné avec 420 points! Bravo!';
        const getWinnerPointsStub = spyOn(component as any, 'getWinnerPoints').and.callFake(() => {
            return 420;
        });

        expect(component.generateCongratulations()).toEqual(expected);
        expect(getWinnerPointsStub).toHaveBeenCalled();
    });

    it('generateCongratulations should call getWinnerPoints() and return the name of the second player if they are winning', () => {
        testRoom.hostPlayer.points = 69;
        testRoom.guestPlayer.points = 420;
        testRoom.hostPlayer.name = 'John Scrabble';
        testRoom.guestPlayer.name = 'Jane Scrabble';
        component.currentRoom = testRoom;
        const expected = 'Jane Scrabble a gagné avec 420 points! Bravo!';
        const getWinnerPointsStub = spyOn(component as any, 'getWinnerPoints').and.callFake(() => {
            return 420;
        });

        expect(component.generateCongratulations()).toEqual(expected);
        expect(getWinnerPointsStub).toHaveBeenCalled();
    });

    it('generateCongratulations should call getWinnerPoints() and return the name of both players, separated by " et ", if there is a tie', () => {
        testRoom.hostPlayer.points = 69;
        testRoom.guestPlayer.points = 69;
        testRoom.hostPlayer.name = 'John Scrabble';
        testRoom.guestPlayer.name = 'Jane Scrabble';
        component.currentRoom = testRoom;
        const expected = 'John Scrabble et Jane Scrabble ont gagné avec 69 points! Bravo!';
        const getWinnerPointsStub = spyOn(component as any, 'getWinnerPoints').and.callFake(() => {
            return 69;
        });

        expect(component.generateCongratulations()).toEqual(expected);
        expect(getWinnerPointsStub).toHaveBeenCalled();
    });

    it('generateCongratulations should not call getWinnerPoints() and return the name of the current player if the host abandoned', () => {
        testRoom.hostPlayer.points = 420;
        testRoom.guestPlayer.points = 69;
        testRoom.hostPlayer.name = 'John Scrabble';
        testRoom.guestPlayer.name = 'Jane Scrabble';
        testRoom.hostPlayer.abandoned = true;
        component.currentRoom = testRoom;
        component.currentPlayer = testRoom.guestPlayer;
        const expected = 'Jane Scrabble a gagné avec 69 points! Bravo!';
        const getWinnerPointsStub = spyOn(component as any, 'getWinnerPoints').and.callFake(() => {
            return 69;
        });

        expect(component.generateCongratulations()).toEqual(expected);
        expect(getWinnerPointsStub).not.toHaveBeenCalled();
    });

    it('generateCongratulations should not call getWinnerPoints() and return the name of the current player if the guest abandoned', () => {
        testRoom.hostPlayer.points = 69;
        testRoom.guestPlayer.points = 420;
        testRoom.hostPlayer.name = 'John Scrabble';
        testRoom.guestPlayer.name = 'Jane Scrabble';
        testRoom.guestPlayer.abandoned = true;
        component.currentRoom = testRoom;
        component.currentPlayer = testRoom.hostPlayer;
        const expected = 'John Scrabble a gagné avec 69 points! Bravo!';
        const getWinnerPointsStub = spyOn(component as any, 'getWinnerPoints').and.callFake(() => {
            return 69;
        });

        expect(component.generateCongratulations()).toEqual(expected);
        expect(getWinnerPointsStub).not.toHaveBeenCalled();
    });

    it('getWinnerName should not return anything if the currentRoom is undefined', () => {
        chatBoxManagerStub.currentRoom = undefined;
        component.updateInfo();
        const expected = '';

        expect(component.generateCongratulations()).toEqual(expected);
    });

    it('isExpert returns true when AiDifficulty is expert', () => {
        component.currentRoom = TEST_ROOM_CLIENT;
        component.currentRoom.gameOptions.aiDifficulty = AiDifficulty.EXPERT;
        expect(component.isExpert()).toEqual(true);
    });

    it('isExpert returns false when AiDifficulty is not expert', () => {
        component.currentRoom = TEST_ROOM_CLIENT;

        component.currentRoom.gameOptions.aiDifficulty = AiDifficulty.BEGINNER;
        expect(component.isExpert()).toEqual(false);
    });

    it('textSize setter should set textSize of BoardService', () => {
        component.resizeText(0);
        // eslint-disable-next-line dot-notation
        expect(component['boardService'].textSize).toEqual(0);
    });

    it('privateObjectivesHost getter should get the first privateObjectives if its owner is the hostPlayer', () => {
        const publicObjective: ObjectiveClient = { description: '', points: 0, isAchieved: false, owners: [{ name: 'John Scrabble' }] };
        const privateObjectiveHost: ObjectiveClient = { description: '', points: 0, isAchieved: false, owners: [{ name: 'John Scrabble' }] };
        const privateObjectiveGuest: ObjectiveClient = { description: '', points: 0, isAchieved: false, owners: [{ name: 'Candice Scrabble' }] };

        const publicObjectives = Array(NUMBER_OF_PUBLIC_OBJECTIVES).fill(publicObjective);
        const privateObjectivesHost = Array(NUMBER_OF_PRIVATE_OBJECTIVES).fill(privateObjectiveHost);
        const privateObjectivesGuest = Array(NUMBER_OF_PRIVATE_OBJECTIVES).fill(privateObjectiveGuest);

        testRoom.objectives = [...publicObjectives, ...privateObjectivesHost, ...privateObjectivesGuest];
        component.currentRoom = testRoom;

        const returnValue = component.privateObjectivesHost;
        expect(returnValue).toEqual(privateObjectivesHost);
    });

    it('privateObjectivesHost getter should get the first privateObjectives if its owner is the hostPlayer', () => {
        const publicObjective: ObjectiveClient = { description: '', points: 0, isAchieved: false, owners: [{ name: '' }] };
        const privateObjectiveHost: ObjectiveClient = { description: '', points: 0, isAchieved: false, owners: [{ name: 'John Scrabble' }] };
        const privateObjectiveGuest: ObjectiveClient = { description: '', points: 0, isAchieved: false, owners: [{ name: 'Candice Scrabble' }] };

        const publicObjectives = Array(NUMBER_OF_PUBLIC_OBJECTIVES).fill(publicObjective);
        const privateObjectivesHost = Array(NUMBER_OF_PRIVATE_OBJECTIVES).fill(privateObjectiveHost);
        const privateObjectivesGuest = Array(NUMBER_OF_PRIVATE_OBJECTIVES).fill(privateObjectiveGuest);

        testRoom.objectives = [...publicObjectives, ...privateObjectivesHost, ...privateObjectivesGuest];
        testRoom.hostPlayer = { ...TEST_PLAYER, name: 'Candice Scrabble' };
        component.currentRoom = testRoom;

        const returnValue = component.privateObjectivesHost;
        expect(returnValue).toEqual(privateObjectivesGuest);
    });

    it('privateObjectivesGuest getter should get the first privateObjectives if its owner is the hostPlayer', () => {
        const publicObjective: ObjectiveClient = { description: '', points: 0, isAchieved: false, owners: [{ name: 'John Scrabble' }] };
        const privateObjectiveHost: ObjectiveClient = { description: '', points: 0, isAchieved: false, owners: [{ name: 'John Scrabble' }] };
        const privateObjectiveGuest: ObjectiveClient = { description: '', points: 0, isAchieved: false, owners: [{ name: 'Candice Scrabble' }] };

        const publicObjectives = Array(NUMBER_OF_PUBLIC_OBJECTIVES).fill(publicObjective);
        const privateObjectivesHost = Array(NUMBER_OF_PRIVATE_OBJECTIVES).fill(privateObjectiveHost);
        const privateObjectivesGuest = Array(NUMBER_OF_PRIVATE_OBJECTIVES).fill(privateObjectiveGuest);

        testRoom.objectives = [...publicObjectives, ...privateObjectivesHost, ...privateObjectivesGuest];
        component.currentRoom = testRoom;

        const returnValue = component.privateObjectivesGuest;
        expect(returnValue).toEqual(privateObjectivesGuest);
    });

    it('privateObjectivesGuest getter should get the first privateObjectives if its owner is the hostPlayer', () => {
        const publicObjective: ObjectiveClient = { description: '', points: 0, isAchieved: false, owners: [{ name: '' }] };
        const privateObjectiveHost: ObjectiveClient = { description: '', points: 0, isAchieved: false, owners: [{ name: 'John Scrabble' }] };
        const privateObjectiveGuest: ObjectiveClient = { description: '', points: 0, isAchieved: false, owners: [{ name: 'Candice Scrabble' }] };

        const publicObjectives = Array(NUMBER_OF_PUBLIC_OBJECTIVES).fill(publicObjective);
        const privateObjectivesHost = Array(NUMBER_OF_PRIVATE_OBJECTIVES).fill(privateObjectiveHost);
        const privateObjectivesGuest = Array(NUMBER_OF_PRIVATE_OBJECTIVES).fill(privateObjectiveGuest);

        testRoom.objectives = [...publicObjectives, ...privateObjectivesHost, ...privateObjectivesGuest];
        testRoom.hostPlayer = { ...TEST_PLAYER, name: 'Candice Scrabble' };
        component.currentRoom = testRoom;

        const returnValue = component.privateObjectivesGuest;
        expect(returnValue).toEqual(privateObjectivesHost);
    });
});
