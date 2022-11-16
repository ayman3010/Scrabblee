import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ValidCommand } from '@common/interfaces/command-interface';
import { ObjectiveOwner } from '@common/interfaces/objective-client';

export const ALL_CONSONANENTS_REGEX = /^[^aeiou]+$/i;
export const MINIMUM_CONSONANTS_TO_PLACE = 3;
const POINTS = 30;

export class PlaceConsonantsObjective extends AbstractObjective {
    description: string = `Former un mot en plaçant seulement ${MINIMUM_CONSONANTS_TO_PLACE} consonnes ou plus et aucune voyelle`;
    points: number = POINTS;
    owners: ObjectiveOwner[];

    protected subscribe(): void {
        this.room.placeEvent.asObservable().subscribe((validCommand: ValidCommand) => {
            if (this.hasPlacedThreeConsonants(validCommand.command.lettersToPlace)) this.givePoints();
        });
    }

    private hasPlacedThreeConsonants(lettersToPlace: string): boolean {
        if (this.isInvalid) return false;

        return ALL_CONSONANENTS_REGEX.test(lettersToPlace) && lettersToPlace.length >= MINIMUM_CONSONANTS_TO_PLACE;
    }
}
