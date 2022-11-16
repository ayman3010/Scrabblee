import { DATABASE_COLLECTION_HIGH_SCORES, NUMBER_OF_HIGHEST_SCORES } from '@app/classes/constants/database-constant';
import { Room } from '@app/classes/interfaces/room';
import { DatabaseService } from '@app/services/database/database.service';
import { PLAYER_NAME_LENGTH_MAX, PLAYER_NAME_LENGTH_MIN } from '@common/constants/game-options-constants';
import { GameType } from '@common/enums/enums';
import { HighScore, HighScoreClient } from '@common/interfaces/high-score';
import { Player } from '@common/interfaces/player';
import { Collection, Filter, UpdateFilter } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';

/* Code inspired by the courses.service.ts of mongodb-example by Nikolay Radoev
 * Gitlab repository : https://gitlab.com/nikolayradoev/mongodb-example/-/blob/master/src/services/courses.service.ts */

@Service()
export class HighScoresService {
    constructor(private databaseService: DatabaseService) {}

    get collection(): Collection<HighScore> {
        return this.databaseService.database.collection(DATABASE_COLLECTION_HIGH_SCORES);
    }

    async getHighestHighScores(gameMode: GameType): Promise<HighScoreClient[]> {
        const filterQuery: Filter<HighScore> = { $match: { gameMode } };
        const groupQuery: Filter<HighScore> = { $group: { _id: '$score', names: { $push: '$name' } } };
        const projectQuery: Filter<HighScore> = { $project: { score: '$_id', names: '$names', _id: false } };
        return this.collection
            .aggregate([filterQuery, groupQuery, projectQuery])
            .sort({ score: -1 })
            .limit(NUMBER_OF_HIGHEST_SCORES)
            .toArray()
            .then((highScores: HighScoreClient[]) => {
                return highScores;
            });
    }

    extractHighScoreFromRoom(room: Room): void {
        if (!room.gameOptions.singlePlayer) this.extractHighScoreFromPlayer(room.guestPlayer, room.gameOptions.gameType);
        this.extractHighScoreFromPlayer(room.hostPlayer, room.gameOptions.gameType);
    }

    async deleteAllHighScores(): Promise<void> {
        return this.collection
            .deleteMany({})
            .then(() => {
                return;
            })
            .catch(() => {
                throw new Error('Failed to delete documents of collection');
            });
    }

    async populateDefaultHighScores() {
        await this.databaseService.populateHighScores();
    }

    async modifyHighScore(highScore: HighScore): Promise<void> {
        if (!this.validateName(highScore.name)) return;

        const filterQuery: Filter<HighScore> = { gameMode: highScore.gameMode, name: highScore.name };
        const updateQuery: UpdateFilter<HighScore> = {
            $max: {
                score: highScore.score,
            },
        };

        return this.collection
            .updateOne(filterQuery, updateQuery, { upsert: true })
            .then(() => {
                return;
            })
            .catch(() => {
                throw new Error('Failed to update document');
            });
    }

    private extractHighScoreFromPlayer(player: Player, gameMode: GameType): void {
        if (!player.abandoned) this.modifyHighScore({ name: player.name, score: player.points, gameMode });
    }

    private validateName(name: string): boolean {
        return name.length >= PLAYER_NAME_LENGTH_MIN && name.length <= PLAYER_NAME_LENGTH_MAX;
    }
}
