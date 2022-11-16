import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@app/classes/constants/board-dimensions';
import { PlayAreaComponent } from '@app/components/play-area/play-area.component';
import { RackComponent } from '@app/components/rack/rack.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { BoardInputHandlerService } from '@app/services/board-input-handler/board-input-handler.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GridService } from '@app/services/grid/grid.service';
import { RackInputHandlerService } from '@app/services/rack-input-handler/rack-input-handler.service';
import { TEST_PLAYER } from '@common/constants/test-room';
import { Letter } from '@common/interfaces/board-interface';
import { RoomClient } from '@common/interfaces/room';
import { Subject } from 'rxjs';

describe('PlayAreaComponent', () => {
    let component: PlayAreaComponent;
    let fixture: ComponentFixture<PlayAreaComponent>;
    let boardInputHandlerSpy: jasmine.SpyObj<BoardInputHandlerService>;
    let inputHandlerSpy: jasmine.SpyObj<RackInputHandlerService>;
    const roomEvent: Subject<RoomClient> = new Subject<RoomClient>();
    const currentPlayer = { ...TEST_PLAYER };
    const isTurn = currentPlayer?.isTurn;
    const reserveSize = 69;

    let gameManagerServiceStub: Partial<GameManagerService> = {
        roomEvent,
        isTurn,
        reserveSize,
    };

    beforeEach(() => {
        boardInputHandlerSpy = jasmine.createSpyObj('BoardInputHandlerService', ['handleBoardClick', 'handleKeyboard', 'init', 'confirmPlacement']);
        inputHandlerSpy = jasmine.createSpyObj('RackInputHandlerService', ['']);
        inputHandlerSpy.rackClientEvent = new Subject<Letter[]>();
        inputHandlerSpy.selectionEvent = new Subject<number>();
        inputHandlerSpy.isTurnEvent = new Subject<boolean>();
        gameManagerServiceStub = {
            roomEvent,
            isTurn,
            reserveSize,
        };
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppMaterialModule],
            declarations: [PlayAreaComponent, RackComponent],
            providers: [
                { provide: BoardInputHandlerService, useValue: boardInputHandlerSpy },
                { provide: RackInputHandlerService, useValue: inputHandlerSpy },
                { provide: GameManagerService, useValue: gameManagerServiceStub },
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayAreaComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('ngAfterViewInit should call initializeBoard', () => {
        const spy = spyOn(component.grid, 'initializeBoard');
        component.ngAfterViewInit();
        expect(spy).toHaveBeenCalled();
    });

    it('get height should return the height of the canvas', () => {
        expect(component.height).toEqual(CANVAS_HEIGHT);
    });

    it('get width should return the width of the canvas', () => {
        expect(component.width).toEqual(CANVAS_WIDTH);
    });

    it('get grid should return the grid service', () => {
        expect(component.grid).toBeInstanceOf(GridService);
    });

    it('get boardInputHandler should return the BoardInputHandler service', () => {
        expect(component.boardInputHandler).toBe(boardInputHandlerSpy);
    });

    it('mouseHitDetect should call handleBoardClick with event', () => {
        const event = new MouseEvent('click');
        component.mouseHitDetect(event);
        expect(boardInputHandlerSpy.handleBoardClick).toHaveBeenCalledWith(event);
    });

    it('mouseHitDetect should not call handleBoardClick with event if gameOver is true', () => {
        const event = new MouseEvent('click');
        component.gameOver = true;
        component.mouseHitDetect(event);
        expect(boardInputHandlerSpy.handleBoardClick).not.toHaveBeenCalled();
    });

    it('keyboardDetect should call handleKeyboard of BoardService', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'a' });
        component.keyboardDetect(keyboardEvent);
        expect(boardInputHandlerSpy.handleKeyboard).toHaveBeenCalledWith(keyboardEvent);
    });

    it('keyboardDetect should not call handleKeyboard of BoardService if gameOver is true', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'a' });
        component.gameOver = true;
        component.keyboardDetect(keyboardEvent);
        expect(boardInputHandlerSpy.handleKeyboard).not.toHaveBeenCalled();
    });

    it('play should call confirmPlacement of BoardService', () => {
        component.play();
        expect(boardInputHandlerSpy.confirmPlacement).toHaveBeenCalled();
    });

    it('gameManager.roomEvent.next() should update isTurn and reserveSize', () => {
        component.isTurn = false;
        currentPlayer.isTurn = true;
        component.reserveSize = 420;

        gameManagerServiceStub.roomEvent = roomEvent;
        gameManagerServiceStub.roomEvent.next();

        expect(component.isTurn).toEqual(true);
        expect(component.reserveSize).toEqual(reserveSize);
    });
});
