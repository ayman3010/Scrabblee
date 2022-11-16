import { GameState } from '@common/enums/enums';
import { Board, Tile } from '@common/interfaces/board-interface';
import { Player } from '@common/interfaces/player';
import { Reserve } from '@common/interfaces/reserve-interface';
import { RoomClient } from '@common/interfaces/room';
import { DEFAULT_DICTIONARY_ID } from './dictionary-constants';
import { DEFAULT_GAME_OPTIONS } from './options-constants';
import { INITIAL_RESERVE_CONTENT, RESERVE_CAPACITY } from './reserve-constant';

const CONTENT: Tile[][] = [[{ bonus: 1, tile: { letter: 'd', value: 0 }, placedThisTurn: false }]];
const BOARD: Board = {
    content: CONTENT,
    dictionaryId: DEFAULT_DICTIONARY_ID,
    placementAchieved: false,
};
const PLAYER: Player = { name: 'Jean', socketId: 'socketId', isTurn: true, rack: { content: [] }, points: 0, abandoned: false };
const GAME_STATE: GameState = GameState.GuestJoined;
const RESERVE: Reserve = { content: INITIAL_RESERVE_CONTENT.map((letter) => Object.assign({ ...letter })), nbOfLetters: RESERVE_CAPACITY };
const TIMER = 0;
export const TEST_PLAYER: Player = { name: 'John Scrabble', socketId: 'johnyboi', isTurn: true, rack: { content: [] }, points: 0, abandoned: false };

export const TEST_ROOM_CLIENT: RoomClient = {
    key: 'key',
    nbSkippedTurns: 0,
    hostPlayer: { ...PLAYER },
    guestPlayer: { ...PLAYER },
    gameState: GAME_STATE,
    timer: TIMER,
    board: BOARD,
    nbOfTurns: 0,
    reserve: RESERVE,
    gameOptions: DEFAULT_GAME_OPTIONS,

    objectives: [],
};
