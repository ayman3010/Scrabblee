import { RackService } from '@app/services/rack/rack.service';
import { ReserveService } from '@app/services/reserve/reserve.service';
import { Rack } from '@common/interfaces/rack-interface';
import { Reserve } from '@common/interfaces/reserve-interface';
import { Service } from 'typedi';

@Service()
export class TurnManagerService {
    constructor(private reserveService: ReserveService, private rackService: RackService) {}

    fillRack(rack: Rack, reserve: Reserve): void {
        if (this.rackService.isFull(rack)) {
            return;
        }
        while (!this.rackService.isFull(rack) && reserve.nbOfLetters) {
            const letterDrawn = this.reserveService.drawLetter(reserve);
            this.rackService.addLetters(letterDrawn, rack);
        }
    }

    areLettersInRack(rack: Rack, lettersToContain: string): boolean {
        return this.rackService.containsLetters(lettersToContain, rack);
    }

    removeLettersFromRack(lettersToRemove: string, rack: Rack): void {
        this.rackService.removeLetters(lettersToRemove, rack);
    }
}
