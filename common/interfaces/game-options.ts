import { GameType } from '@common/enums/enums';
import { AiDifficulty } from './ai-difficulty.enum';
import { DictionaryHeader } from './dictionary-header';

export interface GameOptions {
    aiDifficulty: AiDifficulty;
    name: string;
    turnDuration: number;
    dictionary: DictionaryHeader;
    singlePlayer: boolean;
    gameType: GameType;
}
