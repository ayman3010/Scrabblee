import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ValidCommand } from '@common/interfaces/command-interface';
import { ObjectiveOwner } from '@common/interfaces/objective-client';

export const ALL_VOWELS_REGEX = /^[aeiou]+$/i;
export const MINIMUM_VOWELS_TO_PLACE = 4;
const POINTS = 80;

export class PlaceVowelsObjective extends AbstractObjective {
    description: string = `Placer au moins ${MINIMUM_VOWELS_TO_PLACE} voyelles en un seul tour`;
    points: number = POINTS;
    owners: ObjectiveOwner[];

    protected subscribe(): void {
        this.room.placeEvent.asObservable().subscribe((validCommand: ValidCommand) => {
            if (this.hasPlacedEnoughVowels(validCommand.command.lettersToPlace)) this.givePoints();
        });
    }
    private hasPlacedEnoughVowels(lettersToPlace: string): boolean {
        if (this.isInvalid) return false;

        let numberOfVowels = 0;
        for (const letter of lettersToPlace) {
            if (ALL_VOWELS_REGEX.test(letter)) {
                numberOfVowels++;
                if (numberOfVowels >= MINIMUM_VOWELS_TO_PLACE) return true;
            }
        }
        return false;
    }
}
