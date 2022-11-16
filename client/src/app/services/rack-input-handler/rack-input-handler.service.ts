import { Injectable } from '@angular/core';
import { NOTHING_SELECTED } from '@app/classes/constants/constants';
import { Letter } from '@common/interfaces/board-interface';
import { Subject } from 'rxjs';
import { RackService } from '@app/services/rack/rack.service';

@Injectable({
    providedIn: 'root',
})
export class RackInputHandlerService {
    rackClientEvent: Subject<Letter[]>;
    selectionEvent: Subject<number>;
    isTurnEvent: Subject<boolean>;

    constructor(private rackService: RackService) {
        this.rackClientEvent = new Subject<Letter[]>();
        this.selectionEvent = new Subject<number>();
        this.isTurnEvent = new Subject<boolean>();
        this.rackService.updateEvent.asObservable().subscribe(() => {
            this.update();
        });
    }

    update(): void {
        this.selectionEvent.next(this.rackService.selected);
        this.rackClientEvent.next(this.rackService.letters);
        this.isTurnEvent.next(this.rackService.isTurn);
    }

    handleLetterLeftClick(index: number): void {
        this.rackService.selectedIndex = index;
        this.update();
    }

    handleLetterRightClick(index: number): void {
        this.rackService.selectExchange(index);
    }

    handleWheel(deltaY: number): void {
        if (deltaY < 0) {
            this.rackService.moveLeft();
        } else if (deltaY > 0) {
            this.rackService.moveRight();
        } else return;
        this.update();
    }

    handleKeyboard(keyboardEvent: KeyboardEvent): void {
        switch (keyboardEvent.key) {
            case 'ArrowRight': {
                this.rackService.moveRight();
                break;
            }
            case 'ArrowLeft': {
                this.rackService.moveLeft();
                break;
            }
            default: {
                if (/^[a-z*]+$/.test(keyboardEvent.key)) this.rackService.select(keyboardEvent.key.toUpperCase());
            }
        }
        this.update();
    }

    handleClickOut(): void {
        this.cancelExchange();
        this.rackService.selectedIndex = NOTHING_SELECTED;
        this.update();
    }

    confirmExchange(): void {
        this.rackService.sendCommand();
    }

    cancelExchange(): void {
        this.rackService.exchangeSelection.clear();
    }

    get exchangeSelection() {
        return this.rackService.exchangeSelection;
    }
}
