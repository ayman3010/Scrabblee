import { Injectable } from '@angular/core';
import {
    BORDERS_WIDTH,
    CANVAS_HEIGHT,
    CANVAS_WIDTH,
    GRID_HEIGHT,
    GRID_WIDTH,
    TILES_HEIGHT,
    TILES_WIDTH,
    TILE_COUNT_HORIZONTAL,
    TILE_COUNT_VERTICAL,
} from '@app/classes/constants/board-dimensions';
import {
    DOUBLE_LETTER,
    DOUBLE_LETTER_POSITIONS,
    DOUBLE_WORD,
    DOUBLE_WORD_POSITIONS,
    TRIPLE_LETTER,
    TRIPLE_LETTER_POSITIONS,
    TRIPLE_WORD,
    TRIPLE_WORD_POSITIONS,
} from '@common/constants/board';
import { BonusTile } from '@common/interfaces/bonus-tile';
import { Vec2 } from '@common/interfaces/vec2';

export const MULTIPLIER_SYMBOL = 'x';
export const STAR_CHAR = '\u2605';

export const DEFAULT_LABEL_SIZE = 20;
export const DEFAULT_BONUS_TEXT_SIZE = 10;

const BORDERS_COLOR = '#036e08';
const GRID_COLOR = '#e3cfaa';
const LABEL_COLOR = 'white';
const BONUS_TILE_LABEL_COLOR = 'black';
const LINE_COLOR = 'white';
const LINE_WIDTH = 1;

const SIZE_INFO = 'px system-ui';
const STAR_CHAR_SIZE = TILES_HEIGHT;

const RATIO_OFFSET = 10;
export const TEXT_OFFSET: Vec2 = { x: TILES_WIDTH / 2, y: TILES_HEIGHT / 2 - DEFAULT_BONUS_TEXT_SIZE / RATIO_OFFSET };
export const MULTIPLIER_OFFSET: Vec2 = { x: TILES_WIDTH / 2, y: TEXT_OFFSET.y + DEFAULT_BONUS_TEXT_SIZE };
const LABEL_ROW_OFFSET: Vec2 = { x: BORDERS_WIDTH / 2, y: (TILES_HEIGHT + (2 * DEFAULT_LABEL_SIZE) / 3) / 2 };
const LABEL_COLUMN_OFFSET: Vec2 = { x: TILES_HEIGHT / 2, y: (BORDERS_WIDTH + (2 * DEFAULT_LABEL_SIZE) / 3) / 2 };
export const STAR_OFFSET: Vec2 = { x: TILES_WIDTH / 2, y: (TILES_HEIGHT + (2 * STAR_CHAR_SIZE) / 3) / 2 };

const CENTER_TILE_POSITION: Vec2 = { x: 7, y: 7 };

@Injectable({
    providedIn: 'root',
})
export class GridService {
    gridContext: CanvasRenderingContext2D;

    initializeBoard(): void {
        this.drawBorders();
        this.drawGrid();
    }

    drawBorders(): void {
        this.drawBordersBackground();
        this.drawLabels();
    }

    drawBordersBackground(): void {
        this.gridContext.fillStyle = BORDERS_COLOR;
        this.gridContext.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }

    drawLabels(): void {
        this.drawColumnLabels();
        this.drawRowLabels();
    }

    drawColumnLabels(): void {
        this.gridContext.fillStyle = LABEL_COLOR;
        this.gridContext.font = DEFAULT_LABEL_SIZE + SIZE_INFO;
        this.gridContext.textAlign = 'center';
        for (let i = 0; i < TILE_COUNT_HORIZONTAL; i++) {
            this.gridContext.fillText(
                (i + 1).toString(),
                BORDERS_WIDTH + LABEL_COLUMN_OFFSET.x + i * TILES_WIDTH,
                LABEL_COLUMN_OFFSET.y,
                TILES_WIDTH,
            );
        }
    }

    drawRowLabels(): void {
        this.gridContext.fillStyle = LABEL_COLOR;
        this.gridContext.font = DEFAULT_LABEL_SIZE + SIZE_INFO;
        this.gridContext.textAlign = 'center';
        const asciiStart = 65;
        for (let i = 0; i < TILE_COUNT_VERTICAL; i++) {
            this.gridContext.fillText(
                String.fromCharCode(i + asciiStart),
                LABEL_ROW_OFFSET.x,
                BORDERS_WIDTH + LABEL_ROW_OFFSET.y + i * TILES_HEIGHT,
                BORDERS_WIDTH,
            );
        }
    }

    drawGrid(): void {
        this.drawGridBackground();
        this.drawAllBonusTiles();
        this.drawGridLines();
    }

    drawGridBackground(): void {
        this.gridContext.fillStyle = GRID_COLOR;
        this.gridContext.fillRect(BORDERS_WIDTH, BORDERS_WIDTH, GRID_WIDTH, GRID_HEIGHT);
    }

    drawGridLines(): void {
        this.gridContext.beginPath();
        this.traceGridLines();
        this.gridContext.strokeStyle = LINE_COLOR;
        this.gridContext.lineWidth = LINE_WIDTH;
        this.gridContext.stroke();
    }

    traceGridLines(): void {
        for (let i = 0; i <= TILE_COUNT_HORIZONTAL; i++) {
            const lineStart = { x: BORDERS_WIDTH + i * TILES_WIDTH, y: BORDERS_WIDTH };
            const lineEnd = { x: BORDERS_WIDTH + i * TILES_WIDTH, y: BORDERS_WIDTH + GRID_HEIGHT };
            this.traceLine(lineStart, lineEnd);
        }

        for (let i = 0; i <= TILE_COUNT_VERTICAL; i++) {
            const lineStart = { x: BORDERS_WIDTH, y: BORDERS_WIDTH + i * TILES_HEIGHT };
            const lineEnd = { x: BORDERS_WIDTH + GRID_WIDTH, y: BORDERS_WIDTH + i * TILES_HEIGHT };
            this.traceLine(lineStart, lineEnd);
        }
    }

    traceLine(lineStart: Vec2, lineEnd: Vec2): void {
        this.gridContext.moveTo(lineStart.x, lineStart.y);
        this.gridContext.lineTo(lineEnd.x, lineEnd.y);
    }

    drawAllBonusTiles(): void {
        this.drawBonusTiles(TRIPLE_LETTER, TRIPLE_LETTER_POSITIONS);
        this.drawBonusTiles(DOUBLE_LETTER, DOUBLE_LETTER_POSITIONS);
        this.drawBonusTiles(TRIPLE_WORD, TRIPLE_WORD_POSITIONS);
        this.drawBonusTiles(DOUBLE_WORD, DOUBLE_WORD_POSITIONS);
        this.drawCenterTile();
    }

    drawBonusTiles(bonusTile: BonusTile, positions: Vec2[]): void {
        for (const position of positions) {
            this.drawBonusTile(bonusTile, position);
        }
    }

    drawBonusTile(bonusTile: BonusTile, tilePosition: Vec2): void {
        if (tilePosition.x < 0 || tilePosition.y < 0 || tilePosition.x >= TILE_COUNT_HORIZONTAL || tilePosition.y >= TILE_COUNT_VERTICAL) {
            return;
        }
        this.drawTileBackground(bonusTile.color, tilePosition);
        this.drawBonusTileLabel(bonusTile, tilePosition);
    }

    drawTileBackground(color: string, tilePosition: Vec2): void {
        this.gridContext.fillStyle = color;
        this.gridContext.fillRect(
            BORDERS_WIDTH + TILES_WIDTH * tilePosition.x,
            BORDERS_WIDTH + TILES_HEIGHT * tilePosition.y,
            TILES_WIDTH,
            TILES_HEIGHT,
        );
    }

    drawBonusTileLabel(bonusTile: BonusTile, tilePosition: Vec2): void {
        const drawPosition: Vec2 = { x: BORDERS_WIDTH + TILES_WIDTH * tilePosition.x, y: BORDERS_WIDTH + TILES_HEIGHT * tilePosition.y };
        const multiplierString = MULTIPLIER_SYMBOL + bonusTile.multiplier;
        this.gridContext.fillStyle = BONUS_TILE_LABEL_COLOR;
        this.gridContext.font = DEFAULT_BONUS_TEXT_SIZE + SIZE_INFO;
        this.gridContext.textAlign = 'center';
        this.gridContext.fillText(bonusTile.text, drawPosition.x + TEXT_OFFSET.x, drawPosition.y + TEXT_OFFSET.y, TILES_WIDTH);
        this.gridContext.fillText(multiplierString, drawPosition.x + MULTIPLIER_OFFSET.x, drawPosition.y + MULTIPLIER_OFFSET.y, TILES_WIDTH);
    }

    drawCenterTile(): void {
        this.drawTileBackground(DOUBLE_WORD.color, CENTER_TILE_POSITION);
        this.drawStar(CENTER_TILE_POSITION);
    }

    drawStar(tilePosition: Vec2): void {
        const drawPosition: Vec2 = { x: BORDERS_WIDTH + TILES_WIDTH * tilePosition.x, y: BORDERS_WIDTH + TILES_HEIGHT * tilePosition.y };
        this.gridContext.fillStyle = BONUS_TILE_LABEL_COLOR;
        this.gridContext.font = STAR_CHAR_SIZE + SIZE_INFO;
        this.gridContext.fillText(STAR_CHAR, drawPosition.x + STAR_OFFSET.x, drawPosition.y + STAR_OFFSET.y, TILES_WIDTH);
    }
}
