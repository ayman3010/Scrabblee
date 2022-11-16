import { GameState } from '@common/enums/enums';
import { Board, Tile } from '@common/interfaces/board-interface';
import { Player } from '@common/interfaces/player';
import { Reserve } from '@common/interfaces/reserve-interface';
import { RoomClient } from '@common/interfaces/room';
import { RoomMessage } from '@common/interfaces/room-message';
import { DEFAULT_DICTIONARY_ID } from './dictionary-constants';
import { DEFAULT_GAME_OPTIONS } from './options-constants';
import { INITIAL_RESERVE_CONTENT, RESERVE_CAPACITY } from './reserve-constant';

export const DEFAULT_ROOM_MESSAGE: RoomMessage = {
    roomKey: 'randomRoomKey',
    value: 'randomMessage',
    color: 'default',
    senderName: 'randomPlayerName',
};

export const DEFAULT_PLAYER: Player = {
    name: '',
    socketId: '',
    rack: { content: [] },
    points: 0,
    isTurn: true,
    abandoned: false,
};

const EMPTY_CONTENT: Tile[][] = [[]];
export const EMPTY_BOARD: Board = {
    content: EMPTY_CONTENT,
    dictionaryId: DEFAULT_DICTIONARY_ID,
    placementAchieved: false,
};

const GAME_STATE: GameState = GameState.WaitingForGuest;
export const RESERVE: Reserve = { content: INITIAL_RESERVE_CONTENT.map((letter) => Object.assign({ ...letter })), nbOfLetters: RESERVE_CAPACITY };
const TIMER = 0;

export const EMPTY_ROOM_CLIENT: RoomClient = {
    key: '',
    hostPlayer: {
        name: '',
        socketId: '',
        rack: { content: [] },
        points: 0,
        isTurn: true,
        abandoned: false,
    },
    guestPlayer: {
        name: '',
        socketId: '',
        rack: { content: [] },
        points: 0,
        isTurn: true,
        abandoned: false,
    },
    gameState: GAME_STATE,
    timer: TIMER,
    board: EMPTY_BOARD,
    nbOfTurns: 0,
    reserve: RESERVE,
    nbSkippedTurns: 0,
    gameOptions: DEFAULT_GAME_OPTIONS,
    objectives: [],
};

export const FROM_SYSTEM: string = 'Système';
export const SYSTEM_MESSAGE_COLOR: string = 'red';
