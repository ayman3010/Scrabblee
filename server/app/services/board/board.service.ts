import { BackwardIterator } from '@app/classes/backward-iterator/backward-iterator';
import { BoardIterator } from '@app/classes/board-iterator/board-iterator';
import {
    DOUBLE_LETTER_POSITIONS,
    DOUBLE_WORD_POSITIONS,
    FIRST_TURN_POSITION,
    MAX_BOARD_WIDTH,
    MIN_BOARD_WIDTH,
    TRIPLE_LETTER_POSITIONS,
    TRIPLE_WORD_POSITIONS,
} from '@app/classes/constants/board-constant';
import { PlacementIterator } from '@app/classes/placement-iterator/placement-iterator';
import { WordValidationService } from '@app/services/word-validation/word-validation.service';
import { DEFAULT_DICTIONARY_ID } from '@common/constants/dictionary-constants';
import { NO_LETTER_LEFT } from '@common/constants/reserve-constant';
import { CommandType, Direction, Orientation } from '@common/enums/enums';
import { Board, Bonus, Position, Tile } from '@common/interfaces/board-interface';
import { PlaceCommand } from '@common/interfaces/command-interface';
import { Service } from 'typedi';

@Service()
export class BoardService {
    static readonly emptyBoard: Board = BoardService.createBoard();
    constructor(private wordValidation: WordValidationService) {}

    static createBoard(): Board {
        const tile: Tile[][] = [];

        for (let coordH = 0; coordH <= MAX_BOARD_WIDTH; coordH++) {
            tile[coordH] = [];
            for (let coordV = 0; coordV <= MAX_BOARD_WIDTH; coordV++) {
                tile[coordH][coordV] = { bonus: Bonus.Base, tile: { letter: '', value: 0 }, placedThisTurn: false };
            }
        }
        const board: Board = { content: tile, dictionaryId: DEFAULT_DICTIONARY_ID, placementAchieved: false };
        this.assignAllBonus(board);
        return board;
    }

    static copyBoard(board: Board): Board {
        const tile: Tile[][] = [];

        for (let coordH = 0; coordH <= MAX_BOARD_WIDTH; coordH++) {
            tile[coordH] = [];
            for (let coordV = 0; coordV <= MAX_BOARD_WIDTH; coordV++) {
                tile[coordH][coordV] = {
                    bonus: board.content[coordH][coordV].bonus,
                    tile: { letter: board.content[coordH][coordV].tile.letter, value: board.content[coordH][coordV].tile.value },
                    placedThisTurn: board.content[coordH][coordV].placedThisTurn,
                };
            }
        }
        return { content: tile, dictionaryId: board.dictionaryId, placementAchieved: false };
    }

    private static assignAllBonus(board: Board): void {
        this.assignBonus(board, DOUBLE_WORD_POSITIONS, Bonus.DoubleWord);
        this.assignBonus(board, DOUBLE_LETTER_POSITIONS, Bonus.DoubleLetter);
        this.assignBonus(board, TRIPLE_WORD_POSITIONS, Bonus.TripleWord);
        this.assignBonus(board, TRIPLE_LETTER_POSITIONS, Bonus.TripleLetter);
    }

    private static assignBonus(board: Board, bonusTiles: Position[], bonusType: Bonus): void {
        for (const tile of bonusTiles) {
            board.content[tile.coordV][tile.coordH].bonus = bonusType;
        }
    }

    isPlacementAttemptValid(isFirstTurn: boolean, command: PlaceCommand, board: Board): boolean {
        if (!isFirstTurn) {
            return this.isAnyNeighborFound(command, board);
        }
        if (command.lettersToPlace.length < 2 || !this.isPositionValid(command.placement)) return false;
        const placementIterator = new PlacementIterator(command, board);
        let nbLetters = command.lettersToPlace.length;
        let isFirstPlacementValid = false;
        while (nbLetters > NO_LETTER_LEFT) {
            if (
                placementIterator.getPosition().coordH === FIRST_TURN_POSITION.coordH &&
                placementIterator.getPosition().coordV === FIRST_TURN_POSITION.coordV
            ) {
                isFirstPlacementValid = true;
            }
            placementIterator.next();
            nbLetters--;
        }
        return isFirstPlacementValid;
    }

    goToFirstLetter(position: Position, iterationOrientation: Orientation, board: Board): number {
        const command = {
            commandType: CommandType.Place,
            senderName: '',
            lettersToPlace: '',

            orientation: iterationOrientation,
            placement: position,
        };
        const backWardIterator = new BackwardIterator(command, board);
        const direction = iterationOrientation === Orientation.Horizontal ? Direction.Left : Direction.Up;
        while (
            this.isInBoard(backWardIterator.getPrevious()) &&
            backWardIterator.checkNeighbor(backWardIterator.getModifiedPosition(backWardIterator.getPrevious()), direction, board)
        ) {
            backWardIterator.previous();
        }
        return backWardIterator.getPrevious();
    }

    isInBoard(position: number): boolean {
        if (position < MIN_BOARD_WIDTH) {
            return false;
        }
        if (position > MAX_BOARD_WIDTH) {
            return false;
        }
        return true;
    }

    isValidPlacement(command: PlaceCommand, board: Board): boolean {
        let isConnectedWordValid = true;
        let wordFound = '';
        const iterator = new BoardIterator(command, board);
        const firstLetterIndex = this.goToFirstLetter(command.placement, command.orientation, board);
        for (let i = firstLetterIndex; i <= MAX_BOARD_WIDTH && iterator.getTileAtCoord(i).tile.letter !== ''; i++) {
            if (iterator.isNeighborFound(iterator.getModifiedPosition(i), board)) {
                isConnectedWordValid = isConnectedWordValid && this.neighborWordValidation(command, iterator.getModifiedPosition(i), board);
            }
            wordFound += iterator.getTileAtCoord(i).tile.letter;
        }
        if (wordFound.length === 1 && isConnectedWordValid) {
            return true;
        }
        return this.wordValidation.inDictionary(board.dictionaryId, wordFound) && isConnectedWordValid;
    }

    private neighborWordValidation(command: PlaceCommand, position: Position, board: Board): boolean {
        let wordFound = '';
        const oppositeOrientation = command.orientation === Orientation.Horizontal ? Orientation.Vertical : Orientation.Horizontal;
        const newCommand = {
            commandType: CommandType.Place,
            senderName: '',

            lettersToPlace: '',
            orientation: oppositeOrientation,
            placement: position,
        };
        const simpleIterator = new BoardIterator(newCommand, board);
        const firstLetterIndex = this.goToFirstLetter(position, oppositeOrientation, board);
        for (let i = firstLetterIndex; i <= MAX_BOARD_WIDTH && simpleIterator.getTileAtCoord(i).tile.letter !== ''; i++) {
            wordFound += simpleIterator.getTileAtCoord(i).tile.letter;
        }
        if (wordFound.length === 1) {
            return true;
        }
        return this.wordValidation.inDictionary(board.dictionaryId, wordFound);
    }

    private isAnyNeighborFound(command: PlaceCommand, board: Board): boolean {
        const iterator = new BoardIterator(command, board);
        for (let i = 0; i < command.lettersToPlace.length; i++) {
            const correspondingCoord = iterator.getCoord();
            if (
                iterator.isNeighborFound(iterator.getModifiedPosition(i + correspondingCoord), board) ||
                this.checkNeighborFirstAndLastLetter(command, board)
            )
                return true;
        }
        return false;
    }

    private checkNeighborFirstAndLastLetter(command: PlaceCommand, board: Board): boolean {
        const iterator = new BoardIterator(command, board);
        const firstLetterPosition = iterator.getCoord();
        const lastLetterPosition = firstLetterPosition + command.lettersToPlace.length - 1;
        const startPosition = iterator.getModifiedPosition(firstLetterPosition);
        const endPosition = iterator.getModifiedPosition(lastLetterPosition);
        if (command.orientation === Orientation.Horizontal) {
            if (iterator.checkNeighbor(startPosition, Direction.Left, board)) {
                return true;
            } else {
                return iterator.checkNeighbor(endPosition, Direction.Right, board);
            }
        } else {
            if (iterator.checkNeighbor(startPosition, Direction.Up, board)) {
                return true;
            } else {
                return iterator.checkNeighbor(endPosition, Direction.Down, board);
            }
        }
    }

    private isPositionValid(position: Position): boolean {
        if (position.coordH > MAX_BOARD_WIDTH || position.coordH < MIN_BOARD_WIDTH) {
            return false;
        } else if (position.coordV > MAX_BOARD_WIDTH || position.coordV < MIN_BOARD_WIDTH) return false;
        return true;
    }
}
