import { PlacementIterator } from '@app/classes/placement-iterator/placement-iterator';
import { BoardService } from '@app/services/board/board.service';
import { Board, Position } from '@common/interfaces/board-interface';
import { PlaceCommand } from '@common/interfaces/command-interface';
import { Service } from 'typedi';

@Service()
export class BoardPlacementService {
    constructor(private boardService: BoardService) {}

    placeLetters(command: PlaceCommand, isFirstTurn: boolean, board: Board): Position[] {
        const placementIterator = new PlacementIterator(command, board);

        if (!this.boardService.isPlacementAttemptValid(isFirstTurn, command, board)) {
            board.placementAchieved = false;
            return [];
        }

        while (placementIterator.isValid() && placementIterator.nbLetterPlaced < command.lettersToPlace.length) {
            placementIterator.placeLetter();
            placementIterator.next();
        }
        return this.placementResult(command, board, placementIterator.getPlacedLettersPositions());
    }

    removeChecksAndBonuses(command: PlaceCommand, board: Board, placedLettersPositions: Position[]): Board {
        const placementIterator = new PlacementIterator(command, board);

        placementIterator.removeChecksAndBonuses(placedLettersPositions);

        return board;
    }

    removeLetters(command: PlaceCommand, board: Board, placedLettersPositions: Position[]): void {
        const placementIterator = new PlacementIterator(command, board);

        placementIterator.removeLetters(placedLettersPositions);
    }

    private placementResult(command: PlaceCommand, board: Board, placedLettersPositions: Position[]): Position[] {
        const placementIterator = new PlacementIterator(command, board);
        if (this.boardService.isValidPlacement(command, board)) {
            board.placementAchieved = true;
        } else {
            placementIterator.removeLetters(placedLettersPositions);
            placedLettersPositions = [];
        }
        return placedLettersPositions;
    }
}
