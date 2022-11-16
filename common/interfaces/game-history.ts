import { GameType } from '@common/enums/enums';

export interface GameHistory {
    dateBegin: Date;
    dateEnd: Date;
    gameDuration: number;
    firstPlayer: PlayerHistory;
    secondPlayer: PlayerHistory;
    gameMode: GameType;
    wasAbandoned: boolean;
}

export interface GameHistoryClient extends GameHistory {
    id: string;
}

export interface PlayerHistory {
    name: string;
    score: number;
}
