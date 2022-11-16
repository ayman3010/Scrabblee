import { GameType } from '@common/enums/enums';
import { HighScore } from '@common/interfaces/high-score';

export const STARTING_DATABASE: HighScore[] = [
    {
        name: 'DrPhd. John Scrabble',
        score: 64,
        gameMode: GameType.CLASSIC,
    },
    {
        name: 'Dr. John Scrabble',
        score: 32,
        gameMode: GameType.CLASSIC,
    },
    {
        name: 'John Scrabble',
        score: 16,
        gameMode: GameType.CLASSIC,
    },
    {
        name: 'John Scrabble Jr.',
        score: 8,
        gameMode: GameType.CLASSIC,
    },
    {
        name: 'John Scrabble JrJr.',
        score: 4,
        gameMode: GameType.CLASSIC,
    },
    {
        name: 'DrPhd. John Scrabble',
        score: 64,
        gameMode: GameType.LOG2990,
    },
    {
        name: 'Dr. John Scrabble',
        score: 32,
        gameMode: GameType.LOG2990,
    },
    {
        name: 'John Scrabble',
        score: 16,
        gameMode: GameType.LOG2990,
    },
    {
        name: 'John Scrabble Jr.',
        score: 8,
        gameMode: GameType.LOG2990,
    },
    {
        name: 'John Scrabble JrJr.',
        score: 4,
        gameMode: GameType.LOG2990,
    },
];

export const NUMBER_OF_HIGHEST_SCORES = 5;

export const DATABASE_COLLECTION_HIGH_SCORES = 'highScores';

export const DATABASE_COLLECTION_GAME_HISTORY = 'gameHistory';

export const DATABASE_COLLECTION_VIRTUAL_PLAYER = 'virtualPlayerNames';

export const NAME_CONFLICT_ERROR_MESSAGE = 'Name already exists';

export const DICTIONARY_CONFLICT_ERROR_MESSAGE = "Le titre du dictionnaire fourni correspondait au titre d'un dictionnaire déjà existant";

export const DICTIONARY_FORMAT_ERROR_MESSAGE = 'Le dictionnaire fourni ne respectait pas le schéma de dictionnaire.';
