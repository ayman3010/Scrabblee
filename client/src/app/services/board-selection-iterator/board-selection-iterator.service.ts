import { Injectable } from '@angular/core';
import { Tools } from '@app/classes/tools/tools';
import { BoardSelectionService } from '@app/services/board-selection/board-selection.service';
import { Orientation } from '@common/enums/enums';
import { Vec2 } from '@common/interfaces/vec2';

export const NO_SELECTION: Vec2 = { x: -1, y: -1 };

@Injectable({
    providedIn: 'root',
})
export class BoardSelectionIteratorService {
    orientation: Orientation = Orientation.Horizontal;
    selectionPosition: Vec2 = NO_SELECTION;
    startSelectionPosition: Vec2 = NO_SELECTION;

    constructor(private boardSelection: BoardSelectionService) {}

    changeOrientation(): void {
        if (this.orientation === Orientation.Horizontal) this.orientation = Orientation.Vertical;
        else this.orientation = Orientation.Horizontal;
    }

    hasNext(): boolean {
        const newPosition = { ...this.selectionPosition };
        if (this.orientation === Orientation.Horizontal) newPosition.x++;
        else newPosition.y++;
        return Tools.isInBounds(newPosition);
    }

    hasPrevious(): boolean {
        return this.orientation === Orientation.Horizontal
            ? this.startSelectionPosition.x < this.selectionPosition.x
            : this.startSelectionPosition.y < this.selectionPosition.y;
    }

    next(): void {
        if (this.orientation === Orientation.Horizontal) this.selectionPosition.x++;
        else this.selectionPosition.y++;
    }

    previous(): void {
        if (this.orientation === Orientation.Horizontal) this.selectionPosition.x--;
        else this.selectionPosition.y--;
    }

    draw(): void {
        this.boardSelection.drawBoardSelection(this.selectionPosition, this.orientation);
    }

    set newSelectionPosition(newPosition: Vec2) {
        if (this.selectionPosition.x === newPosition.x && this.selectionPosition.y === newPosition.y) this.changeOrientation();
        else {
            this.selectionPosition = newPosition;
            this.startSelectionPosition = { ...newPosition };
        }
        this.draw();
    }

    set gridContext(gridContext: CanvasRenderingContext2D) {
        this.boardSelection.gridContext = gridContext;
    }
}
