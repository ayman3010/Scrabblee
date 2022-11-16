import { BONUS_LETTER } from '@common/constants/reserve-constant';
import { Bonus, Position } from '@common/interfaces/board-interface';

export const NO_LETTER = '';

export const NO_POINTS = 0;

export const INVALID_PLACEMENT = 0;

export const MIN_WORD_LENGTH = 2;

export const MIN_BOARD_WIDTH = 0;

export const MAX_BOARD_WIDTH = 14;

export const FIRST_TURN_POSITION = { coordV: 7, coordH: 7 };

export const LETTERS_VALUE: { [key: string]: number } = {
    ['A']: 1,
    ['B']: 3,
    ['C']: 3,
    ['D']: 2,
    ['E']: 1,
    ['F']: 4,
    ['G']: 2,
    ['H']: 4,
    ['I']: 1,
    ['J']: 8,
    ['K']: 10,
    ['L']: 1,
    ['M']: 2,
    ['N']: 1,
    ['O']: 1,
    ['P']: 3,
    ['Q']: 8,
    ['R']: 1,
    ['S']: 1,
    ['T']: 1,
    ['U']: 1,
    ['V']: 4,
    ['W']: 10,
    ['X']: 10,
    ['Y']: 10,
    ['Z']: 10,
    ['']: 0,
    [BONUS_LETTER]: 0,
};

export const TRIPLE_WORD_POSITIONS: Position[] = [
    { coordV: 0, coordH: 0 },
    { coordV: 0, coordH: 7 },
    { coordV: 0, coordH: 14 },
    { coordV: 7, coordH: 0 },
    { coordV: 7, coordH: 14 },
    { coordV: 14, coordH: 0 },
    { coordV: 14, coordH: 7 },
    { coordV: 14, coordH: 14 },
];

export const DOUBLE_WORD_POSITIONS: Position[] = [
    { coordV: 1, coordH: 1 },
    { coordV: 2, coordH: 2 },
    { coordV: 3, coordH: 3 },
    { coordV: 4, coordH: 4 },
    { coordV: 1, coordH: 13 },
    { coordV: 2, coordH: 12 },
    { coordV: 3, coordH: 11 },
    { coordV: 4, coordH: 10 },
    { coordV: 13, coordH: 1 },
    { coordV: 12, coordH: 2 },
    { coordV: 11, coordH: 3 },
    { coordV: 10, coordH: 4 },
    { coordV: 13, coordH: 13 },
    { coordV: 12, coordH: 12 },
    { coordV: 10, coordH: 10 },
    { coordV: 11, coordH: 11 },
    { coordV: 7, coordH: 7 },
];

export const DOUBLE_LETTER_POSITIONS: Position[] = [
    { coordV: 0, coordH: 3 },
    { coordV: 0, coordH: 11 },
    { coordV: 2, coordH: 6 },
    { coordV: 2, coordH: 8 },
    { coordV: 3, coordH: 0 },
    { coordV: 3, coordH: 7 },
    { coordV: 3, coordH: 14 },
    { coordV: 6, coordH: 2 },
    { coordV: 6, coordH: 6 },
    { coordV: 6, coordH: 8 },
    { coordV: 6, coordH: 12 },
    { coordV: 7, coordH: 3 },
    { coordV: 7, coordH: 11 },
    { coordV: 8, coordH: 2 },
    { coordV: 8, coordH: 6 },
    { coordV: 8, coordH: 8 },
    { coordV: 8, coordH: 12 },
    { coordV: 11, coordH: 0 },
    { coordV: 11, coordH: 7 },
    { coordV: 11, coordH: 14 },
    { coordV: 12, coordH: 6 },
    { coordV: 12, coordH: 8 },
    { coordV: 14, coordH: 3 },
    { coordV: 14, coordH: 11 },
];

export const TRIPLE_LETTER_POSITIONS: Position[] = [
    { coordV: 1, coordH: 5 },
    { coordV: 1, coordH: 9 },
    { coordV: 5, coordH: 1 },
    { coordV: 5, coordH: 5 },
    { coordV: 5, coordH: 9 },
    { coordV: 5, coordH: 13 },
    { coordV: 9, coordH: 5 },
    { coordV: 9, coordH: 9 },
    { coordV: 9, coordH: 13 },
    { coordV: 9, coordH: 1 },
    { coordV: 13, coordH: 5 },
    { coordV: 13, coordH: 9 },
];

export const BONUS_VALUE: { [key: number]: number } = {
    [Bonus.Base]: 1,
    [Bonus.DoubleLetter]: 2,
    [Bonus.TripleLetter]: 3,
    [Bonus.DoubleWord]: 2,
    [Bonus.TripleWord]: 3,
};
