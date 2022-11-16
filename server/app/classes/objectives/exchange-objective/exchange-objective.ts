import { LETTERS_VALUE } from '@app/classes/constants/board-constant';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ObjectiveOwner } from '@common/interfaces/objective-client';

export const EXCHANGE_VALUE = 30;
const POINTS = 25;

export class ExchangeObjective extends AbstractObjective {
    description: string = `Échanger pour un équivalent de ${EXCHANGE_VALUE} points en un échange`;
    points: number = POINTS;
    owners: ObjectiveOwner[];

    protected subscribe(): void {
        this.room.exchangeEvent.asObservable().subscribe((lettersToExchange: string) => {
            if (this.hasExchangedEnoughPoints(lettersToExchange)) this.givePoints();
        });
    }

    private hasExchangedEnoughPoints(letters: string): boolean {
        if (this.isInvalid) return false;
        let points = 0;
        for (const letter of letters) {
            points += LETTERS_VALUE[letter.toUpperCase()];
            if (points >= EXCHANGE_VALUE) return true;
        }
        return false;
    }
}
