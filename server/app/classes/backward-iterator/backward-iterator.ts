import { BoardIterator } from '@app/classes/board-iterator/board-iterator';
import { Orientation } from '@common/enums/enums';
import { Board } from '@common/interfaces/board-interface';
import { PlaceCommand } from '@common/interfaces/command-interface';

export class BackwardIterator extends BoardIterator {
    previousValueH: number;
    previousValueV: number;

    constructor(command: PlaceCommand, board: Board) {
        super(command, board);
        this.previousValueV = super.getPosition().coordV;
        this.previousValueH = super.getPosition().coordH;
    }

    getPrevious(): number {
        if (super.getOrientation() === Orientation.Horizontal) {
            return this.previousValueH;
        } else {
            return this.previousValueV;
        }
    }

    previous(): void {
        if (super.getOrientation() === Orientation.Horizontal) {
            this.previousValueH -= 1;
        } else {
            this.previousValueV -= 1;
        }
    }
}
