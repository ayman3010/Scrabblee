import { LETTERS_VALUE, NO_LETTER } from '@app/classes/constants/board-constant';
import { RACK_MAX_CAPACITY } from '@app/classes/constants/rack-constant';
import { BONUS_LETTER, NO_LETTER_LEFT } from '@common/constants/reserve-constant';
import { Rack } from '@common/interfaces/rack-interface';
import { Service } from 'typedi';

@Service()
export class RackService {
    initializeRack(rack: Rack): void {
        rack.content = [];
    }

    size(rack: Rack): number {
        return rack.content.length;
    }

    addLetters(lettersToAdd: string, rack: Rack): void {
        for (const letter of lettersToAdd) {
            this.addLetter(letter, rack);
        }
    }

    removeLetters(lettersToRemove: string, rack: Rack): void {
        for (let letter of lettersToRemove) {
            if (letter.toUpperCase() === letter) letter = BONUS_LETTER;
            else letter = letter.toUpperCase();
            this.removeLetter(letter, rack);
        }
    }

    isFull(rack: Rack): boolean {
        return rack.content.length === RACK_MAX_CAPACITY;
    }

    isEmpty(rack: Rack): boolean {
        return rack.content.length === NO_LETTER_LEFT;
    }

    containsLetters(lettersToContain: string, rack: Rack): boolean {
        let rackString: string = this.toString(rack);
        for (const letter of lettersToContain) {
            if (!rackString.includes(letter)) {
                return false;
            }
            rackString = rackString.replace(letter, '');
        }
        return true;
    }

    toString(rack: Rack): string {
        let chars = NO_LETTER;
        for (const rackLetter of rack.content) {
            chars += rackLetter.letter;
        }
        return chars;
    }

    private addLetter(letterToAdd: string, rack: Rack): void {
        if (!this.isFull(rack)) {
            rack.content.push({ letter: letterToAdd, value: LETTERS_VALUE[letterToAdd] });
        }
    }

    private removeLetter(letterToRemove: string, rack: Rack): void {
        for (let i = 0; i < rack.content.length; i++) {
            if (letterToRemove === rack.content[i].letter) {
                rack.content.splice(i, 1);
                return;
            }
        }
    }
}
