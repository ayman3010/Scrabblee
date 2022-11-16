import { BoardIterator } from '@app/classes/board-iterator/board-iterator';
import { BONUS_VALUE, MAX_BOARD_WIDTH, NO_POINTS } from '@app/classes/constants/board-constant';
import { BoardService } from '@app/services/board/board.service';
import { Orientation } from '@common/enums/enums';
import { Board, Bonus, Position, Tile } from '@common/interfaces/board-interface';
import { PlaceCommand } from '@common/interfaces/command-interface';
import { Service } from 'typedi';

@Service()
export class PointCalculationService {
    constructor(private boardService: BoardService) {}

    calculatePoints(command: PlaceCommand, board: Board): number {
        const points = this.pointCalculator(command, board);
        return points;
    }

    calculatePossiblePoints(command: PlaceCommand, board: Board): number {
        const points = this.pointCalculator(command, board);
        return points;
    }

    private pointCalculator(command: PlaceCommand, board: Board): number {
        let wordPointsMultiplier = 1;
        let additionalPoints = 0;
        let points = 0;
        const iterator = new BoardIterator(command, board);
        const firstLetterIndex = this.boardService.goToFirstLetter(command.placement, command.orientation, board);
        for (let i = firstLetterIndex; this.boardService.isInBoard(i) && iterator.getTileAtCoord(i).tile.letter !== ''; i++) {
            const currentTile: Tile = iterator.getTileAtCoord(i);
            if (iterator.isNeighborFound(iterator.getModifiedPosition(i), board) && currentTile.placedThisTurn) {
                additionalPoints += this.simpleCalculation(command, iterator.getModifiedPosition(i), board);
            }
            points += this.calculatePointsForLetter(currentTile.tile.value, currentTile.bonus);
            wordPointsMultiplier *= this.calculateBonusForWord(currentTile.bonus);
        }
        return points * wordPointsMultiplier + additionalPoints;
    }

    private simpleCalculation(command: PlaceCommand, position: Position, board: Board): number {
        let wordPointsMultiplier = 1;
        let points = 0;
        let count = 0;
        command.orientation = command.orientation === Orientation.Horizontal ? Orientation.Vertical : Orientation.Horizontal;
        command.placement = position;
        const simpleIterator = new BoardIterator(command, board);
        const firstLetterIndex = this.boardService.goToFirstLetter(position, command.orientation, board);
        for (count = firstLetterIndex; count <= MAX_BOARD_WIDTH && simpleIterator.getTileAtCoord(count).tile.letter !== ''; count++) {
            let bonusType = Bonus.Base;
            const currentTile: Tile = simpleIterator.getTileAtCoord(count);
            if (currentTile.placedThisTurn) {
                bonusType = currentTile.bonus;
            }
            points += this.calculatePointsForLetter(currentTile.tile.value, bonusType);
            wordPointsMultiplier *= this.calculateBonusForWord(bonusType);
        }
        if (count - firstLetterIndex === 1) return NO_POINTS;
        return points * wordPointsMultiplier;
    }

    private calculatePointsForLetter(letterPoints: number, bonusType: Bonus): number {
        switch (bonusType) {
            case Bonus.TripleLetter:
                return letterPoints * BONUS_VALUE[Bonus.TripleLetter];
            case Bonus.DoubleLetter:
                return letterPoints * BONUS_VALUE[Bonus.DoubleLetter];
            default:
                return letterPoints;
        }
    }

    private calculateBonusForWord(bonusType: Bonus): number {
        const wordPointsMultiplier = 1;
        switch (bonusType) {
            case Bonus.TripleWord:
                return BONUS_VALUE[Bonus.TripleWord];
            case Bonus.DoubleWord:
                return BONUS_VALUE[Bonus.DoubleWord];
            default:
                return wordPointsMultiplier;
        }
    }
}
