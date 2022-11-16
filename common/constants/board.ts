import { BonusTile } from '@common/interfaces/bonus-tile';
import { Vec2 } from '@common/interfaces/vec2';

export const TRIPLE_WORD: BonusTile = {
    text: 'MOT',
    color: 'red',
    multiplier: 3,
};
export const DOUBLE_WORD: BonusTile = {
    text: 'MOT',
    color: '#fd9292',
    multiplier: 2,
};
export const TRIPLE_LETTER: BonusTile = {
    text: 'LETTRE',
    color: '#05a4cb',
    multiplier: 3,
};
export const DOUBLE_LETTER: BonusTile = {
    text: 'LETTRE',
    color: '#7cbfcf',
    multiplier: 2,
};
export const TRIPLE_WORD_POSITIONS: Vec2[] = [
    { x: 0, y: 0 },
    { x: 0, y: 7 },
    { x: 0, y: 14 },
    { x: 7, y: 0 },
    { x: 7, y: 14 },
    { x: 14, y: 0 },
    { x: 14, y: 7 },
    { x: 14, y: 14 },
];
export const DOUBLE_WORD_POSITIONS: Vec2[] = [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 3 },
    { x: 4, y: 4 },
    { x: 1, y: 13 },
    { x: 2, y: 12 },
    { x: 3, y: 11 },
    { x: 4, y: 10 },
    { x: 13, y: 1 },
    { x: 12, y: 2 },
    { x: 11, y: 3 },
    { x: 10, y: 4 },
    { x: 10, y: 10 },
    { x: 13, y: 13 },
    { x: 12, y: 12 },
    { x: 11, y: 11 },
    { x: 11, y: 11 },
    { x: 7, y: 7 },
];
export const DOUBLE_LETTER_POSITIONS: Vec2[] = [
    { x: 0, y: 3 },
    { x: 0, y: 11 },
    { x: 2, y: 6 },
    { x: 2, y: 8 },
    { x: 3, y: 0 },
    { x: 3, y: 7 },
    { x: 3, y: 14 },
    { x: 6, y: 2 },
    { x: 6, y: 6 },
    { x: 6, y: 8 },
    { x: 6, y: 12 },
    { x: 7, y: 3 },
    { x: 7, y: 11 },
    { x: 8, y: 2 },
    { x: 8, y: 6 },
    { x: 8, y: 8 },
    { x: 8, y: 12 },
    { x: 11, y: 0 },
    { x: 11, y: 7 },
    { x: 11, y: 14 },
    { x: 12, y: 6 },
    { x: 12, y: 8 },
    { x: 14, y: 3 },
    { x: 14, y: 11 },
];
export const TRIPLE_LETTER_POSITIONS: Vec2[] = [
    { x: 1, y: 5 },
    { x: 1, y: 9 },
    { x: 5, y: 1 },
    { x: 5, y: 5 },
    { x: 5, y: 9 },
    { x: 5, y: 13 },
    { x: 9, y: 5 },
    { x: 9, y: 9 },
    { x: 9, y: 13 },
    { x: 9, y: 1 },
    { x: 13, y: 5 },
    { x: 13, y: 9 },
];
