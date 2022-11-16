import { AbstractObjective } from '@app/classes/objectives/abstract-objective/abstract-objective';

export const NUMBER_TO_DRAW = 50;
const POINTS = 25;

export class DrawObjective extends AbstractObjective {
    description: string = `Piger ${NUMBER_TO_DRAW} lettres de la réserve`;
    points: number = POINTS;

    protected subscribe(): void {
        for (const owner of this.owners) owner.counter = 0;
        this.room.drawEvent.asObservable().subscribe(() => {
            if (this.incrementCounter()) this.givePoints();
        });
    }

    private incrementCounter(): boolean {
        const currentOwner = this.currentOwner;
        return !this.isAchieved && !!currentOwner && currentOwner.counter !== undefined && ++currentOwner.counter >= NUMBER_TO_DRAW;
    }
}
