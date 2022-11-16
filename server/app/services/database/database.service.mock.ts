import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server-core';

/* Code based on the database.service.mock.ts of mongodb-example by Nikolay Radoev
 * Gitlab repository : https://gitlab.com/nikolayradoev/mongodb-example/-/blob/master/src/services/database.service.mock.ts */

const DATABASE_NAME = 'database';

export class DatabaseServiceMock {
    mongoServer: MongoMemoryServer;
    private db: Db;
    private client: MongoClient;

    // eslint-disable-next-line no-unused-vars
    async start(url?: string): Promise<MongoClient | null> {
        if (!this.client) {
            this.mongoServer = await MongoMemoryServer.create();
            const mongoUri = this.mongoServer.getUri();
            this.client = await MongoClient.connect(mongoUri);
            this.db = this.client.db(DATABASE_NAME);
        }

        return this.client;
    }

    async populateVirtualPlayers(): Promise<void> {
        return Promise.resolve();
    }

    async populateHighScores(): Promise<void> {
        return Promise.resolve();
    }

    async closeConnection(): Promise<void> {
        if (this.client) {
            return this.client.close();
        } else {
            return Promise.resolve();
        }
    }

    get database(): Db {
        return this.db;
    }
}
