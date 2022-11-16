import { ReserveLetter } from '@common/interfaces/reserve-interface';

export const RESERVE_CAPACITY = 102;
export const MINIMUM_LETTERS_FOR_EXCHANGE = 7;
export const FIRST_LETTER_INDEX = 65;
export const LAST_LETTER_INDEX = 90;
export const NO_LETTER_LEFT = 0;
export const BONUS_LETTER = '*';
export const BONUS_LETTER_INDEX = 26;
export const INITIAL_RESERVE_CONTENT: ReserveLetter[] = [
    { letter: 'A', nbOfCopies: 9 },
    { letter: 'B', nbOfCopies: 2 },
    { letter: 'C', nbOfCopies: 2 },
    { letter: 'D', nbOfCopies: 2 },
    { letter: 'E', nbOfCopies: 15 },
    { letter: 'F', nbOfCopies: 2 },
    { letter: 'G', nbOfCopies: 2 },
    { letter: 'H', nbOfCopies: 2 },
    { letter: 'I', nbOfCopies: 8 },
    { letter: 'J', nbOfCopies: 1 },
    { letter: 'K', nbOfCopies: 1 },
    { letter: 'L', nbOfCopies: 5 },
    { letter: 'M', nbOfCopies: 3 },
    { letter: 'N', nbOfCopies: 6 },
    { letter: 'O', nbOfCopies: 6 },
    { letter: 'P', nbOfCopies: 2 },
    { letter: 'Q', nbOfCopies: 1 },
    { letter: 'R', nbOfCopies: 6 },
    { letter: 'S', nbOfCopies: 6 },
    { letter: 'T', nbOfCopies: 6 },
    { letter: 'U', nbOfCopies: 6 },
    { letter: 'V', nbOfCopies: 2 },
    { letter: 'W', nbOfCopies: 1 },
    { letter: 'X', nbOfCopies: 1 },
    { letter: 'Y', nbOfCopies: 1 },
    { letter: 'Z', nbOfCopies: 2 },
    { letter: BONUS_LETTER, nbOfCopies: 2 },
];
