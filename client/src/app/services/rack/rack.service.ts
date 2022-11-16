import { Injectable } from '@angular/core';
import { NOTHING_SELECTED } from '@app/classes/constants/constants';
import { ChatboxManagerService } from '@app/services/chatbox-manager/chatbox-manager.service';
import { GameManagerService } from '@app/services/game-manager/game-manager.service';
import { BONUS_LETTER } from '@common/constants/reserve-constant';
import { CommandType } from '@common/enums/enums';
import { Letter } from '@common/interfaces/board-interface';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RackService {
    letters: Letter[];
    selected: number = NOTHING_SELECTED;
    exchangeSelection: Set<number> = new Set<number>();
    isTurn: boolean = true;

    updateEvent: Subject<void> = new Subject();

    constructor(private gameManager: GameManagerService, private commandSender: ChatboxManagerService) {
        this.gameManager.rackEvent.asObservable().subscribe((rack: Letter[]) => {
            if (this.isTurn) this.letters = rack;
            this.isTurn = this.gameManager.isTurn;
            this.updateEvent.next();
        });
        this.commandSender.synchronizeRackEvent.asObservable().subscribe(() => {
            this.commandSender.rack = this.letters;
        });
    }

    sendCommand(): void {
        if (this.exchangeSelection.size === 0) return;
        const exchangeCommand = this.exchangeCommand;
        this.removeExchange();
        this.commandSender.sendCommand(exchangeCommand);
    }

    swap(targetIndex: number, selectedIndex: number = this.selected): boolean {
        if (this.isInBounds(selectedIndex) && this.isInBounds(targetIndex) && selectedIndex !== targetIndex) {
            const targetLetter: Letter = this.letters[targetIndex];
            this.letters[targetIndex] = this.letters[selectedIndex];
            this.letters[selectedIndex] = targetLetter;
            this.swapExchange(targetIndex, selectedIndex);
            return true;
        }
        return false;
    }

    swapExchange(targetIndex: number, selectedIndex: number): void {
        if (!this.isInBounds(selectedIndex) || !this.isInBounds(targetIndex) || selectedIndex === targetIndex) return;

        const isTargetExchangeSelected = this.exchangeSelection.delete(targetIndex);
        const isExchangeSelected = this.exchangeSelection.delete(selectedIndex);

        if (isTargetExchangeSelected) this.exchangeSelection.add(selectedIndex);
        if (isExchangeSelected) this.exchangeSelection.add(targetIndex);
    }

    moveLeft(selectedIndex: number = this.selected): void {
        const targetIndex: number = this.isInBounds(selectedIndex - 1) ? selectedIndex - 1 : selectedIndex + this.letters.length - 1;
        if (this.swap(targetIndex, selectedIndex)) this.selected = targetIndex;
    }

    moveRight(selectedIndex: number = this.selected): void {
        const targetIndex: number = this.isInBounds(selectedIndex + 1) ? selectedIndex + 1 : selectedIndex - this.letters.length + 1;
        if (this.swap(targetIndex, selectedIndex)) this.selected = targetIndex;
    }

    isInBounds(index: number): boolean {
        return index >= 0 && index < this.letters.length;
    }

    select(letter: string): void {
        const isSameLetterAlreadySelected = this.selected !== NOTHING_SELECTED && this.letters[this.selected].letter === letter;
        const startIndex = isSameLetterAlreadySelected && this.selected < this.letters.length - 1 ? this.selected + 1 : 0;
        this.selectedIndex = this.indexOf(letter, startIndex, true);
    }

    selectExchange(index: number): void {
        if (index === this.selected) this.selected = NOTHING_SELECTED;
        if (this.exchangeSelection.has(index)) this.exchangeSelection.delete(index);
        else this.exchangeSelection.add(index);
    }

    addLetter(letter: Letter): void {
        const letterToAdd: Letter = letter.value !== 0 ? letter : { letter: BONUS_LETTER, value: letter.value };
        this.letters.push(letterToAdd);
    }

    removeLetter(letter: string): Letter | undefined {
        const indexToRemove = this.indexOf(letter);
        if (indexToRemove !== NOTHING_SELECTED) {
            if (indexToRemove === this.selected) this.selected = NOTHING_SELECTED;
            this.exchangeSelection.delete(indexToRemove);
            return this.letters.splice(indexToRemove, 1)[0];
        } else return undefined;
    }

    removeExchange(): void {
        const newLetters: Letter[] = [];
        for (let i = 0; i < this.letters.length; i++) {
            if (!this.exchangeSelection.has(i)) newLetters.push(this.letters[i]);
        }
        this.letters = newLetters;
        this.exchangeSelection.clear();
        this.updateEvent.next();
    }

    get exchangeCommand(): string {
        return CommandType.Exchange + ' ' + this.lettersToExchange;
    }

    private indexOf(letter: string, startIndex: number = 0, skipExchange: boolean = false): number {
        let index = startIndex;
        for (let i = 0; i < this.letters.length; i++, index < this.letters.length - 1 ? index++ : (index = 0)) {
            const isAvailable = !(skipExchange && this.exchangeSelection.has(index));
            if (this.letters[index].letter === letter && isAvailable) return index;
        }
        return NOTHING_SELECTED;
    }

    private get lettersToExchange(): string {
        let lettersToExchange = '';
        for (const index of this.exchangeSelection) lettersToExchange += this.letters[index].letter.toLowerCase();
        return lettersToExchange;
    }

    set selectedIndex(index: number) {
        if (this.exchangeSelection.has(index)) this.selected = NOTHING_SELECTED;
        else this.selected = index;
    }
}
