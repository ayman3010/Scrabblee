import { Component, Input } from '@angular/core';
import { ObjectiveClient, ObjectiveOwner } from '@common/interfaces/objective-client';

@Component({
    selector: 'app-objective',
    templateUrl: './objective.component.html',
    styleUrls: ['./objective.component.scss'],
})
export class ObjectiveComponent {
    @Input() objective: ObjectiveClient;
    @Input() currentPlayerName: string;

    get currentOwner(): ObjectiveOwner | undefined {
        if (!this.objective) return undefined;
        for (const owner of this.objective.owners) {
            if (owner.name === this.currentPlayerName) return owner;
        }
        return undefined;
    }

    get showCounter(): boolean {
        return this.currentOwner?.counter !== undefined;
    }
}
