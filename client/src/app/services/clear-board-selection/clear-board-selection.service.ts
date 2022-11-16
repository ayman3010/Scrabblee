import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ClearBoardSelectionService {
    clearBoardEvent: Subject<void>;
    constructor() {
        this.clearBoardEvent = new Subject();
    }

    notify(): void {
        this.clearBoardEvent.next();
    }
}
