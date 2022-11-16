import { AfterViewInit, Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { CANVAS_HEIGHT, CANVAS_WIDTH } from '@app/classes/constants/board-dimensions';
import { BoardInputHandlerService } from '@app/services/board-input-handler/board-input-handler.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { GridService } from '@app/services/grid/grid.service';
import { RESERVE_CAPACITY } from '@common/constants/reserve-constant';

@Component({
    selector: 'app-play-area',
    templateUrl: './play-area.component.html',
    styleUrls: ['./play-area.component.scss'],
})
export class PlayAreaComponent implements AfterViewInit, OnInit {
    @Input() gameOver: boolean = false;
    @ViewChild('boardLayer', { static: false }) private boardLayer!: ElementRef<HTMLCanvasElement>;
    @ViewChild('wordsLayer', { static: false }) private wordsLayer!: ElementRef<HTMLCanvasElement>;
    @ViewChild('interfaceLayer', { static: false }) private interfaceLayer!: ElementRef<HTMLCanvasElement>;

    isTurn: boolean = true;
    reserveSize: number = RESERVE_CAPACITY;

    private canvasSize = { x: CANVAS_WIDTH, y: CANVAS_HEIGHT };

    constructor(
        private readonly gridService: GridService,
        private readonly boardService: BoardInputHandlerService,
        private readonly gameManager: GameManagerService,
    ) {
        gameManager.roomEvent.asObservable().subscribe(() => {
            this.isTurn = this.gameManager.isTurn;
            this.reserveSize = this.gameManager.reserveSize;
        });
    }

    @HostListener('keydown', ['$event'])
    keyboardDetect(event: KeyboardEvent): void {
        if (!this.gameOver) this.boardService.handleKeyboard(event);
    }

    mouseHitDetect(event: MouseEvent): void {
        if (!this.gameOver) this.boardService.handleBoardClick(event);
    }

    play(): void {
        this.boardInputHandler.confirmPlacement();
    }

    ngOnInit(): void {
        this.boardInputHandler.init();
    }

    ngAfterViewInit(): void {
        this.gridService.gridContext = this.boardLayer.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.boardService.letterPlacementGridContext = this.wordsLayer.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.boardService.boardSelectionGridContext = this.interfaceLayer.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridService.initializeBoard();
        this.boardLayer.nativeElement.focus();
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    get grid(): GridService {
        return this.gridService;
    }

    get boardInputHandler(): BoardInputHandlerService {
        return this.boardService;
    }
}
