import { DATABASE_COLLECTION_GAME_HISTORY } from '@app/classes/constants/database-constant';
import { Room } from '@app/classes/interfaces/room';
import { DatabaseService } from '@app/services/database/database.service';
import { GameHistory, GameHistoryClient, PlayerHistory } from '@common/interfaces/game-history';
import { Player } from '@common/interfaces/player';
import { Collection, Filter } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';

const MILLISECONDS_IN_SECOND = 1000;

@Service()
export class GamesHistoryService {
    constructor(private databaseService: DatabaseService) {}

    get collection(): Collection<GameHistory> {
        return this.databaseService.database.collection(DATABASE_COLLECTION_GAME_HISTORY);
    }

    async getGamesHistory(): Promise<GameHistoryClient[]> {
        const setQuery: Filter<GameHistory> = { $set: { id: '$_id' } };
        const unsetQuery: Filter<GameHistory> = { $unset: '_id' };
        return this.collection
            .aggregate([setQuery, unsetQuery])
            .toArray()
            .then((gamesHistory: GameHistoryClient[]) => {
                return gamesHistory;
            });
    }

    async addGameHistory(gameHistory: GameHistory): Promise<void> {
        return this.collection
            .insertOne(gameHistory)
            .then(() => {
                return;
            })
            .catch(() => {
                throw new Error('Failed to create document');
            });
    }

    async deleteGamesHistory(): Promise<void> {
        return this.collection
            .deleteMany({})
            .then(() => {
                return;
            })
            .catch(() => {
                throw new Error('Failed to delete documents of collection');
            });
    }

    extractGameHistory(room: Room): void {
        const firstPlayer: PlayerHistory = this.extractPlayerHistory(room.hostPlayer);
        const secondPlayer: PlayerHistory = this.extractPlayerHistory(room.guestPlayer);
        const dateBegin: Date = new Date(room.dateBegin);
        const dateEnd: Date = new Date();
        const gameDuration = Math.floor((dateEnd.getTime() - dateBegin.getTime()) / MILLISECONDS_IN_SECOND);

        const gameHistory: GameHistory = {
            dateBegin,
            dateEnd,
            gameDuration,
            firstPlayer,
            secondPlayer,
            gameMode: room.gameOptions.gameType,
            wasAbandoned: room.hostPlayer.abandoned,
        };
        this.addGameHistory(gameHistory);
    }

    private extractPlayerHistory(player: Player): PlayerHistory {
        return { name: player.name, score: player.points };
    }
}
