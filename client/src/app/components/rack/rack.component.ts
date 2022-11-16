import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { ClearBoardSelectionService } from '@app/services/clear-board-selection/clear-board-selection.service';
import { RackInputHandlerService } from '@app/services/rack-input-handler/rack-input-handler.service';
import { RESERVE_CAPACITY } from '@common/constants/reserve-constant';
import { Letter } from '@common/interfaces/board-interface';
@Component({
    selector: 'app-rack',
    templateUrl: './rack.component.html',
    styleUrls: ['./rack.component.scss'],
})
export class RackComponent {
    @Input() gameOver: boolean = false;
    @Input() reserveSize: number = RESERVE_CAPACITY;
    @ViewChild('rack') private rack!: ElementRef;

    letters: Letter[];

    selected: number;

    exchangeSelection: Set<number>;

    isTurn: boolean;

    constructor(private inputHandler: RackInputHandlerService, private clearBoardDetector: ClearBoardSelectionService) {
        this.inputHandler.rackClientEvent.asObservable().subscribe((rack: Letter[]) => {
            this.letters = rack;
        });
        this.inputHandler.selectionEvent.asObservable().subscribe((selected: number) => {
            this.selected = selected;
        });
        this.inputHandler.isTurnEvent.asObservable().subscribe((isTurn: boolean) => {
            this.isTurn = isTurn;
        });
        this.isTurn = true;
        this.exchangeSelection = this.inputHandler.exchangeSelection;
        this.letters = [];
    }

    @HostListener('window:keydown', ['$event'])
    keyboardDetect(event: KeyboardEvent): void {
        if (!this.gameOver && this.rack.nativeElement.contains(event.target)) this.inputHandler.handleKeyboard(event);
    }

    @HostListener('window:click', ['$event'])
    mouseDetect(event: MouseEvent): void {
        if (!this.gameOver) {
            if (!this.rack.nativeElement.contains(event.target)) this.inputHandler.handleClickOut();
            else this.clearBoardDetector.notify();
        }
    }

    @HostListener('window:wheel', ['$event'])
    wheelDetect(event: WheelEvent): void {
        if (!this.gameOver) this.inputHandler.handleWheel(event.deltaY);
    }

    handleLetterLeftClick(index: number): void {
        if (!this.gameOver) this.inputHandler.handleLetterLeftClick(index);
    }

    handleLetterRightClick(index: number, event: Event): void {
        if (!this.gameOver) {
            event.preventDefault();
            this.inputHandler.handleLetterRightClick(index);
            this.clearBoardDetector.notify();
        }
    }

    cancelExchange(): void {
        this.inputHandler.cancelExchange();
    }

    confirmExchange(): void {
        this.inputHandler.confirmExchange();
    }

    get isExchanged(): boolean {
        return this.exchangeSelection && this.exchangeSelection.size > 0;
    }
}
