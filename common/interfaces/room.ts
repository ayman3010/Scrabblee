import { GameState } from '@common/enums/enums';
import { GameOptions } from '@common/interfaces/game-options';
import { Reserve } from '@common/interfaces/reserve-interface';
import { Board } from './board-interface';
import { ObjectiveClient } from './objective-client';
import { Player } from './player';

export interface RoomClient {
    key: string;
    hostPlayer: Player;
    guestPlayer: Player;
    gameState: GameState;
    timer: number;
    board: Board;
    nbOfTurns: number;
    nbSkippedTurns: number;
    reserve: Reserve;
    gameOptions: GameOptions;

    objectives: ObjectiveClient[];
}
