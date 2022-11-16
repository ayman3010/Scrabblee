import { Injectable } from '@angular/core';
import { MINIMUM_TILE_INDEX, NUMBER_OF_TILES } from '@app/classes/constants/board-dimensions';
import { LetterPlacement } from '@app/classes/interfaces/letter-placement';
import { Tools } from '@app/classes/tools/tools';
import { BoardSelectionIteratorService, NO_SELECTION } from '@app/services/board-selection-iterator/board-selection-iterator.service';
import { ChatboxManagerService } from '@app/services/chatbox-manager/chatbox-manager.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { LetterPlacementService } from '@app/services/letter-placement/letter-placement.service';
import { RackService } from '@app/services/rack/rack.service';
import { BONUS_LETTER } from '@common/constants/reserve-constant';
import { Tile } from '@common/interfaces/board-interface';
import { Vec2 } from '@common/interfaces/vec2';

@Injectable({
    providedIn: 'root',
})
export class BoardService {
    board: Tile[][] = [];
    currentWord: LetterPlacement[] = [];

    constructor(
        private readonly letterService: LetterPlacementService,
        private gameManager: GameManagerService,
        private boardSelection: BoardSelectionIteratorService,
        private rack: RackService,
        private commandSender: ChatboxManagerService,
    ) {
        this.initBoard();

        this.gameManager.boardEvent.asObservable().subscribe((board: Tile[][]) => {
            this.board = board;
            this.currentWord = [];
            this.newBoardIterator = NO_SELECTION;
            this.letterService.clearSaveStack();
            this.letterService.redrawBoard(this.board);
            this.letterService.save();
        });
    }

    initBoard(): void {
        for (let coordV = MINIMUM_TILE_INDEX; coordV < NUMBER_OF_TILES; coordV++) {
            this.board[coordV] = [];
            for (let coordH = MINIMUM_TILE_INDEX; coordH < NUMBER_OF_TILES; coordH++) {
                this.board[coordV][coordH] = { bonus: 0, tile: { letter: '', value: 0 }, placedThisTurn: false };
            }
        }
    }

    placeLetter(letter: string, isBlank: boolean = false): boolean {
        if (!Tools.isInBounds(this.boardSelection.selectionPosition) || !/^[A-Z]+$/.test(letter)) return false;

        const letterToFind = isBlank ? BONUS_LETTER : letter;
        const letterToPlace = this.rack.removeLetter(letterToFind);
        if (!letterToPlace) return false;

        if (isBlank) letterToPlace.letter = letter;

        this.currentWord.push({ letter: { ...letterToPlace }, position: { ...this.boardSelection.selectionPosition } });
        this.letterService.save();
        this.letterService.drawLetterTile(letterToPlace, this.boardSelection.selectionPosition, true);
        this.goToNextPosition();
        this.boardSelection.draw();
        return true;
    }

    removeLastLetter(): void {
        const lastLetter = this.currentWord.pop();
        if (!lastLetter) return;

        this.letterService.load();
        this.rack.addLetter(lastLetter.letter);
        this.goToPreviousPosition();
        this.boardSelection.draw();
    }

    clear(): void {
        while (this.currentWord.length !== 0) {
            this.removeLastLetter();
        }
        this.newBoardIterator = NO_SELECTION;
    }

    sendCommand(): void {
        if (this.currentWord.length !== 0) this.commandSender.sendCommand(this.placeCommand);
    }

    private goToNextPosition(): void {
        do {
            if (!this.boardSelection.hasNext()) {
                this.boardSelection.next();
                break;
            }
            this.boardSelection.next();
        } while (this.board[this.boardSelection.selectionPosition.x][this.boardSelection.selectionPosition.y].tile.letter !== '');
    }

    private goToPreviousPosition(): void {
        do {
            if (!this.boardSelection.hasPrevious()) break;
            this.boardSelection.previous();
        } while (this.board[this.boardSelection.selectionPosition.x][this.boardSelection.selectionPosition.y].tile.letter !== '');
    }

    get placeCommand(): string {
        return '!placer ' + this.placementToString + ' ' + this.wordInString;
    }

    private get wordInString(): string {
        let word = '';
        for (const letter of this.currentWord) {
            word += letter.letter.value === 0 ? letter.letter.letter.toUpperCase() : letter.letter.letter.toLowerCase();
        }
        return word;
    }

    private get placementToString(): string {
        return Tools.coordinatesToString(this.boardSelection.startSelectionPosition) + Tools.orientationToString(this.boardSelection.orientation);
    }

    set letterPlacementGridContext(gridContext: CanvasRenderingContext2D) {
        this.letterService.gridContext = gridContext;
    }

    set boardSelectionGridContext(gridContext: CanvasRenderingContext2D) {
        this.boardSelection.gridContext = gridContext;
    }

    set textSize(newTextSize: number) {
        this.letterService.changeTextSize(newTextSize);
        this.letterService.clearSaveStack();
        this.letterService.redrawBoard(this.board);
        for (const letter of this.currentWord) {
            this.letterService.save();
            this.letterService.drawLetterTile(letter.letter, letter.position, true);
        }
    }

    set newBoardIterator(selectionPosition: Vec2) {
        if (
            this.currentWord.length === 0 &&
            (!Tools.isInBounds(selectionPosition) || this.board[selectionPosition.x][selectionPosition.y].tile.letter === '')
        )
            this.boardSelection.newSelectionPosition = selectionPosition;
    }
}
