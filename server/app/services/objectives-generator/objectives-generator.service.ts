import { Room } from '@app/classes/interfaces/room';
import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';
import { ConsecutivePlacementObjective } from '@app/classes/objectives/consecutive-placement-objective/consecutive-placement-objective';
import { CopycatObjective } from '@app/classes/objectives/copycat-objective/copycat-objective';
import { DrawObjective } from '@app/classes/objectives/draw-objective/draw-objective';
import { ExchangeObjective } from '@app/classes/objectives/exchange-objective/exchange-objective';
import { PlaceBonusObjective } from '@app/classes/objectives/place-bonus-objective/place-bonus-objective';
import { PlaceConsonantsObjective } from '@app/classes/objectives/place-consonants-objective/place-consonants-objective';
import { PlaceFifteenObjective } from '@app/classes/objectives/place-fifteen-objective/place-fifteen-objective';
import { PlaceVowelsObjective } from '@app/classes/objectives/place-vowelles-objective/place-vowelles-objective';
import { Tools } from '@app/classes/tools/tools';
import { NUMBER_OF_PRIVATE_OBJECTIVES, NUMBER_OF_PUBLIC_OBJECTIVES, NUMBER_OF_UNIQUE_OBJECTIVES } from '@common/constants/objective-constants';
import { Service } from 'typedi';

@Service()
export class ObjectivesGeneratorService {
    private readonly objectiveTypes: typeof AbstractObjective[] = [
        DrawObjective,
        ConsecutivePlacementObjective,
        CopycatObjective,
        ExchangeObjective,
        PlaceBonusObjective,
        PlaceConsonantsObjective,
        PlaceFifteenObjective,
        PlaceVowelsObjective,
    ];

    generateAllObjectives(room: Room): void {
        const objectiveIndexes = Tools.generateMultipleRandom(this.objectiveTypes.length, NUMBER_OF_UNIQUE_OBJECTIVES, true);

        const publicObjectiveIndexes = objectiveIndexes.slice(0, NUMBER_OF_PUBLIC_OBJECTIVES);
        const privateHostObjectiveIndexes = objectiveIndexes.slice(
            NUMBER_OF_PUBLIC_OBJECTIVES,
            NUMBER_OF_PUBLIC_OBJECTIVES + NUMBER_OF_PRIVATE_OBJECTIVES,
        );
        const privateGuestObjectiveIndexes = objectiveIndexes.slice(NUMBER_OF_PUBLIC_OBJECTIVES + NUMBER_OF_PRIVATE_OBJECTIVES);

        this.generateObjectives(room, publicObjectiveIndexes);
        this.generateObjectives(room, privateHostObjectiveIndexes, room.hostPlayer.name);
        this.generateObjectives(room, privateGuestObjectiveIndexes, room.guestPlayer.name);
    }

    private generateObjectives(room: Room, objectiveIndexes: number[], privateOwnerName?: string): void {
        for (const objectiveIndex of objectiveIndexes) room.objectives.push(new this.objectiveTypes[objectiveIndex](room, privateOwnerName));
    }
}
