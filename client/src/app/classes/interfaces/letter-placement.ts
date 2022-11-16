import { Letter } from '@common/interfaces/board-interface';
import { Vec2 } from '@common/interfaces/vec2';

export interface LetterPlacement {
    letter: Letter;
    position: Vec2;
}
