import { NO_LETTER } from '@app/classes/constants/board-constant';
import {
    BONUS_LETTER,
    BONUS_LETTER_INDEX,
    FIRST_LETTER_INDEX,
    INITIAL_RESERVE_CONTENT,
    NO_LETTER_LEFT,
    RESERVE_CAPACITY,
} from '@common/constants/reserve-constant';
import { Reserve } from '@common/interfaces/reserve-interface';
import { Service } from 'typedi';
@Service()
export class ReserveService {
    createReserve(): Reserve {
        return { content: INITIAL_RESERVE_CONTENT.map((letter) => Object.assign({ ...letter })), nbOfLetters: RESERVE_CAPACITY };
    }

    drawLetter(reserve: Reserve): string {
        let drawnLetter = NO_LETTER;
        if (reserve.nbOfLetters === NO_LETTER_LEFT) {
            return NO_LETTER;
        }
        let randomNumber = this.generateRandomNumber(reserve);

        for (const letterInReserve of reserve.content) {
            randomNumber -= letterInReserve.nbOfCopies;
            if (randomNumber < 0) {
                drawnLetter = letterInReserve.letter.toUpperCase();
                this.removeFromReserve(drawnLetter, reserve);
                break;
            }
        }
        return drawnLetter;
    }

    addToReserve(lettersToAdd: string, reserve: Reserve): void {
        let letterIndex;
        for (const letter of lettersToAdd) {
            if (letter === BONUS_LETTER) {
                letterIndex = BONUS_LETTER_INDEX;
            } else {
                letterIndex = letter.charCodeAt(0) - FIRST_LETTER_INDEX;
            }
            reserve.content[letterIndex].nbOfCopies++;
            reserve.nbOfLetters++;
        }
    }

    toString(reserve: Reserve): string {
        let chars = NO_LETTER;
        for (const reserveLetter of reserve.content) {
            if (reserveLetter.nbOfCopies > 0) {
                for (let i = 0; i < reserveLetter.nbOfCopies; i++) chars += reserveLetter.letter;
            }
        }
        return chars;
    }

    private removeFromReserve(lettersToRemove: string, reserve: Reserve): void {
        let letterIndex;
        for (const letter of lettersToRemove) {
            if (letter === BONUS_LETTER) {
                letterIndex = BONUS_LETTER_INDEX;
            } else {
                letterIndex = letter.charCodeAt(0) - FIRST_LETTER_INDEX;
            }
            reserve.content[letterIndex].nbOfCopies--;
            reserve.nbOfLetters--;
        }
    }

    private generateRandomNumber(reserve: Reserve): number {
        return Math.floor(Math.random() * reserve.nbOfLetters);
    }
}
