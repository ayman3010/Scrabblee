import { DATABASE_COLLECTION_HIGH_SCORES, DATABASE_COLLECTION_VIRTUAL_PLAYER, STARTING_DATABASE } from '@app/classes/constants/database-constant';
import { DEFAULT_VIRTUAL_PLAYERS } from '@common/constants/admin-virtual-player';
import { Db, MongoClient } from 'mongodb';
import 'reflect-metadata';
import { Service } from 'typedi';

/* Code based on the database.service.ts of mongodb-example by Nikolay Radoev
 * Gitlab repository : https://gitlab.com/nikolayradoev/mongodb-example/-/blob/master/src/services/database.service.ts */

export const DATABASE_URL =
    'mongodb+srv://JohnScrabble:8fNvAD6e7e0aN5g3@scrabblecluster.eqdnm.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
export const DATABASE_NAME = 'scrabbleDB';

@Service()
export class DatabaseService {
    private db: Db;
    private client: MongoClient;

    async start(url: string = DATABASE_URL): Promise<MongoClient | null> {
        try {
            const client = await MongoClient.connect(url);
            this.client = client;
            this.db = client.db(DATABASE_NAME);
        } catch {
            throw new Error('Database connection error');
        }

        if ((await this.db.collection(DATABASE_COLLECTION_HIGH_SCORES).countDocuments()) === 0) {
            await this.populateHighScores();
        }

        if ((await this.db.collection(DATABASE_COLLECTION_VIRTUAL_PLAYER).countDocuments()) === 0) {
            await this.populateVirtualPlayers();
        }

        return this.client;
    }

    async closeConnection(): Promise<void> {
        return this.client.close();
    }

    async populateHighScores(): Promise<void> {
        for (const highScore of STARTING_DATABASE) {
            await this.db.collection(DATABASE_COLLECTION_HIGH_SCORES).insertOne(highScore);
        }
    }

    async populateVirtualPlayers(): Promise<void> {
        await this.db.collection(DATABASE_COLLECTION_VIRTUAL_PLAYER).insertMany(DEFAULT_VIRTUAL_PLAYERS);
    }

    get database(): Db {
        return this.db;
    }
}
