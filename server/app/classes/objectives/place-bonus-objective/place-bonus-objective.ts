import { TRIPLE_LETTER_POSITIONS } from '@app/classes/constants/board-constant';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { Bonus, Position, Tile } from '@common/interfaces/board-interface';
import { ObjectiveOwner } from '@common/interfaces/objective-client';

const POINTS = 15;

export class PlaceBonusObjective extends AbstractObjective {
    description: string = 'Placer la lettre blanche sur une case lettre compte triple';
    points: number = POINTS;
    owners: ObjectiveOwner[];

    protected subscribe(): void {
        this.room.placeEvent.asObservable().subscribe(() => {
            if (this.hasAchievedBonusObjective(this.room.board.content, TRIPLE_LETTER_POSITIONS)) this.givePoints();
        });
    }

    private hasAchievedBonusObjective(boardContent: Tile[][], bonusPosition: Position[]): boolean {
        if (this.isInvalid) return false;
        for (const triplePosition of bonusPosition) {
            if (!boardContent[triplePosition.coordH]) return false;
            if (this.bonusIsPlacedOnTriple(boardContent[triplePosition.coordH][triplePosition.coordV])) return true;
        }
        return false;
    }

    private bonusIsPlacedOnTriple(tile: Tile): boolean {
        return this.isTripleBonus(tile) && this.isBonusLetter(tile);
    }

    private isBonusLetter(tile: Tile): boolean {
        return tile.tile.letter !== '' && !tile.tile.value;
    }

    private isTripleBonus(tile: Tile): boolean {
        return tile.placedThisTurn && tile.bonus === Bonus.TripleLetter;
    }
}
