import { GameType } from '@common/enums/enums';

export interface HighScore {
    name: string;
    score: number;
    gameMode: GameType;
}

export interface HighScoreClient {
    names: string[];
    score: number;
}
