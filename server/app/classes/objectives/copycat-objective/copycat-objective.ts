import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { WordOnBoard } from '@common/interfaces/board-interface';

export const SIZE_TO_BE_GREATER_THAN = 4;
const POINTS = 70;

export class CopycatObjective extends AbstractObjective {
    description: string = `Former un mot de plus de ${SIZE_TO_BE_GREATER_THAN} lettres déjà présent en jeu`;
    points: number = POINTS;

    protected subscribe(): void {
        this.room.boardWordsEvent.asObservable().subscribe((boardWords: WordOnBoard[]) => {
            if (this.validateBoard(boardWords)) this.givePoints();
        });
    }

    private validateBoard(boardWords: WordOnBoard[]): boolean {
        if (this.isInvalid) return false;

        const eligibleWords = new Set<string>();
        for (const boardWord of boardWords) {
            if (eligibleWords.has(boardWord.word.toLowerCase())) return true;
            if (boardWord.word.length > SIZE_TO_BE_GREATER_THAN) eligibleWords.add(boardWord.word.toLowerCase());
        }
        return false;
    }
}
