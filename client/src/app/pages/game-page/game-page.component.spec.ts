import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { RackComponent } from '@app/components/rack/rack.component';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { TextSizeButtonComponent } from '@app/components/text-size-button/text-size-button.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { FormatTime } from '@app/pipes/format-time/format-time.pipe';
import { ChatboxManagerService } from '@app/services/chatbox-manager/chatbox-manager.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { TEST_ROOM_CLIENT } from '@common/constants/test-room';
import { GameState } from '@common/enums/enums';
import { Letter, Tile } from '@common/interfaces/board-interface';
import { RoomClient } from '@common/interfaces/room';
import { Subject } from 'rxjs';
import { GamePageComponent } from './game-page.component';

describe('GamePageComponent', () => {
    let component: GamePageComponent;
    let fixture: ComponentFixture<GamePageComponent>;
    let chatboxServiceStub: Partial<ChatboxManagerService>;
    let sidebarStub: Partial<SidebarComponent>;
    let currentRoom: RoomClient;
    const roomEvent: Subject<RoomClient> = new Subject<RoomClient>();
    const messageEvent: Subject<void> = new Subject<void>();
    const timerEvent: Subject<number> = new Subject<number>();
    const synchronizeRackEvent: Subject<void> = new Subject();
    const boardEvent: Subject<Tile[][]> = new Subject<Tile[][]>();
    const rackEvent: Subject<Letter[]> = new Subject<Letter[]>();

    const ngOnInit = () => {
        return;
    };

    const init = () => {
        return;
    };

    const connectPlayer = () => {
        return;
    };

    let gameManagerStub: Partial<GameManagerService> = {
        boardEvent,
        roomEvent,
        rackEvent,
        connectPlayer,
    };

    const handleSockets = () => {
        return;
    };

    beforeEach(() => {
        currentRoom = { ...TEST_ROOM_CLIENT };
        chatboxServiceStub = {
            roomEvent,
            messageEvent,
            timerEvent,
            synchronizeRackEvent,
            init,
            handleSockets,
        };
        gameManagerStub = {
            boardEvent,
            roomEvent,
            rackEvent,
            connectPlayer,
        };
        sidebarStub = {
            currentRoom,
            timer: currentRoom.timer,
            currentPlayer: currentRoom.hostPlayer,
            ngOnInit,
        };
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppRoutingModule, AppMaterialModule, MatInputModule, FormsModule],
            declarations: [GamePageComponent, SidebarComponent, PlayAreaComponent, TextSizeButtonComponent, RackComponent, FormatTime],
            providers: [
                { provide: ChatboxManagerService, useValue: chatboxServiceStub },
                { provide: GameManagerService, useValue: gameManagerStub },
                { provide: SidebarComponent, useValue: sidebarStub },
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GamePageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should not change the value of gameOver if the room sent in the roomEvent from the \
gameManagerService does not have GameOver as its gameState', () => {
        component.gameOver = false;
        const expected = false;
        const testRoom = { ...TEST_ROOM_CLIENT };
        testRoom.gameState = GameState.GameAccepted;

        roomEvent.next(testRoom);

        expect(component.gameOver).toEqual(expected);
    });

    it('should change the value of gameOver to true if the room sent in the roomEvent from the \
gameManagerService has GameOver as its gameState', () => {
        component.gameOver = false;
        const expected = true;
        const testRoom = { ...TEST_ROOM_CLIENT };
        testRoom.gameState = GameState.GameOver;

        roomEvent.next(testRoom);

        expect(component.gameOver).toEqual(expected);
    });
});
