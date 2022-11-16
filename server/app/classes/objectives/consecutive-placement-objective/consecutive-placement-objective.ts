import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ValidCommand } from '@common/interfaces/command-interface';

export const CONSECUTIVE_PLACEMENT = 4;
export const MINIMUM_SIZE = 4;
export const RESET_COUNTER = '';
const POINTS = 50;

export class ConsecutivePlacementObjective extends AbstractObjective {
    description: string = `Jouer ${CONSECUTIVE_PLACEMENT} fois de suite et placer ${MINIMUM_SIZE} lettres ou plus par tour`;
    points: number = POINTS;

    protected subscribe(): void {
        for (const owner of this.owners) owner.counter = 0;

        this.room.skipEvent.asObservable().subscribe(() => {
            this.handleCounter(RESET_COUNTER);
        });

        this.room.exchangeEvent.asObservable().subscribe(() => {
            this.handleCounter(RESET_COUNTER);
        });

        this.room.placeEvent.asObservable().subscribe((validCommand: ValidCommand) => {
            if (this.handleCounter(validCommand.command.lettersToPlace)) this.givePoints();
        });
    }

    private handleCounter(lettersPlaced: string): boolean {
        const currentOwner = this.currentOwner;
        if (this.isAchieved || !currentOwner || currentOwner.counter === undefined) return false;

        if (lettersPlaced.length >= MINIMUM_SIZE) return ++currentOwner.counter >= CONSECUTIVE_PLACEMENT;

        currentOwner.counter = 0;
        return false;
    }
}
