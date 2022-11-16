import { Room } from '@app/classes/interfaces/room';
import { ObjectiveClient, ObjectiveOwner } from '@common/interfaces/objective-client';
import { Player } from '@common/interfaces/player';

export class AbstractObjective implements ObjectiveClient {
    description: string;
    points: number;
    isAchieved: boolean = false;
    owners: ObjectiveOwner[];

    constructor(protected room: Room, privateOwnerName?: string) {
        if (privateOwnerName) this.owners = [{ name: privateOwnerName }];
        else {
            this.owners = [{ name: room.hostPlayer.name }, { name: room.guestPlayer.name }];
        }
        this.subscribe();
    }

    updateOwnerName(): void {
        for (const owner of this.owners) {
            if (owner.name !== this.room.hostPlayer.name) owner.name = this.room.guestPlayer.name;
        }
    }

    protected subscribe(): void {
        throw new Error('Abstract class cannot be instantiated');
    }

    protected givePoints(): void {
        if (this.isInvalid) return;
        this.currentPlayer.points += this.points;
        this.isAchieved = true;
    }

    protected get isInvalid(): boolean {
        return this.isAchieved || !this.currentOwner;
    }

    protected get currentOwner(): ObjectiveOwner | undefined {
        for (const owner of this.owners) {
            if (owner.name === this.currentPlayer.name) return owner;
        }
        return undefined;
    }

    protected get currentPlayer(): Player {
        return this.room.hostPlayer.isTurn ? this.room.hostPlayer : this.room.guestPlayer;
    }
}
