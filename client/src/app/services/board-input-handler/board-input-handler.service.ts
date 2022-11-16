import { Injectable } from '@angular/core';
import { BORDERS_WIDTH, TILES_HEIGHT, TILES_WIDTH } from '@app/classes/constants/board-dimensions';
import { MouseButton } from '@app/classes/enums/mouse-button.enum';
import { Tools } from '@app/classes/tools/tools';
import { NO_SELECTION } from '@app/services/board-selection/board-selection.service';
import { BoardService } from '@app/services/board/board.service';
import { ClearBoardSelectionService } from '@app/services/clear-board-selection/clear-board-selection.service';
import { Vec2 } from '@common/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class BoardInputHandlerService {
    constructor(private boardService: BoardService, private clearBoardEventDetector: ClearBoardSelectionService) {
        this.clearBoardEventDetector.clearBoardEvent.asObservable().subscribe(() => {
            this.boardService.clear();
        });
    }

    handleBoardClick(clickEvent: MouseEvent): void {
        if (clickEvent.button === MouseButton.Left) {
            this.newSelectionPosition = { x: clickEvent.offsetX, y: clickEvent.offsetY };
        }
    }

    handleKeyboard(keyboardEvent: KeyboardEvent): void {
        switch (keyboardEvent.key) {
            case 'Backspace': {
                this.boardService.removeLastLetter();
                break;
            }
            case 'Escape': {
                this.boardService.clear();
                break;
            }
            case 'Enter': {
                this.confirmPlacement();
                break;
            }
            default:
                if (keyboardEvent.key.length === 1)
                    this.boardService.placeLetter(keyboardEvent.key.toUpperCase().normalize('NFD')[0], keyboardEvent.shiftKey);
        }
    }

    translateTilePosition(tilePosition: Vec2): Vec2 {
        return { x: Math.floor((tilePosition.x - BORDERS_WIDTH) / TILES_WIDTH), y: Math.floor((tilePosition.y - BORDERS_WIDTH) / TILES_HEIGHT) };
    }

    confirmPlacement(): void {
        this.boardService.sendCommand();
    }

    init(): void {
        this.boardService.initBoard();
    }

    set boardSelectionGridContext(gridContext: CanvasRenderingContext2D) {
        this.boardService.boardSelectionGridContext = gridContext;
    }

    set letterPlacementGridContext(gridContext: CanvasRenderingContext2D) {
        this.boardService.letterPlacementGridContext = gridContext;
    }

    set newSelectionPosition(tilePosition: Vec2) {
        const translatedTilePosition = this.translateTilePosition(tilePosition);
        this.boardService.newBoardIterator = Tools.isInBounds(translatedTilePosition) ? translatedTilePosition : NO_SELECTION;
    }

    set textSize(newTextSize: number) {
        this.boardService.textSize = newTextSize;
    }
}
