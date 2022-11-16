import { Orientation } from './../enums/enums';
export enum Bonus {
    Base = 1,
    TripleLetter = 2,
    DoubleLetter = 3,
    DoubleWord = 4,
    TripleWord = 5,
}
export interface Position {
    coordH: number;
    coordV: number;
}
export interface Tile {
    bonus: Bonus;
    tile: Letter;
    placedThisTurn: boolean;
}
export interface Letter {
    value: number;
    letter: string;
}

export interface Board {
    content: Tile[][];
    dictionaryId: string;
    placementAchieved: boolean;
}

export interface WordOnBoard {
    position: Position;
    word: string;
    orientation: Orientation;
}

export interface LinkedWordOnBoard extends WordOnBoard {
    linkedWords: string[];
}
