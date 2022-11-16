import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ValidCommand } from '@common/interfaces/command-interface';
import { ObjectiveOwner } from '@common/interfaces/objective-client';

export const MINIMUM_PLACEMENT = 5;
export const LESS_THAN_POINTS = 15;
const POINTS = 25;

export class PlaceFifteenObjective extends AbstractObjective {
    description: string = `Faire moins de ${LESS_THAN_POINTS} points en placant au moins ${MINIMUM_PLACEMENT} lettres`;
    points: number = POINTS;
    owners: ObjectiveOwner[];

    protected subscribe(): void {
        this.room.placeEvent.asObservable().subscribe((validCommand: ValidCommand) => {
            if (this.hasAchievedPointsObjective(validCommand.command.lettersToPlace, validCommand.points)) this.givePoints();
        });
    }

    private hasAchievedPointsObjective(lettersToPlace: string, points: number): boolean {
        if (this.isInvalid) return false;

        return lettersToPlace.length >= MINIMUM_PLACEMENT && points < LESS_THAN_POINTS;
    }
}
