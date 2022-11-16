/* eslint-disable max-classes-per-file */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { FormatTime } from '@app/pipes/format-time/format-time.pipe';
import { ChatboxManagerService } from '@app/services/chatbox-manager/chatbox-manager.service';
import { ClearBoardSelectionService } from '@app/services/clear-board-selection/clear-board-selection.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { TEST_ROOM_CLIENT } from '@common/constants/test-room';
import { RoomClient } from '@common/interfaces/room';
import { RoomMessage } from '@common/interfaces/room-message';
import { Observable, Subject } from 'rxjs';
import { CommunicationBoxComponent } from './communication-box.component';

describe('CommunicationBoxComponent', () => {
    let component: CommunicationBoxComponent;
    let fixture: ComponentFixture<CommunicationBoxComponent>;
    let routerSpy: jasmine.SpyObj<Router>;
    let gameManagerSpy: jasmine.SpyObj<GameManagerService>;
    let clearBoardSelectionDetectorSpy: jasmine.SpyObj<ClearBoardSelectionService>;
    const playerId = 'xd369';
    const roomMessages: RoomMessage[] = [];
    let currentRoom: RoomClient;
    let result = false;
    let chatBoxManagerStub: Partial<ChatboxManagerService>;
    const messageEvent: Subject<void> = new Subject<void>();
    const roomEvent: Subject<RoomClient> = new Subject<RoomClient>();

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
            sendToRoom,
            skipTurn,
            init,
        };
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatInputModule, FormsModule],
            declarations: [CommunicationBoxComponent, FormatTime],
            providers: [
                { provide: Router, useValue: routerSpy },
                { provide: MatDialog, useClass: MatDialogMock },
            ],
        })
            .overrideComponent(CommunicationBoxComponent, {
                set: {
                    providers: [
                        { provide: ChatboxManagerService, useValue: chatBoxManagerStub },
                        { provide: ClearBoardSelectionService, useValue: clearBoardSelectionDetectorSpy },
                    ],
                },
            })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(CommunicationBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initially take the current attributes of chatBoxManagerService', () => {
        expect(component.playerId).toEqual(playerId);
        expect(component.currentRoom).toEqual(currentRoom);
        expect(component.roomMessages).toEqual(roomMessages);
        expect(component.currentPlayer).toEqual(currentRoom.hostPlayer);
    });

    it('should be updated on change of attributes of chatBoxManagerService', () => {
        const updatedId = 'scrbbl';
        chatBoxManagerStub.playerId = updatedId;
        component.updateInfo();
        expect(component.playerId).toEqual(updatedId);
    });

    it('sendToRoom should not call sendToRoom if messageSent is empty', () => {
        chatBoxManagerStub.sendToRoom = jasmine.createSpy('sendToRoom');
        component.messageSent = '';
        component.sendToRoom();
        expect(chatBoxManagerStub.sendToRoom).not.toHaveBeenCalled();
    });

    it('sendToRoom should call sendToRoom with messageSent', () => {
        chatBoxManagerStub.sendToRoom = jasmine.createSpy('sendToRoom');
        component.messageSent = 'messageSent';
        component.sendToRoom();
        expect(chatBoxManagerStub.sendToRoom).toHaveBeenCalledOnceWith('messageSent');
    });

    it('ngOnInit should call chatBoxManager.init() and updateInfo()', () => {
        chatBoxManagerStub.init = jasmine.createSpy('init');
        const spy = spyOn(component, 'updateInfo');

        component.ngOnInit();

        expect(chatBoxManagerStub.init).toHaveBeenCalled();
        expect(spy).toHaveBeenCalled();
    });

    it("ngOnInit should still work if chatBoxManager's currentPlayer is undefined", () => {
        chatBoxManagerStub.currentPlayer = undefined;
        const ngOnInitTwo = () => {
            component.ngOnInit();
        };
        expect(ngOnInitTwo).not.toThrowError();
    });

    it("ngAfterViewChecked should change currentMaxScrollHeight if the chatbox's scrollHeight is greater than the currentMaxScrollHeight", () => {
        const expected = component.chatBox.nativeElement.scrollHeight;
        component.currentMaxScrollHeight = 0;
        component.ngAfterViewChecked();

        expect(component.currentMaxScrollHeight).toEqual(expected);
    });

    it("ngAfterViewChecked should not change currentMaxScrollHeight if the chatbox's scrollHeight is not greater than the \
currentMaxScrollHeight", () => {
        component.currentMaxScrollHeight = 100000;
        const expected = component.currentMaxScrollHeight;
        component.ngAfterViewChecked();

        expect(component.currentMaxScrollHeight).toEqual(expected);
    });

    it("updateInfo() should get called on chatboxManagerService's roomEvent.next()", () => {
        const spy = spyOn(component, 'updateInfo');
        chatBoxManagerStub.roomEvent = roomEvent;
        chatBoxManagerStub.roomEvent.next();
        expect(spy).toHaveBeenCalled();
    });

    it("updateMessages() should get called on chatboxManagerService's messageEvent.next()", () => {
        const spy = spyOn(component, 'updateMessages');
        chatBoxManagerStub.messageEvent = messageEvent;
        chatBoxManagerStub.messageEvent.next();
        expect(spy).toHaveBeenCalled();
    });

    it('mouseDetect should call next of boardSelectionDetector', () => {
        component.mouseDetect();
        expect(clearBoardSelectionDetectorSpy.notify).toHaveBeenCalled();
    });
});
