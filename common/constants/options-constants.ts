import { DEFAULT_DICTIONARY_ID } from '@common/constants/dictionary-constants';
import { GameType } from '@common/enums/enums';
import { AiDifficulty } from '@common/interfaces/ai-difficulty.enum';
import { GameOptions } from '@common/interfaces/game-options';

export const DEFAULT_GAME_OPTIONS: GameOptions = {
    name: '',
    aiDifficulty: AiDifficulty.BEGINNER,
    turnDuration: 60,
    dictionary: { id: DEFAULT_DICTIONARY_ID, title: 'Dictionnaire-francais', description: 'Description de base' },
    singlePlayer: true,
    gameType: GameType.CLASSIC,
};
