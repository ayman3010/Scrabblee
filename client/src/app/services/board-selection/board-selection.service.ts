import { Injectable } from '@angular/core';
import { BORDERS_WIDTH, TILES_HEIGHT, TILES_WIDTH } from '@app/classes/constants/board-dimensions';
import { Tools } from '@app/classes/tools/tools';
import { Orientation } from '@common/enums/enums';
import { Vec2 } from '@common/interfaces/vec2';

export const CHAR_RIGHT_ARROW = '\u21E8';
export const CHAR_DOWN_ARROW = '\u21E9';
const INTERFACE_TILE_BORDER_COLOR = 'purple';
const SIZE_INFO = 'px system-ui';
const ARROW_COLOR = 'yellow';
const ARROW_CHAR_SIZE = TILES_HEIGHT;
export const NO_SELECTION: Vec2 = { x: -1, y: -1 };

@Injectable({
    providedIn: 'root',
})
export class BoardSelectionService {
    gridContext: CanvasRenderingContext2D;

    drawBoardSelection(tilePosition: Vec2, orientation: Orientation): void {
        Tools.clearGridContext(this.gridContext);
        if (Tools.isInBounds(tilePosition)) this.drawSelectionTile(tilePosition, orientation);
    }

    drawSelectionTile(tilePosition: Vec2, orientation: Orientation): void {
        this.drawTileBorders(tilePosition);
        this.drawOrientation(tilePosition, orientation);
    }

    drawTileBorders(tilePosition: Vec2): void {
        this.gridContext.strokeStyle = INTERFACE_TILE_BORDER_COLOR;
        this.gridContext.lineWidth = 6;
        this.gridContext.strokeRect(
            BORDERS_WIDTH + TILES_WIDTH * tilePosition.x,
            BORDERS_WIDTH + TILES_HEIGHT * tilePosition.y,
            TILES_WIDTH,
            TILES_HEIGHT,
        );
    }

    drawOrientation(tilePosition: Vec2, orientation: Orientation): void {
        const charArrow = orientation === Orientation.Horizontal ? CHAR_RIGHT_ARROW : CHAR_DOWN_ARROW;
        const drawPosition: Vec2 = {
            x: BORDERS_WIDTH + TILES_WIDTH * tilePosition.x + TILES_WIDTH / 2,
            y: BORDERS_WIDTH + TILES_HEIGHT * tilePosition.y + TILES_HEIGHT / 2,
        };
        this.gridContext.fillStyle = ARROW_COLOR;
        this.gridContext.font = ARROW_CHAR_SIZE + SIZE_INFO;
        this.gridContext.textBaseline = 'middle';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(charArrow, drawPosition.x, drawPosition.y, TILES_WIDTH);
    }
}
