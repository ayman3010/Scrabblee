import { Injectable } from '@angular/core';
import {
    BORDERS_WIDTH,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    DEFAULT_LETTER_TEXT_SIZE,
    MAXIMUM_LETTER_TEXT_SIZE,
    MAX_TILE_INDEX,
    MINIMUM_LETTER_TEXT_SIZE,
    MINIMUM_TILE_INDEX,
    NUMBER_OF_TILES,
    TILES_HEIGHT,
    TILES_WIDTH,
    TILE_COUNT_HORIZONTAL,
    TILE_COUNT_VERTICAL,
} from '@app/classes/constants/board-dimensions';
import { Tools } from '@app/classes/tools/tools';
import { Letter, Tile } from '@common/interfaces/board-interface';
import { Vec2 } from '@common/interfaces/vec2';

export const DEFAULT_LETTER_VALUE_SIZE = DEFAULT_LETTER_TEXT_SIZE / 2;
export const MAXIMUM_SAVE_STACK_SIZE = 10;

export const TEMPORARY_TILE_BORDER_COLOR = '#800080';
const TEMPORARY_TILE_BORDER_WIDTH = 2;
const TILE_BORDER_WIDTH = 1;
const LETTER_TILE_COLOR = '#F2DCC6';
const LETTER_TILE_BORDER_COLOR = '#AF8B67';
const LETTER_LABEL_COLOR = 'black';
const VALUE_OFFSET_RATIO: Vec2 = { x: 10, y: 5 };
@Injectable({
    providedIn: 'root',
})
export class LetterPlacementService {
    gridContext: CanvasRenderingContext2D;
    private saveStack: ImageData[] = [];
    private textSize = { letter: DEFAULT_LETTER_TEXT_SIZE, letterValue: DEFAULT_LETTER_VALUE_SIZE };

    drawLetterTile(letter: Letter, tilePosition: Vec2, isTemporary: boolean = false) {
        if (tilePosition.x < 0 || tilePosition.y < 0 || tilePosition.x >= TILE_COUNT_HORIZONTAL || tilePosition.y >= TILE_COUNT_VERTICAL) {
            return;
        }
        this.drawBorderedTile(tilePosition, isTemporary);
        this.drawLetterTileLabel(letter, tilePosition);
    }

    drawBorderedTile(tilePosition: Vec2, isTemporary: boolean = false): void {
        this.drawTileBackground(tilePosition);
        this.drawTileBorders(tilePosition, isTemporary);
    }

    drawTileBackground(tilePosition: Vec2): void {
        this.gridContext.fillStyle = LETTER_TILE_COLOR;
        this.gridContext.fillRect(
            BORDERS_WIDTH + TILES_WIDTH * tilePosition.x,
            BORDERS_WIDTH + TILES_HEIGHT * tilePosition.y,
            TILES_WIDTH,
            TILES_HEIGHT,
        );
    }

    drawTileBorders(tilePosition: Vec2, isTemporary: boolean = false): void {
        this.gridContext.strokeStyle = isTemporary ? TEMPORARY_TILE_BORDER_COLOR : LETTER_TILE_BORDER_COLOR;
        this.gridContext.lineWidth = isTemporary ? TEMPORARY_TILE_BORDER_WIDTH : TILE_BORDER_WIDTH;
        this.gridContext.strokeRect(
            BORDERS_WIDTH + TILES_WIDTH * tilePosition.x,
            BORDERS_WIDTH + TILES_HEIGHT * tilePosition.y,
            TILES_WIDTH,
            TILES_HEIGHT,
        );
    }

    drawLetterTileLabel(letter: Letter, tilePosition: Vec2): void {
        this.drawLetterLabel(letter.letter, tilePosition);
        this.drawLetterValueLabel(letter.value, tilePosition);
    }

    drawLetterLabel(letter: string, tilePosition: Vec2): void {
        const letterOffset: Vec2 = { x: TILES_WIDTH / 2, y: (TILES_HEIGHT + (2 * this.textSize.letter) / 3) / 2 };
        this.gridContext.fillStyle = LETTER_LABEL_COLOR;
        this.gridContext.font = this.textSize.letter + 'px system-ui';
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(
            letter.toUpperCase(),
            BORDERS_WIDTH + letterOffset.x + TILES_WIDTH * tilePosition.x,
            BORDERS_WIDTH + letterOffset.y + TILES_HEIGHT * tilePosition.y,
            TILES_WIDTH,
        );
    }

    drawLetterValueLabel(letterValue: number, tilePosition: Vec2): void {
        const valueOffset: Vec2 = {
            x: TILES_WIDTH - this.textSize.letterValue / VALUE_OFFSET_RATIO.x,
            y: TILES_HEIGHT - this.textSize.letterValue / VALUE_OFFSET_RATIO.y,
        };
        this.gridContext.fillStyle = LETTER_LABEL_COLOR;
        this.gridContext.font = this.textSize.letterValue + 'px system-ui';
        this.gridContext.textAlign = 'right';
        this.gridContext.fillText(
            letterValue.toString(),
            BORDERS_WIDTH + valueOffset.x + tilePosition.x * TILES_WIDTH,
            BORDERS_WIDTH + valueOffset.y + tilePosition.y * TILES_HEIGHT,
            TILES_WIDTH,
        );
    }

    redrawBoard(board: Tile[][]): void {
        if (board.length === NUMBER_OF_TILES && board[0].length === NUMBER_OF_TILES) {
            Tools.clearGridContext(this.gridContext);
            for (const x of Tools.range(MINIMUM_TILE_INDEX, MAX_TILE_INDEX)) {
                for (const y of Tools.range(MINIMUM_TILE_INDEX, MAX_TILE_INDEX)) {
                    if (!board[x][y].tile.letter) continue;
                    this.drawLetterTile({ letter: board[x][y].tile.letter, value: board[x][y].tile.value }, { x, y });
                }
            }
        }
    }

    changeTextSize(newTextSize: number): void {
        if (newTextSize > MAXIMUM_LETTER_TEXT_SIZE || newTextSize < MINIMUM_LETTER_TEXT_SIZE) return;
        this.textSize.letter = newTextSize;
        this.textSize.letterValue = newTextSize / 2;
    }

    save(): void {
        if (this.saveStack.length < MAXIMUM_SAVE_STACK_SIZE) {
            const image = this.gridContext.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
            this.saveStack.push(image);
        }
    }

    load(): void {
        const saveState = this.saveStack.pop();
        if (saveState) this.gridContext.putImageData(saveState, 0, 0);
    }

    clearSaveStack(): void {
        this.saveStack = [];
    }
}
